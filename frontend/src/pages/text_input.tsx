// components/TextInput.tsx
import React from "react";

interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  errorText?: string;
  type?: string;
  [key: string]: string | boolean | ((text: string) => void) | undefined; // allows passing additional props like autoComplete
};

export default function TextInput({
  label,
  value,
  onChangeText,
  error = false,
  errorText = '',
  type = "text",
  ...props
}: TextInputProps) {
  return (
    <div className="mb-4">
      {label && <label className="block text-2xl text-[#442418] font-medium mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        className={`w-full px-3 py-2 border ${error ? "border-red-500" : "border-gray-300"} rounded-md`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{errorText}</p>}
    </div>
  );
}
