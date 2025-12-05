import { z } from "zod";
import type { FormComponent } from "../types/form";

/**
 * Generate Zod schema object from form components
 * This function creates an actual Zod schema that can be used for validation
 */
export function generateZodSchema(
  components: FormComponent[]
): z.ZodObject<any> {
  if (components.length === 0) {
    return z.object({});
  }

  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const component of components) {
    schemaShape[component.name] = generateFieldSchema(component);
  }

  return z.object(schemaShape);
}

/**
 * Generate Zod schema code string from form components
 * This function creates a complete Zod schema string with imports and validation rules
 */
export function generateZodSchemaCode(components: FormComponent[]): string {
  if (components.length === 0) {
    return `import { z } from "zod";

export const formSchema = z.object({});

export type FormData = z.infer<typeof formSchema>;
`;
  }

  const schemaFields: string[] = [];

  for (const component of components) {
    const fieldSchemaCode = generateFieldSchemaCode(component);
    schemaFields.push(`  ${component.name}: ${fieldSchemaCode}`);
  }

  return `import { z } from "zod";

export const formSchema = z.object({
${schemaFields.join(",\n")}
});

export type FormData = z.infer<typeof formSchema>;
`;
}

/**
 * Generate Zod schema for a single field based on component type and validation rules
 */
function generateFieldSchema(component: FormComponent): z.ZodTypeAny {
  // Map component type to Zod type
  switch (component.type) {
    case "input":
    case "password":
    case "textarea":
      return generateStringSchema(component);
    case "select":
      return generateSelectSchema(component);
    case "radio":
      return generateRadioSchema(component);
    case "checkbox":
    case "switch":
      return generateBooleanSchema(component);
    case "slider":
      return generateNumberSchema(component);
    case "date":
      return generateDateSchema(component);
    case "file":
      return generateFileSchema(component);
    default:
      return z.string();
  }
}

/**
 * Generate Zod schema code string for a single field
 */
function generateFieldSchemaCode(component: FormComponent): string {
  // Map component type to Zod type
  switch (component.type) {
    case "input":
    case "password":
    case "textarea":
      return generateStringSchemaCode(component);
    case "select":
      return generateSelectSchemaCode(component);
    case "radio":
      return generateRadioSchemaCode(component);
    case "checkbox":
    case "switch":
      return generateBooleanSchemaCode(component);
    case "slider":
      return generateNumberSchemaCode(component);
    case "date":
      return generateDateSchemaCode(component);
    case "file":
      return generateFileSchemaCode(component);
    default:
      return "z.string()";
  }
}

/**
 * Generate string schema with validation rules (runtime)
 */
