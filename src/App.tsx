import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play } from 'lucide-react';
import BufferTypeSelector from './components/Buffer/BufferTypeSelector';
import ControlInput from './components/Input/ControlInput';
import PresetButton from './components/Input/PresetButton';
import ProcessCard from './components/Process/ProcessCard';
import ProcessHeader from './components/Process/ProcessHeader';
import ProcessModal from './components/Process/ProcessModal';


const API_URL = 'http://localhost:5000';
const POLL_INTERVAL_IN_MILISECCONDS = 3000

interface ProcessConfig {
    producerDelayInMilisecconds: number;
    consumerDelayInMilisecconds: number;
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
    bufferItems: string[];
    lastUpdated: number
}

export type ProcessType = ProcessStatus

function App() {
    const [processesStatus, setProcessesStatus] = useState<ProcessStatus[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<ProcessStatus | null>(null);
    const [config, setConfig] = useState<ProcessConfig>({
        producerDelayInMilisecconds: 1000,
        consumerDelayInMilisecconds: 1000,
        bufferType: 'queue'
    });

    const startProcess = async () => {
        try {
            const response = await axios.post(`${API_URL}/start`, {
                buffer_type: config.bufferType
            })

            const { process_id } = response.data

            setProcessesStatus(prev => [...prev, {
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
            }])
        } catch (error) {
            console.error(error);
        }
    }

    const stopProcess = async (processId: string) => {
        try {
            await axios.post(`${API_URL}/stop/${processId}`)
            setProcessesStatus(prev => prev.filter(p => p.id !== processId))
            if (selectedProcess?.id === processId)
                setSelectedProcess(null)
        } catch (error) {
            console.error(error);
        }
    }

    const updateProcessStatus = async (processId: string) => {
        try {
            const response = await axios.get(`${API_URL}/status/${processId}`)
            const stats = response.data

            setProcessesStatus(prev => prev.map(p => {
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
                        bufferItems: stats.buffer_items || [],
                        lastUpdated: Date.now()
                    }
                }
                return p;
            }))
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        const intervals = processesStatus.map(process => {
            return setInterval(() => {
                updateProcessStatus(process.id)
            }, POLL_INTERVAL_IN_MILISECCONDS)
        });

        return () => intervals.forEach(clearInterval)
    }, [processesStatus])

    const presetConfigs = [
        {
            name: 'Eficiente (Equilibrado)',
            config: { producerDelayInMilisecconds: 1000, consumerDelayInMilisecconds: 1000, bufferType: 'queue' }
        },
        {
            name: 'Ineficiente (Produtor Rápido)',
            config: { producerDelayInMilisecconds: 500, consumerDelayInMilisecconds: 1500, bufferType: 'queue' }
        },
        {
            name: 'Ineficiente (Consumidor Lento)',
            config: { producerDelayInMilisecconds: 1500, consumerDelayInMilisecconds: 500, bufferType: 'redis' }
        }
    ];


    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <ProcessHeader />

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="grid md:grid-cols-4 gap-4">
                        <ControlInput
                            label="Delay Produtor (ms)"
                            value={config.producerDelayInMilisecconds}
                            onChange={v => setConfig({ ...config, producerDelayInMilisecconds: v })}
                        />

                        <ControlInput
                            label="Delay Consumidor (ms)"
                            value={config.consumerDelayInMilisecconds}
                            onChange={v => setConfig({ ...config, consumerDelayInMilisecconds: v })}
                        />

                        <BufferTypeSelector
                            value={config.bufferType}
                            onChange={v => setConfig({ ...config, bufferType: v })}
                        />

                        <div className="flex items-end">
                            <button onClick={startProcess} className="...">
                                <Play className="h-4 w-4" />
                                Iniciar Processo
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {presetConfigs.map((preset, i) => (
                            <PresetButton
                                key={i}
                                name={preset.name}
                                producerDelay={preset.config.producerDelayInMilisecconds}
                                consumerDelay={preset.config.consumerDelayInMilisecconds}
                                onClick={() => setConfig(preset.config as ProcessConfig)}
                            />
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mt-8">
                    {processesStatus.map(process => (
                        <ProcessCard
                            key={process.id}
                            process={process}
                            stopProcess={stopProcess}
                            setSelectedProcess={setSelectedProcess}
                        />
                    ))}
                </div>

                <ProcessModal
                    selectedProcess={selectedProcess}
                    onClose={() => setSelectedProcess(null)}
                />
            </div>
        </div>
    );
}

export default App;
