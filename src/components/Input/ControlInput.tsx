interface ControlInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
}

const ControlInput = ({ label, value, onChange }: ControlInputProps) => (
    <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <input
            type="number"
            value={value}
            onChange={e => onChange(+e.target.value)}
            className="w-full p-2 border rounded"
        />
    </div>
);

export default ControlInput
