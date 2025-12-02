import type { FormComponent } from "../types/form";

/**
 * Generate React Hook Form setup code string from form components
 * This function creates the useForm hook setup with zodResolver and field registrations
 */
export function generateRHFSetup(components: FormComponent[]): string {
  if (components.length === 0) {
    return generateEmptySetup();
  }

  const imports = generateRHFImports(components);
  const hookSetup = generateUseFormHook(components);
  const defaultValues = generateDefaultValuesCode(components);
  const fieldRegistrations = generateFieldRegistrations(components);

  return `${imports}

${hookSetup}

${defaultValues}

${fieldRegistrations}`;
}

/**
 * Generate empty setup when no fields are present
 */
function generateEmptySetup(): string {
  return `import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, type FormData } from "./schema";

// Initialize form with empty schema
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {},
});
`;
}

/**
 * Generate all necessary imports for React Hook Form setup
 */
function generateRHFImports(components: FormComponent[]): string {
  const imports = new Set<string>();

  // Always include base imports
  imports.add('import { useForm } from "react-hook-form";');
  imports.add('import { zodResolver } from "@hookform/resolvers/zod";');
  imports.add('import { formSchema, type FormData } from "./schema";');

  // Check if we need Controller for complex components
  const needsController = components.some(
    (c) => c.type === "select" || c.type === "date" || c.type === "file"
  );

  if (needsController) {
    imports.add('import { Controller } from "react-hook-form";');
  }

  return Array.from(imports).sort().join("\n");
}

/**
 * Generate the useForm hook initialization
 */
function generateUseFormHook(components: FormComponent[]): string {
  return `// Initialize React Hook Form with Zod schema validation
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
${generateDefaultValuesObject(components)}
  },
});`;
}

/**
 * Generate the default values object for useForm
 */
function generateDefaultValuesObject(components: FormComponent[]): string {
  const defaultValueLines: string[] = [];

  for (const component of components) {
    let defaultValue: string;

    if (component.defaultValue !== undefined) {
      // Use the configured default value
      switch (component.type) {
        case "input":
        case "textarea":
        case "select":
        case "radio":
          defaultValue = `"${component.defaultValue}"`;
          break;
        case "checkbox":
        case "switch":
          defaultValue = component.defaultValue ? "true" : "false";
          break;
        case "slider":
          defaultValue = String(component.defaultValue);
          break;
        case "date":
          defaultValue = "undefined";
          break;
        case "file":
          defaultValue = "undefined";
          break;
        default:
          defaultValue = "undefined";
      }
    } else {
      // Provide sensible defaults based on type
      switch (component.type) {
        case "input":
        case "textarea":
        case "select":
        case "radio":
          defaultValue = '""';
          break;
        case "checkbox":
        case "switch":
          defaultValue = "false";
          break;
        case "slider":
          defaultValue = String(component.min || 0);
          break;
        case "date":
          defaultValue = "undefined";
          break;
        case "file":
          defaultValue = "undefined";
          break;
        default:
          defaultValue = "undefined";
      }
    }

    defaultValueLines.push(`    ${component.name}: ${defaultValue},`);
  }

  return defaultValueLines.join("\n");
}

/**
 * Generate default values code section with explanation
 */
function generateDefaultValuesCode(components: FormComponent[]): string {
  const values: string[] = [];

  for (const component of components) {
    let defaultValue: string;
    let comment = "";

    if (component.defaultValue !== undefined) {
      comment = ` // From component configuration`;
      switch (component.type) {
        case "input":
        case "textarea":
        case "select":
        case "radio":
          defaultValue = `"${component.defaultValue}"`;
          break;
        case "checkbox":
        case "switch":
          defaultValue = component.defaultValue ? "true" : "false";
          break;
        case "slider":
          defaultValue = String(component.defaultValue);
          break;
        case "date":
          defaultValue = "undefined";
          break;
        case "file":
          defaultValue = "undefined";
          break;
        default:
          defaultValue = "undefined";
      }
    } else {
      comment = ` // Default for ${component.type}`;
      switch (component.type) {
        case "input":
        case "textarea":
        case "select":
        case "radio":
          defaultValue = '""';
          break;
        case "checkbox":
        case "switch":
          defaultValue = "false";
          break;
        case "slider":
          defaultValue = String(component.min || 0);
          break;
        case "date":
          defaultValue = "undefined";
          break;
        case "file":
          defaultValue = "undefined";
          break;
        default:
          defaultValue = "undefined";
      }
    }

    values.push(`  ${component.name}: ${defaultValue},${comment}`);
  }

  return `// Default values for form fields
const defaultValues = {
${values.join("\n")}
};`;
}

