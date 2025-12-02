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
  customMessage?: string;
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
}