function generateStringSchema(component: FormComponent): z.ZodTypeAny {
  const { validation } = component;
  let schema: z.ZodTypeAny;

  if (validation.email) {
    schema = z.email({
      message: "Must be a valid email address",
    });
  } else if (validation.url) {
    schema = z.url({
      message: "Must be a valid URL",
    });
  } else {
    schema = z.string();
  }

  // If required is explicitly true, add min(1) to reject empty strings
  if (validation.required === true) {
    schema = (schema as z.ZodString).min(1, {
      message: "This field is required",
    });
  }

  // Apply validation rules
  if (validation.minLength !== undefined) {
    const message = validation.customMessage || undefined;
    schema = (schema as z.ZodString).min(
      validation.minLength,
      message ? { message } : undefined
    );
  }

  if (validation.maxLength !== undefined) {
    const message = validation.customMessage || undefined;
    schema = (schema as z.ZodString).max(
      validation.maxLength,
      message ? { message } : undefined
    );
  }

  if (validation.pattern) {
    const message = validation.customMessage || undefined;
    schema = (schema as z.ZodString).regex(
      new RegExp(validation.pattern),
      message ? { message } : undefined
    );
  }

  // Handle optional (when required is not set or explicitly false)
  if (validation.required === undefined || validation.required === false) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Generate string schema code with validation rules
 */
function generateStringSchemaCode(component: FormComponent): string {
  const { validation } = component;
  const parts: string[] = [];

  if (validation.email) {
    parts.push('z.email({ message: "Must be a valid email address" })');
  } else if (validation.url) {
    parts.push('z.url({ message: "Must be a valid URL" })');
  } else {
    parts.push("z.string()");
  }

  if (validation.required === true) {
    parts.push(`min(1, { message: "This field is required" })`);
  }

  // Apply validation rules
  if (validation.minLength !== undefined) {
    const message = validation.customMessage
      ? `, { message: "${validation.customMessage}" }`
      : "";
    parts.push(`min(${validation.minLength}${message})`);
  }

  if (validation.maxLength !== undefined) {
    const message = validation.customMessage
      ? `, { message: "${validation.customMessage}" }`
      : "";
    parts.push(`max(${validation.maxLength}${message})`);
  }

  if (validation.pattern) {
    const message = validation.customMessage
      ? `, { message: "${validation.customMessage}" }`
      : "";
    // Escape backslashes for regex pattern
    const escapedPattern = validation.pattern.replace(/\\/g, "\\\\");
    parts.push(`regex(/${escapedPattern}/${message})`);
  }

  // Handle optional (when required is not set or explicitly false)
  if (validation.required === undefined || validation.required === false) {
    parts.push("optional()");
  }

  return parts.join(".");
}

/**
 * Generate select schema with enum values (runtime)
 */
function generateSelectSchema(component: FormComponent): z.ZodTypeAny {
  if (!component.options || component.options.length === 0) {
    return z.string();
  }

  const values = component.options.map((opt) => opt.value) as [
    string,
    ...string[]
  ];

  // Handle optional (when required is not set or explicitly false)
  if (
    component.validation.required === undefined ||
    component.validation.required === false
  ) {
    // For optional selects, allow empty string or the enum values
    let schema: z.ZodTypeAny = z.union([
      z.literal(""),
      component.validation.customMessage
        ? z.enum(values, { message: component.validation.customMessage })
        : z.enum(values),
    ]);
    return schema.optional();
  }

  // For required selects, just use enum
  let schema: z.ZodTypeAny = component.validation.customMessage
    ? z.enum(values, { message: component.validation.customMessage })
    : z.enum(values);

  return schema;
}

/**
 * Generate select schema code with enum values
 */
function generateSelectSchemaCode(component: FormComponent): string {
  if (!component.options || component.options.length === 0) {
    return "z.string()";
  }

  const values = component.options.map((opt) => `"${opt.value}"`).join(", ");
  const message = component.validation.customMessage
    ? `, { message: "${component.validation.customMessage}" }`
    : "";

  // Handle optional (when required is not set or explicitly false)
  if (
    component.validation.required === undefined ||
    component.validation.required === false
  ) {
    // For optional selects, allow empty string or the enum values
    return `z.union([z.literal(""), z.enum([${values}]${message})]).optional()`;
  }

  // For required selects, just use enum
  return `z.enum([${values}]${message})`;
}

/**
 * Generate radio schema with enum values (runtime)
 */
function generateRadioSchema(component: FormComponent): z.ZodTypeAny {
  if (!component.options || component.options.length === 0) {
    return z.string();
  }

  const values = component.options.map((opt) => opt.value) as [
    string,
    ...string[]
  ];

  // Handle optional (when required is not set or explicitly false)
  if (
    component.validation.required === undefined ||
    component.validation.required === false
  ) {
    // For optional radios, allow empty string or the enum values
    let schema: z.ZodTypeAny = z.union([
      z.literal(""),
      component.validation.customMessage
        ? z.enum(values, { message: component.validation.customMessage })
        : z.enum(values),
    ]);
    return schema.optional();
  }

  // For required radios, just use enum
  let schema: z.ZodTypeAny = component.validation.customMessage
    ? z.enum(values, { message: component.validation.customMessage })
    : z.enum(values);

  return schema;
}

/**
 * Generate radio schema code with enum values
 */
function generateRadioSchemaCode(component: FormComponent): string {
  if (!component.options || component.options.length === 0) {
    return "z.string()";
  }

  const values = component.options.map((opt) => `"${opt.value}"`).join(", ");
  const message = component.validation.customMessage
    ? `, { message: "${component.validation.customMessage}" }`
    : "";

  // Handle optional (when required is not set or explicitly false)
  if (
    component.validation.required === undefined ||
    component.validation.required === false
  ) {
    // For optional radios, allow empty string or the enum values
    return `z.union([z.literal(""), z.enum([${values}]${message})]).optional()`;
  }

  // For required radios, just use enum
  return `z.enum([${values}]${message})`;
}

/**
 * Generate boolean schema (runtime)
 */
function generateBooleanSchema(component: FormComponent): z.ZodTypeAny {
  let schema: z.ZodTypeAny = z.boolean();

  // Handle optional (when required is not set or explicitly false)
  if (
    component.validation.required === undefined ||
    component.validation.required === false
  ) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Generate boolean schema code
 */
function generateBooleanSchemaCode(component: FormComponent): string {
  const parts: string[] = ["z.boolean()"];

  // Handle optional (when required is not set or explicitly false)
  if (
    component.validation.required === undefined ||
    component.validation.required === false
  ) {
    parts.push("optional()");
  }

  return parts.join(".");
}

/**
 * Generate number schema with validation rules (runtime)
 */
function generateNumberSchema(component: FormComponent): z.ZodTypeAny {
  let schema: z.ZodTypeAny = z.number();
  const { validation } = component;

  // Apply min/max from validation or component properties
  const minValue =
    validation.min !== undefined ? validation.min : component.min;
  const maxValue =
    validation.max !== undefined ? validation.max : component.max;

  if (minValue !== undefined) {
    const message = validation.customMessage || undefined;
    schema = (schema as z.ZodNumber).min(
      minValue,
      message ? { message } : undefined
    );
  }

  if (maxValue !== undefined) {
    const message = validation.customMessage || undefined;
    schema = (schema as z.ZodNumber).max(
      maxValue,
      message ? { message } : undefined
    );
  }

  // Handle optional (when required is not set or explicitly false)
  if (validation.required === undefined || validation.required === false) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Generate number schema code with validation rules
 */
function generateNumberSchemaCode(component: FormComponent): string {
  const parts: string[] = ["z.number()"];
  const { validation } = component;

  // Apply min/max from validation or component properties
  const minValue =
    validation.min !== undefined ? validation.min : component.min;
  const maxValue =
    validation.max !== undefined ? validation.max : component.max;

  if (minValue !== undefined) {
    const message = validation.customMessage
      ? `, { message: "${validation.customMessage}" }`
      : "";
    parts.push(`min(${minValue}${message})`);
  }

  if (maxValue !== undefined) {
    const message = validation.customMessage
      ? `, { message: "${validation.customMessage}" }`
      : "";
    parts.push(`max(${maxValue}${message})`);
  }

  // Handle optional (when required is not set or explicitly false)
  if (validation.required === undefined || validation.required === false) {
    parts.push("optional()");
  }

  return parts.join(".");
}

/**
 * Generate date schema (runtime)
 */
function generateDateSchema(component: FormComponent): z.ZodTypeAny {
  let schema: z.ZodTypeAny = z.date();

  const { validation } = component;

  // Add date range validations if specified
  if (validation.minDate) {
    const minDate = new Date(validation.minDate);
    schema = (schema as z.ZodDate).min(minDate, {
      message: `Date must be after ${validation.minDate}`,
    });
  }

  if (validation.maxDate) {
    const maxDate = new Date(validation.maxDate);
    schema = (schema as z.ZodDate).max(maxDate, {
      message: `Date must be before ${validation.maxDate}`,
    });
  }

  // Handle optional (when required is not set or explicitly false)
  if (validation.required === undefined || validation.required === false) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Generate date schema code
 */
function generateDateSchemaCode(component: FormComponent): string {
  const parts: string[] = ["z.date()"];
  const { validation } = component;

  // Add date range validations if specified
  if (validation.minDate) {
    parts.push(
      `min(new Date("${validation.minDate}"), { message: "Date must be after ${validation.minDate}" })`
    );
  }

  if (validation.maxDate) {
    parts.push(
      `max(new Date("${validation.maxDate}"), { message: "Date must be before ${validation.maxDate}" })`
    );
  }

  // Handle optional (when required is not set or explicitly false)
  if (validation.required === undefined || validation.required === false) {
    parts.push("optional()");
  }

  return parts.join(".");
}

/**
 * Generate file schema with custom validation (runtime)
 */
function generateFileSchema(component: FormComponent): z.ZodTypeAny {
  let schema: z.ZodTypeAny = z.instanceof(File);

  // File validation is complex, so we use a custom refinement
  if (component.accept && component.accept !== "*") {
    const acceptTypes = component.accept.split(",").map((t) => t.trim());
    schema = (schema as z.ZodType<File>).refine(
      (file) => acceptTypes.some((type) => file.type === type),
      { message: `Invalid file type. Accepted: ${component.accept}` }
    );
  }

  // Add file size validation
  if (component.maxSize) {
    const maxSizeMB = (component.maxSize / (1024 * 1024)).toFixed(2);
    schema = (schema as z.ZodType<File>).refine(
      (file) => file.size <= component.maxSize!,
      { message: `File size must be less than ${maxSizeMB}MB` }
    );
  }

  // Handle optional (when required is not set or explicitly false)
  if (
    component.validation.required === undefined ||
    component.validation.required === false
  ) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Generate file schema code with custom validation
 */
function generateFileSchemaCode(component: FormComponent): string {
  const parts: string[] = [];

  // File validation is complex, so we use a custom refinement
  if (component.accept && component.accept !== "*") {
    const acceptTypes = component.accept.split(",").map((t) => t.trim());
    const typeCheck = acceptTypes
      .map((t) => `file.type === "${t}"`)
      .join(" || ");

    parts.push(
      `z.instanceof(File).refine((file) => ${typeCheck}, { message: "Invalid file type. Accepted: ${component.accept}" })`
    );
  } else {
    parts.push("z.instanceof(File)");
  }

  // Add file size validation
  if (component.maxSize) {
    const maxSizeMB = (component.maxSize / (1024 * 1024)).toFixed(2);
    parts.push(
      `refine((file) => file.size <= ${component.maxSize}, { message: "File size must be less than ${maxSizeMB}MB" })`
    );
  }

  // Handle optional (when required is not set or explicitly false)
  if (
    component.validation.required === undefined ||
    component.validation.required === false
  ) {
    parts.push("optional()");
  }

  return parts.join(".");
}

/**
 * Generate default values for form components
 * Used for React Hook Form initialization
 */
export function generateDefaultValues(
  components: FormComponent[]
): Record<string, any> {
  const defaults: Record<string, any> = {};

  for (const component of components) {
    if (component.defaultValue !== undefined) {
      defaults[component.name] = component.defaultValue;
    } else {
      // Provide sensible defaults based on type
      switch (component.type) {
        case "input":
        case "password":
        case "textarea":
        case "select":
        case "radio":
          defaults[component.name] = "";
          break;
        case "checkbox":
        case "switch":
          defaults[component.name] = false;
          break;
        case "slider":
          defaults[component.name] = component.min || 0;
          break;
        case "date":
          defaults[component.name] = undefined;
          break;
        case "file":
          defaults[component.name] = undefined;
          break;
      }
    }
  }

  return defaults;
}
