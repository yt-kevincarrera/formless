import { z } from "zod";
import type { FormComponent } from "@/types/form";

/**
 * Generate a Zod schema from form components for validation
 */
export function generateZodSchema(components: FormComponent[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  for (const component of components) {
    let fieldSchema: z.ZodTypeAny;

    // Base schema based on component type
    switch (component.type) {
      case "input":
      case "textarea":
        fieldSchema = z.string();

        // Apply string validations
        if (component.validation.minLength !== undefined) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            component.validation.minLength,
            component.validation.customMessage ||
              `Minimum length is ${component.validation.minLength}`
          );
        }

        if (component.validation.maxLength !== undefined) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            component.validation.maxLength,
            component.validation.customMessage ||
              `Maximum length is ${component.validation.maxLength}`
          );
        }

        if (component.validation.pattern) {
          try {
            const regex = new RegExp(component.validation.pattern);
            fieldSchema = (fieldSchema as z.ZodString).regex(
              regex,
              component.validation.customMessage || "Invalid format"
            );
          } catch (e) {
            console.warn(`Invalid regex pattern for ${component.name}:`, e);
          }
        }
        break;

      case "select":
        if (component.options && component.options.length > 0) {
          const values = component.options.map((opt) => opt.value) as [
            string,
            ...string[]
          ];
          fieldSchema = z.enum(values);
        } else {
          fieldSchema = z.string();
        }
        break;

      case "checkbox":
      case "switch":
        fieldSchema = z.boolean();
        break;

      case "radio":
        if (component.options && component.options.length > 0) {
          const values = component.options.map((opt) => opt.value) as [
            string,
            ...string[]
          ];
          fieldSchema = z.enum(values);
        } else {
          fieldSchema = z.string();
        }
        break;

      case "slider":
        fieldSchema = z.number();

        if (
          component.validation.min !== undefined ||
          component.min !== undefined
        ) {
          const minValue = component.validation.min ?? component.min ?? 0;
          fieldSchema = (fieldSchema as z.ZodNumber).min(
            minValue,
            component.validation.customMessage || `Minimum value is ${minValue}`
          );
        }

        if (
          component.validation.max !== undefined ||
          component.max !== undefined
        ) {
          const maxValue = component.validation.max ?? component.max ?? 100;
          fieldSchema = (fieldSchema as z.ZodNumber).max(
            maxValue,
            component.validation.customMessage || `Maximum value is ${maxValue}`
          );
        }
        break;

      case "date":
        fieldSchema = z.string();
        break;

      case "file":
        // For file inputs, we'll validate the file object
        fieldSchema = z.any();
        break;

      default:
        fieldSchema = z.any();
    }

    // Apply required/optional
    if (component.validation.required) {
      // For strings, also check for empty strings
      if (component.type === "input" || component.type === "textarea") {
        fieldSchema = (fieldSchema as z.ZodString).min(
          1,
          "This field is required"
        );
      }
    } else {
      fieldSchema = fieldSchema.optional();
    }

    schemaFields[component.name] = fieldSchema;
  }

  return z.object(schemaFields);
}

/**
 * Generate default values from form components
 */
export function generateDefaultValues(components: FormComponent[]) {
  const defaultValues: Record<string, any> = {};

  for (const component of components) {
    if (component.defaultValue !== undefined) {
      defaultValues[component.name] = component.defaultValue;
    } else {
      // Set sensible defaults based on type
      switch (component.type) {
        case "input":
        case "textarea":
        case "select":
        case "radio":
        case "date":
          defaultValues[component.name] = "";
          break;
        case "checkbox":
        case "switch":
          defaultValues[component.name] = false;
          break;
        case "slider":
          defaultValues[component.name] = component.min ?? 0;
          break;
        case "file":
          defaultValues[component.name] = undefined;
          break;
      }
    }
  }

  return defaultValues;
}
