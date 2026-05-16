import { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormField = ({ label, ...props }: FormFieldProps) => (
  <label className="field">
    <span>{label}</span>
    <input {...props} />
  </label>
);
