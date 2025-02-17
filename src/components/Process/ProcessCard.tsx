import { ProcessType } from "../../App";
import BufferVisualization from "../Buffer/BufferVisualization";
import ProcessMetrics from "./ProcessMetrics";
import ProcessStatusIndicator from "./ProcessStatusIndicator";

interface ProcessCardProps {
    process: ProcessType;
    stopProcess: (id: string) => void;
    setSelectedProcess: (process: ProcessType | null) => void;
}

const ProcessCard = ({ process, stopProcess, setSelectedProcess }: ProcessCardProps) => (
    <div
        className="bg-white rounded-xl shadow-lg p-6 relative cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedProcess(process)}
    >
        <ProcessStatusIndicator lastUpdated={process.lastUpdated} />
        <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Processo {process.id}</h2>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    stopProcess(process.id);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
                Parar
            </button>
        </div>
        <ProcessMetrics metrics={process.metrics} />
        <BufferVisualization
            bufferItems={process.bufferItems}
            bufferSize={process.metrics.bufferSize}
        />
    </div>
);

export default ProcessCard
