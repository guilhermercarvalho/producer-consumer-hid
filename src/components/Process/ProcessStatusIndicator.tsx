interface ProcessStatusIndicatorProps {
    lastUpdated?: number;
}

const POLL_INTERVAL_IN_MILISECCONDS = 3000;

const ProcessStatusIndicator = ({ lastUpdated }: ProcessStatusIndicatorProps) => (
    <div className="absolute top-4 right-4 flex items-center">
        <div
            className={`w-3 h-3 rounded-full mr-2 ${lastUpdated && Date.now() - lastUpdated > POLL_INTERVAL_IN_MILISECCONDS * 2
                ? 'bg-red-500'
                : 'bg-green-500'
                }`}
        />
        <span className="text-sm text-gray-500">
            {new Date(lastUpdated || 0).toLocaleTimeString()}
        </span>
    </div>
);

export default ProcessStatusIndicator
