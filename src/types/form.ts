/**
 * Core type definitions for the Formless form builder
 */

export type ComponentType =
  | "input"
  | "password"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "switch"
  | "slider"
  | "date"
  | "file";

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  email?: boolean;
  url?: boolean;
  customMessage?: string;
  // Date validations
  minDate?: string;
  maxDate?: string;
  // File validations
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export interface Option {
  label: string;
  value: string;
}

export interface FormComponent {
  id: string;
  type: ComponentType;
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: any;
  validation: ValidationRules;
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  maxSize?: number;
  // Layout positioning for react-grid-layout
  layout?: {
    x: number; // Column position (0-11)
    y: number; // Row position
    w: number; // Width in columns (1-12)
    h: number; // Height in rows
  };
}

export interface FormSchema {
  version: string;
  components: FormComponent[];
  metadata?: {
    createdAt: string;
    updatedAt: string;
    name?: string;
    description?: string;
  };
  settings?: FormSettings;
}

export interface FormSettings {
  formName?: string;
  formDescription?: string;

  showSubmitButton?: boolean;
  showCancelButton?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;

  resetOnSubmit?: boolean;
  showSuccessMessage?: boolean;
  successMessage?: string;

  formWidth?: "sm" | "md" | "lg" | "xl" | "full";
  spacing?: "compact" | "normal" | "relaxed";
}