/**
 * Generate field registration code for all components
 */
function generateFieldRegistrations(components: FormComponent[]): string {
  const simpleComponents: FormComponent[] = [];
  const controllerComponents: FormComponent[] = [];

  // Separate simple and complex components
  for (const component of components) {
    if (
      component.type === "select" ||
      component.type === "date" ||
      component.type === "file"
    ) {
      controllerComponents.push(component);
    } else {
      simpleComponents.push(component);
    }
  }

  const sections: string[] = [];

  // Generate simple field registrations
  if (simpleComponents.length > 0) {
    sections.push(generateSimpleFieldRegistrations(simpleComponents));
  }

  // Generate Controller components
  if (controllerComponents.length > 0) {
    sections.push(generateControllerComponents(controllerComponents));
  }

  return sections.join("\n\n");
}

/**
 * Generate registration code for simple components (input, textarea, checkbox, etc.)
 */
function generateSimpleFieldRegistrations(components: FormComponent[]): string {
  const registrations = components
    .map((component) => {
      const registration = `{...form.register("${component.name}")}`;
      return `// ${component.label} (${component.type})
<${getComponentTag(component.type)}
  ${registration}
  // ... other props
/>`;
    })
    .join("\n\n");

  return `// Simple field registrations (input, textarea, checkbox, radio, switch, slider)
// Use form.register() for these components
${registrations}`;
}

/**
 * Generate Controller components for complex fields (select, date, file)
 */
function generateControllerComponents(components: FormComponent[]): string {
  const controllers = components
    .map((component) => generateControllerCode(component))
    .join("\n\n");

  return `// Controller components for complex fields (select, date, file)
// Use Controller for these components to properly handle their values
${controllers}`;
}

/**
 * Generate Controller code for a single complex component
 */
function generateControllerCode(component: FormComponent): string {
  switch (component.type) {
    case "select":
      return generateSelectController(component);
    case "date":
      return generateDateController(component);
    case "file":
      return generateFileController(component);
    default:
      return "";
  }
}

/**
 * Generate Controller for select component
 */
function generateSelectController(component: FormComponent): string {
  const options = component.options || [];
  const optionItems = options
    .map(
      (opt) =>
        `        <SelectItem value="${opt.value}">${opt.label}</SelectItem>`
    )
    .join("\n");

  return `// ${component.label} (select)
<Controller
  name="${component.name}"
  control={form.control}
  render={({ field }) => (
    <Select onValueChange={field.onChange} defaultValue={field.value}>
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
${optionItems}
      </SelectContent>
    </Select>
  )}
/>`;
}

/**
 * Generate Controller for date picker component
 */
function generateDateController(component: FormComponent): string {
  return `// ${component.label} (date)
<Controller
  name="${component.name}"
  control={form.control}
  render={({ field }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !field.value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={field.onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )}
/>`;
}

/**
 * Generate Controller for file upload component
 */
function generateFileController(component: FormComponent): string {
  const accept =
    component.accept && component.accept !== "*"
      ? ` accept="${component.accept}"`
      : "";

  return `// ${component.label} (file)
<Controller
  name="${component.name}"
  control={form.control}
  render={({ field: { value, onChange, ...field } }) => (
    <Input
      {...field}
      type="file"${accept}
      onChange={(e) => {
        const file = e.target.files?.[0];
        onChange(file);
      }}
    />
  )}
/>`;
}

/**
 * Get the appropriate component tag for a given component type
 */
function getComponentTag(type: FormComponent["type"]): string {
  switch (type) {
    case "input":
      return "Input";
    case "textarea":
      return "Textarea";
    case "checkbox":
      return "Checkbox";
    case "radio":
      return "RadioGroup";
    case "switch":
      return "Switch";
    case "slider":
      return "Slider";
    default:
      return "Input";
  }
}
