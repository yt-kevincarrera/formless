/**
 * Core type definitions for the Formless form builder
 */

export type ComponentType =
  | "input"
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
  // Layout options
  width?: "full" | "half" | "third";
  order?: number;
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
  showSubmitButton?: boolean;
  showCancelButton?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
  layout?: "single" | "two-column";
}
