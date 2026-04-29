import { Input } from "@/components/ui/input";

type Props = {
  label: string;
  name: string;
  value?: string;
  onChange?: (e: any) => void;
  type?: string;
  disabled?: boolean;
  error?: string;
};

export default function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled,
  error,
}: Props) {
  return (
    <div className="flex flex-col gap-1 w-full">
      
      {/* ROW */}
      <div className="flex items-center gap-3 w-full">
        {/* LABEL */}
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
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
            className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <span className="text-xs text-red-500 ml-[calc(0.75rem+1ch)]">
          {error}
        </span>
      )}
    </div>
  );
}