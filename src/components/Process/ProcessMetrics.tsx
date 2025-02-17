interface ProcessMetricsProps {
    metrics: {
        produced: number;
        consumed: number;
        efficiency: number;
        throughput: number;
    };
}

const ProcessMetrics = ({ metrics }: ProcessMetricsProps) => (
    <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Produzidos</div>
            <div className="text-2xl font-bold">{metrics.produced}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Consumidos</div>
            <div className="text-2xl font-bold">{metrics.consumed}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Eficiência</div>
            <div className="text-2xl font-bold">{metrics.efficiency.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Throughput</div>
            <div className="text-2xl font-bold">{metrics.throughput.toFixed(1)}/s</div>
        </div>
    </div>
);

export default ProcessMetrics
