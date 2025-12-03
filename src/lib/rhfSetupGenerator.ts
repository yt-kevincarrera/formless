import type { FormComponent } from "../types/form";

/**
 * Generate React Hook Form setup code string from form components
 * This function creates the useForm hook setup with zodResolver using Controller pattern
 */
export function generateRHFSetup(components: FormComponent[]): string {
  if (components.length === 0) {
    return generateEmptySetup();
  }

  const imports = generateRHFImports();
  const hookSetup = generateUseFormHook(components);
  const usageExamples = generateUsageExamples(components);

  return `${imports}

${hookSetup}

${usageExamples}`;
}

/**
 * Generate empty setup when no fields are present
 */
function generateEmptySetup(): string {
  return `import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({});

// Initialize form with empty schema
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {},
});

// No fields configured yet
`;
}

/**
 * Generate all necessary imports for React Hook Form setup
 */
function generateRHFImports(): string {
  return `import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";`;
}

/**
 * Generate the useForm hook initialization
 */
function generateUseFormHook(components: FormComponent[]): string {
  return `// 1. Initialize React Hook Form with Zod schema validation
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
${generateDefaultValuesObject(components)}
  },
});

// 2. Handle form submission
function onSubmit(values: z.infer<typeof formSchema>) {
  console.log(values);
  // Process form data here
}`;
}

/**
 * Generate the default values object for useForm
 */
function generateDefaultValuesObject(components: FormComponent[]): string {
  const defaultValueLines: string[] = [];

  for (const component of components) {
    let defaultValue: string;

    if (component.defaultValue !== undefined && component.defaultValue !== "") {
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
          defaultValue = `"${component.defaultValue}"`;
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
 * Generate usage examples showing how to use Controller with Field components
 */
function generateUsageExamples(components: FormComponent[]): string {
  if (components.length === 0) {
    return "// No fields to show examples for";
  }

  // Pick first few components as examples
  const exampleComponents = components.slice(0, 3);
  const examples = exampleComponents
    .map((component) => generateFieldExample(component))
    .join("\n\n");

  return `// 3. Usage Examples - All fields use Controller with Field components

${examples}

// Wrap your form with:
// <form onSubmit={form.handleSubmit(onSubmit)}>
//   <FieldGroup>
//     {/* Your fields here */}
//     <Button type="submit">Submit</Button>
//   </FieldGroup>
// </form>`;
}

/**
 * Generate a Field example for a specific component
 */
function generateFieldExample(component: FormComponent): string {
  const placeholder = component.placeholder || "";

  switch (component.type) {
    case "input":
      return `// ${component.label} (${component.type})
<Field>
  <FieldLabel htmlFor="${component.name}">${component.label}</FieldLabel>
  <Controller
    name="${component.name}"
    control={form.control}
    render={({ field }) => (
      <Input
        id="${component.name}"
        placeholder="${placeholder}"
        {...field}
        aria-invalid={!!form.formState.errors.${component.name}}
      />
    )}
  />
  <FieldError errors={[form.formState.errors.${component.name}]} />
</Field>`;

    case "textarea":
      return `// ${component.label} (${component.type})
<Field>
  <FieldLabel htmlFor="${component.name}">${component.label}</FieldLabel>
  <Controller
    name="${component.name}"
    control={form.control}
    render={({ field }) => (
      <Textarea
        id="${component.name}"
        placeholder="${placeholder}"
        {...field}
        aria-invalid={!!form.formState.errors.${component.name}}
      />
    )}
  />
  <FieldError errors={[form.formState.errors.${component.name}]} />
</Field>`;

    case "checkbox":
      return `// ${component.label} (${component.type})
<Field orientation="horizontal">
  <Controller
    name="${component.name}"
    control={form.control}
    render={({ field }) => (
      <Checkbox
        id="${component.name}"
        checked={field.value}
        onCheckedChange={field.onChange}
        aria-invalid={!!form.formState.errors.${component.name}}
      />
    )}
  />
  <FieldLabel htmlFor="${component.name}">${component.label}</FieldLabel>
  <FieldError errors={[form.formState.errors.${component.name}]} />
</Field>`;

    case "select":
      const options = component.options || [];
      const optionItems = options
        .map(
          (opt) =>
            `          <SelectItem value="${opt.value}">${opt.label}</SelectItem>`
        )
        .join("\n");
      return `// ${component.label} (${component.type})
<Field>
  <FieldLabel htmlFor="${component.name}">${component.label}</FieldLabel>
  <Controller
    name="${component.name}"
    control={form.control}
    render={({ field }) => (
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <SelectTrigger id="${component.name}" aria-invalid={!!form.formState.errors.${component.name}}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
${optionItems}
        </SelectContent>
      </Select>
    )}
  />
  <FieldError errors={[form.formState.errors.${component.name}]} />
</Field>`;

    case "switch":
      return `// ${component.label} (${component.type})
<Field orientation="horizontal">
  <FieldLabel htmlFor="${component.name}">${component.label}</FieldLabel>
  <Controller
    name="${component.name}"
    control={form.control}
    render={({ field }) => (
      <Switch
        id="${component.name}"
        checked={field.value}
        onCheckedChange={field.onChange}
        aria-invalid={!!form.formState.errors.${component.name}}
      />
    )}
  />
  <FieldError errors={[form.formState.errors.${component.name}]} />
</Field>`;

    default:
      return `// ${component.label} (${component.type})
// See the Component tab for full implementation`;
  }
}
