import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  options: Option[];
  label?: string; // ✅ added
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function CustomSelect({
  options,
  label,
  placeholder = "Select...",
  value,
  onChange,
  className,
}: CustomSelectProps) {
  return (
    <div className={`w-full flex flex-col gap-1 ${className || ""}`}>
      {/* ✅ LABEL */}
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* ✅ SELECT */}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
