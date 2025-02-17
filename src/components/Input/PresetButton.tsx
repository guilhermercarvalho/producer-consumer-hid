interface PresetButtonProps {
    name: string;
    producerDelay: number;
    consumerDelay: number;
    onClick: () => void;
}

const PresetButton = ({ name, producerDelay, consumerDelay, onClick }: PresetButtonProps) => (
    <button
        onClick={onClick}
        className="text-left p-3 border rounded hover:bg-gray-50 transition-colors"
    >
        <div className="font-medium mb-1">{name}</div>
        <div className="text-sm text-gray-600">
            Prod: {producerDelay}ms / Cons: {consumerDelay}ms
        </div>
    </button>
);

export default PresetButton
