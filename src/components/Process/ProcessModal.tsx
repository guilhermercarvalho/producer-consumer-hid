import { ProcessType } from "../../App";
import BufferVisualization from "../Buffer/BufferVisualization";
import ProcessMetrics from "./ProcessMetrics";

interface ProcessModalProps {
    selectedProcess: ProcessType | null;
    onClose: () => void;
}

const ProcessModal = ({ selectedProcess, onClose }: ProcessModalProps) => (
    selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
                <h2 className="text-xl font-bold mb-4">Detalhes do Processo {selectedProcess.id}</h2>
                <ProcessMetrics metrics={selectedProcess.metrics} />
                <BufferVisualization
                    bufferItems={selectedProcess.bufferItems}
                    bufferSize={selectedProcess.metrics.bufferSize}
                />
            </div>
        </div>
    )
);

export default ProcessModal
