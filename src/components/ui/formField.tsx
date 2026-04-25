import { Input } from "@/components/ui/input";

type Props = {
  label: string;
  name: string;
  value?: string;
  onChange?: (e: any) => void;
  type?: string;
  disabled?: boolean;
};

export default function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled,
}: Props) {
  return (
    <div className="flex items-center gap-1">
      {/* LABEL */}
      <label className="w-auto text-sm  font-medium text-gray-700">
        {label}:
      </label>

      {/* INPUT */}
      <div className="flex-1">
        <Input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}