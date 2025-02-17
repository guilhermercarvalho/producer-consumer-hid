import { Package } from "lucide-react";

interface BufferVisualizationProps {
    bufferItems: unknown[];
    bufferSize: number;
}

const BufferVisualization = ({ bufferItems, bufferSize }: BufferVisualizationProps) => (
    <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Buffer ({bufferSize})</span>
        </div>
        <div className="grid grid-cols-10 gap-1">
            {bufferItems.map((_, index) => (
                <div
                    key={index}
                    className="aspect-square bg-blue-100 rounded-sm animate-pulse"
                />
            ))}
            {Array.from({ length: 10 - bufferItems.length }).map((_, index) => (
                <div
                    key={`empty-${index}`}
                    className="aspect-square bg-gray-100 rounded-sm"
                />
            ))}
        </div>
    </div>
);

export default BufferVisualization
