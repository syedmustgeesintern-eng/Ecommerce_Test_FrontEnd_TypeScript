import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Spinner } from "./spinner";

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean; 
};

type Props = {
  title: string;
  fields: Field[];
  formData: any;
  onChange: (e: any) => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onSave?: () => void;
  loading?: boolean;
};

function ReusableSection({
  title,
  fields,
  formData,
  onChange,
  isEditing,
  setIsEditing,
  onSave,
  loading = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ VALIDATION
  const validate = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ HANDLE SAVE
  const handleSaveClick = () => {
    if (!validate()) return;
    onSave?.();
  };

  return (
    <div className="border-t pt-4 w-full">
      {/* TITLE */}
      <p
        className="cursor-pointer font-medium text-blue-600"
        onClick={() => setOpen(!open)}
      >
        {title}
      </p>

      {/* CONTENT */}
      {open && (
        <div className="mt-4 space-y-3">
          {fields.map((field) => (
            <div key={field.name}>
              <label>{field.label}</label>

              <Input
                name={field.name}
                type={field.type || "text"}
                value={formData[field.name] || ""}
                onChange={onChange}
                disabled={!isEditing || loading}
              />

              {/* ERROR */}
              {errors[field.name] && (
                <p className="text-red-500 text-sm">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          {/* ACTIONS */}
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveClick}
                disabled={loading || !onSave}
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReusableSection;