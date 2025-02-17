import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Activity, Zap, Play, StopCircle, Box, Package } from 'lucide-react';

Chart.register(...registerables);

const API_URL = 'http://localhost:5000';
const POLL_INTERVAL = 3000; // Intervalo de 3 segundos

interface ProcessConfig {
    producerDelay: number;
    consumerDelay: number;
    bufferType: 'queue' | 'redis';
}

interface ProcessStatus {
    id: string;
    config: ProcessConfig;
    metrics: {
        produced: number;
        consumed: number;
        bufferSize: number;
        throughput: number;
        efficiency: number;
    };
    history: {
        time: number;
        bufferSize: number;
        throughput: number;
    }[];
    bufferItems: string[];
    lastUpdated?: number;
}

function App() {
    const [processes, setProcesses] = useState<ProcessStatus[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<ProcessStatus | null>(null);
    const [config, setConfig] = useState<ProcessConfig>({
        producerDelay: 1000,
        consumerDelay: 1500,
        bufferType: 'queue'
    });

    // Iniciar novo processo
    const startProcess = async () => {
        try {
            const response = await fetch(`${API_URL}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buffer_type: config.bufferType,
                    producer_rate: config.producerDelay,
                    consumer_rate: config.consumerDelay
                })
            });

            const { process_id } = await response.json();

            setProcesses(prev => [...prev, {
                id: process_id,
                config: { ...config },
                metrics: {
                    produced: 0,
                    consumed: 0,
                    bufferSize: 0,
                    throughput: 0,
                    efficiency: 0
                },
                history: [],
                bufferItems: [],
                lastUpdated: Date.now()
            }]);

        } catch (error) {
            console.error('Erro ao iniciar processo:', error);
        }
    };

    // Parar processo existente
    const stopProcess = async (processId: string) => {
        try {
            await fetch(`${API_URL}/stop/${processId}`, { method: 'POST' });
            setProcesses(prev => prev.filter(p => p.id !== processId));
            if (selectedProcess?.id === processId) {
                setSelectedProcess(null);
            }
        } catch (error) {
            console.error('Erro ao parar processo:', error);
        }
    };

    // Atualizar status de um processo individual
    const updateProcessStatus = async (processId: string) => {
        try {
            const response = await fetch(`${API_URL}/status/${processId}`);
            const stats = await response.json();

            setProcesses(prev => prev.map(p => {
                if (p.id === processId) {
                    const efficiency = stats.consumed > 0
                        ? (stats.consumed / stats.produced) * 100
                        : 0;

                    return {
                        ...p,
                        metrics: {
                            produced: stats.produced,
                            consumed: stats.consumed,
                            bufferSize: stats.buffer_size,
                            throughput: stats.throughput,
                            efficiency
                        },
                        history: [
                            ...p.history,
                            {
                                time: Date.now(),
                                bufferSize: stats.buffer_size,
                                throughput: stats.throughput
                            }
                        ].slice(-30),
                        bufferItems: stats.buffer_items || [],
                        lastUpdated: Date.now()
                    };
                }
                return p;
            }));
        } catch (error) {
            console.error(`Erro ao atualizar processo ${processId}:`, error);
        }
    };

    // Configurar intervalos de atualização
    useEffect(() => {
        const intervals = processes.map(process => {
            return setInterval(() => {
                updateProcessStatus(process.id);
            }, POLL_INTERVAL);
        });

        return () => intervals.forEach(clearInterval);
    }, [processes]);

    const presetConfigs = [
        {
            name: 'Eficiente (Equilibrado)',
            config: { producerDelay: 1000, consumerDelay: 1000, bufferType: 'queue' }
        },
        {
            name: 'Ineficiente (Produtor Rápido)',
            config: { producerDelay: 500, consumerDelay: 1500, bufferType: 'queue' }
        },
        {
            name: 'Ineficiente (Consumidor Lento)',
            config: { producerDelay: 1500, consumerDelay: 500, bufferType: 'redis' }
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 flex items-center gap-4">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold">Simulação de Eficiência Produtor-Consumidor</h1>
                </div>

                {/* Controles */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Delay Produtor (ms)</label>
                            <input
                                type="number"
                                value={config.producerDelay}
                                onChange={e => setConfig({ ...config, producerDelay: +e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Delay Consumidor (ms)</label>
                            <input
                                type="number"
                                value={config.consumerDelay}
                                onChange={e => setConfig({ ...config, consumerDelay: +e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tipo de Buffer</label>
                            <select
                                value={config.bufferType}
                                onChange={e => setConfig({ ...config, bufferType: e.target.value as 'queue' | 'redis' })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="queue">Queue</option>
                                <option value="redis">Redis</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={startProcess}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <Play className="h-4 w-4" />
                                Iniciar Processo
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {presetConfigs.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => setConfig(preset.config as ProcessConfig)}
                                className="text-left p-3 border rounded hover:bg-gray-50 transition-colors"
                            >
                                <div className="font-medium mb-1">{preset.name}</div>
                                <div className="text-sm text-gray-600">
                                    Prod: {preset.config.producerDelay}ms / Cons: {preset.config.consumerDelay}ms
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de Processos Ativos */}
                <div className="grid lg:grid-cols-2 gap-6 mt-8">
                    {processes.map(process => (
                        <div
                            key={process.id}
                            className="bg-white rounded-xl shadow-lg p-6 relative"
                        >
                            {/* Indicador de Status */}
                            <div className="absolute top-4 right-4 flex items-center">
                                <div
                                    className={`w-3 h-3 rounded-full mr-2 ${process.lastUpdated && Date.now() - process.lastUpdated > POLL_INTERVAL * 2
                                            ? 'bg-red-500'
                                            : 'bg-green-500'
                                        }`}
                                />
                                <span className="text-sm text-gray-500">
                                    {new Date(process.lastUpdated || 0).toLocaleTimeString()}
                                </span>
                            </div>

                            {/* Cabeçalho do Processo */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                        Processo {process.id.slice(0, 6)}
                                    </h3>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {process.config.bufferType.toUpperCase()} |
                                        Produção: {process.config.producerDelay}ms |
                                        Consumo: {process.config.consumerDelay}ms
                                    </div>
                                </div>
                                <button
                                    onClick={() => stopProcess(process.id)}
                                    className="text-red-600 hover:text-red-700 flex items-center gap-1 mt-5"
                                >
                                    <StopCircle className="h-5 w-5" />
                                    Parar
                                </button>
                            </div>

                            {/* Visualização do Buffer em Tempo Real */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium">Buffer ({process.metrics.bufferSize})</span>
                                </div>
                                <div className="grid grid-cols-10 gap-1">
                                    {process.bufferItems.map((_, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square bg-blue-100 rounded-sm animate-pulse"
                                        />
                                    ))}
                                    {Array.from({ length: 10 - process.bufferItems.length }).map((_, index) => (
                                        <div
                                            key={`empty-${index}`}
                                            className="aspect-square bg-gray-100 rounded-sm"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Estatísticas Chave */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xs text-blue-700 mb-1">Produzidos</div>
                                    <div className="text-xl font-bold text-blue-700">
                                        {process.metrics.produced}
                                    </div>
                                </div>

                                <div className="p-3 bg-green-50 rounded-lg">
                                    <div className="text-xs text-green-700 mb-1">Consumidos</div>
                                    <div className="text-xl font-bold text-green-700">
                                        {process.metrics.consumed}
                                    </div>
                                </div>

                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <div className="text-xs text-purple-700 mb-1">Eficiência</div>
                                    <div className="text-xl font-bold text-purple-700">
                                        {process.metrics.efficiency.toFixed(1)}%
                                    </div>
                                </div>

                                <div className="p-3 bg-orange-50 rounded-lg">
                                    <div className="text-xs text-orange-700 mb-1">Throughput</div>
                                    <div className="text-xl font-bold text-orange-700">
                                        {process.metrics.throughput.toFixed(1)}/s
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal de Detalhes */}
                {selectedProcess && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Zap className="h-6 w-6 text-blue-600" />
                                    Detalhes do Processo {selectedProcess.id.slice(0, 6)}
                                </h2>
                                <button
                                    onClick={() => setSelectedProcess(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Fechar
                                </button>
                            </div>

                            {/* Representação do Buffer */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    Estado do Buffer
                                </h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {selectedProcess.bufferItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square rounded-lg bg-white shadow-sm flex items-center justify-center"
                                        >
                                            <Box className="h-5 w-5 text-blue-600" />
                                        </div>
                                    ))}
                                    {[...Array(10 - selectedProcess.bufferItems.length)].map((_, index) => (
                                        <div
                                            key={`empty-${index}`}
                                            className="aspect-square rounded-lg bg-gray-100 border-2 border-dashed border-gray-300"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Gráficos */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        Métricas ao Longo do Tempo
                                    </h3>
                                    <div className="h-64">
                                        <Line
                                            data={{
                                                labels: selectedProcess.history.map(p => new Date(p.time).toLocaleTimeString()),
                                                datasets: [
                                                    {
                                                        label: 'Tamanho do Buffer',
                                                        data: selectedProcess.history.map(p => p.bufferSize),
                                                        borderColor: '#3b82f6',
                                                        tension: 0.2
                                                    },
                                                    {
                                                        label: 'Throughput (itens/seg)',
                                                        data: selectedProcess.history.map(p => p.throughput),
                                                        borderColor: '#10b981',
                                                        tension: 0.2
                                                    }
                                                ]
                                            }}
                                            options={{ responsive: true, maintainAspectRatio: false }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
