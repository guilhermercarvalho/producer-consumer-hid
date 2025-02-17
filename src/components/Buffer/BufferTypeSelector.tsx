interface BufferTypeSelectorProps {
    value: 'queue' | 'redis';
    onChange: (value: 'queue' | 'redis') => void;
}

const BufferTypeSelector = ({ value, onChange }: BufferTypeSelectorProps) => (
    <div>
        <label className="block text-sm font-medium mb-2">Tipo de Buffer</label>
        <select
            value={value}
            onChange={e => onChange(e.target.value as 'queue' | 'redis')}
            className="w-full p-2 border rounded"
        >
            <option value="queue">Queue</option>
            <option value="redis">Redis</option>
        </select>
    </div>
);

export default BufferTypeSelector
