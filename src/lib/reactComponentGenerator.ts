import type { FormComponent } from "../types/form";

/**
 * Generate a complete React component code string from form components
 * This function creates production-ready React code using shadcn/ui Form components with Controller
 */
export function generateReactComponent(components: FormComponent[]): string {
  if (components.length === 0) {
    return generateEmptyComponent();
  }

  const imports = generateImports(components);
  const schemaName = "formSchema";
  const componentBody = generateComponentBody(components, schemaName);

  return `${imports}

${componentBody}`;
}

/**
 * Generate empty component when no fields are present
 */
function generateEmptyComponent(): string {
  return `export default function GeneratedForm() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <p className="text-muted-foreground">No form fields configured</p>
    </div>
  );
}
`;
}

/**
 * Generate all necessary imports based on components used
 */
function generateImports(components: FormComponent[]): string {
  const imports = new Set<string>();

  // Always include these base imports for React Hook Form and shadcn Form
  imports.add('import { useForm } from "react-hook-form";');
  imports.add('import { zodResolver } from "@hookform/resolvers/zod";');
  imports.add('import * as z from "zod";');
  imports.add('import { Button } from "@/components/ui/button";');
  imports.add(
    'import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";'
  );

  // Determine which shadcn/ui components are needed
  for (const component of components) {
    switch (component.type) {
      case "input":
        imports.add('import { Input } from "@/components/ui/input";');
        break;
      case "textarea":
        imports.add('import { Textarea } from "@/components/ui/textarea";');
        break;
      case "select":
        imports.add(
          'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";'
        );
        break;
      case "checkbox":
        imports.add('import { Checkbox } from "@/components/ui/checkbox";');
        break;
      case "radio":
        imports.add(
          'import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";'
        );
        imports.add('import { Label } from "@/components/ui/label";');
        break;
      case "switch":
        imports.add('import { Switch } from "@/components/ui/switch";');
        break;
      case "slider":
        imports.add('import { Slider } from "@/components/ui/slider";');
        break;
      case "date":
        imports.add('import { Calendar } from "@/components/ui/calendar";');
        imports.add(
          'import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";'
        );
        imports.add('import { CalendarIcon } from "lucide-react";');
        imports.add('import { format } from "date-fns";');
        imports.add('import { cn } from "@/lib/utils";');
        break;
      case "file":
        imports.add('import { Input } from "@/components/ui/input";');
        break;
    }
  }

  return Array.from(imports).sort().join("\n");
}

/**
 * Generate the main component body with all form fields using React Hook Form
 */
function generateComponentBody(
  components: FormComponent[],
  schemaName: string
): string {
  const zodSchema = generateInlineZodSchema(components);
  const defaultValues = generateInlineDefaultValues(components);
  const fields = components
    .map((component) => generateFormFieldJSX(component))
    .join("\n\n");

  return `const ${schemaName} = ${zodSchema};

export default function GeneratedForm() {
  const form = useForm<z.infer<typeof ${schemaName}>>({
    resolver: zodResolver(${schemaName}),
    defaultValues: ${defaultValues},
  });

  function onSubmit(values: z.infer<typeof ${schemaName}>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto p-6 space-y-6">
${indentLines(fields, 8)}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
`;
}

/**
 * Generate inline Zod schema for the form
 */
function generateInlineZodSchema(components: FormComponent[]): string {
  const fields = components.map((component) => {
    let schema = "";
    const name = component.name;

    switch (component.type) {
      case "input":
      case "textarea":
        schema = "z.string()";
        if (component.validation.minLength) {
          schema += `.min(${component.validation.minLength})`;
        }
        if (component.validation.maxLength) {
          schema += `.max(${component.validation.maxLength})`;
        }
        if (component.validation.pattern) {
          const escapedPattern = component.validation.pattern.replace(
            /\\/g,
            "\\\\"
          );
          schema += `.regex(/${escapedPattern}/)`;
        }
        break;
      case "checkbox":
      case "switch":
        schema = "z.boolean()";
        break;
      case "select":
      case "radio":
        schema = "z.string()";
        break;
      case "slider":
        schema = "z.number()";
        if (component.validation.min !== undefined) {
          schema += `.min(${component.validation.min})`;
        }
        if (component.validation.max !== undefined) {
          schema += `.max(${component.validation.max})`;
        }
        break;
      case "date":
        schema = "z.date()";
        break;
      case "file":
        schema = "z.any()";
        break;
      default:
        schema = "z.string()";
    }

    if (!component.validation.required) {
      schema += ".optional()";
    }

    return `  ${name}: ${schema}`;
  });

  return `z.object({\n${fields.join(",\n")}\n})`;
}

/**
 * Generate inline default values for the form
 */
function generateInlineDefaultValues(components: FormComponent[]): string {
  const values = components.map((component) => {
    let value = "";
    const name = component.name;

    switch (component.type) {
      case "checkbox":
      case "switch":
        value = component.defaultValue ? "true" : "false";
        break;
      case "slider":
        value = String(component.defaultValue ?? component.min ?? 0);
        break;
      default:
        value = component.defaultValue ? `"${component.defaultValue}"` : '""';
    }

    return `    ${name}: ${value}`;
  });

  return `{\n${values.join(",\n")}\n  }`;
}

/**
 * Generate FormField JSX for a single form field based on component type
 */
function generateFormFieldJSX(component: FormComponent): string {
  switch (component.type) {
    case "input":
      return generateInputFormField(component);
    case "textarea":
      return generateTextareaFormField(component);
    case "select":
      return generateSelectFormField(component);
    case "checkbox":
      return generateCheckboxFormField(component);
    case "radio":
      return generateRadioFormField(component);
    case "switch":
      return generateSwitchFormField(component);
    case "slider":
      return generateSliderFormField(component);
    case "date":
      return generateDateFormField(component);
    case "file":
      return generateFileFormField(component);
    default:
      return "";
  }
}

/**
 * Generate FormField for input component
 */
function generateInputFormField(component: FormComponent): string {
  const placeholder = component.placeholder || "";

  return `<FormField
  control={form.control}
  name="${component.name}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${component.label}</FormLabel>
      <FormControl>
        <Input placeholder="${placeholder}" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>`;
}

/**
 * Generate FormField for textarea component
 */
function generateTextareaFormField(component: FormComponent): string {
  const placeholder = component.placeholder || "";

  return `<FormField
  control={form.control}
  name="${component.name}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${component.label}</FormLabel>
      <FormControl>
        <Textarea placeholder="${placeholder}" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>`;
}

/**
 * Generate FormField for select component
 */
function generateSelectFormField(component: FormComponent): string {
  const options = component.options || [];
  const optionItems = options
    .map(
      (opt) =>
        `            <SelectItem value="${opt.value}">${opt.label}</SelectItem>`
    )
    .join("\n");

  return `<FormField
  control={form.control}
  name="${component.name}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${component.label}</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
${optionItems}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>`;
}

/**
 * Generate FormField for checkbox component
 */
function generateCheckboxFormField(component: FormComponent): string {
  return `<FormField
  control={form.control}
  name="${component.name}"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>${component.label}</FormLabel>
      </div>
    </FormItem>
  )}
/>`;
}

/**
 * Generate FormField for radio component
 */
function generateRadioFormField(component: FormComponent): string {
  const options = component.options || [];
  const radioItems = options
    .map(
      (
        opt
      ) => `            <FormItem className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <RadioGroupItem value="${opt.value}" />
              </FormControl>
              <FormLabel className="font-normal">${opt.label}</FormLabel>
            </FormItem>`
    )
    .join("\n");

  return `<FormField
  control={form.control}
  name="${component.name}"
  render={({ field }) => (
    <FormItem className="space-y-3">
      <FormLabel>${component.label}</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={field.onChange}
          defaultValue={field.value}
          className="flex flex-col space-y-1"
        >
${radioItems}
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>`;
}

/**
 * Generate FormField for switch component
 */
function generateSwitchFormField(component: FormComponent): string {
  return `<FormField
  control={form.control}
  name="${component.name}"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel className="text-base">${component.label}</FormLabel>
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>`;
}

/**
 * Generate FormField for slider component
 */
function generateSliderFormField(component: FormComponent): string {
  const min = component.min ?? 0;
  const max = component.max ?? 100;
  const step = component.step ?? 1;

  return `<FormField
  control={form.control}
  name="${component.name}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${component.label}</FormLabel>
      <FormControl>
        <Slider
          min={${min}}
          max={${max}}
          step={${step}}
          defaultValue={[field.value]}
          onValueChange={(vals) => field.onChange(vals[0])}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>`;
}

/**
 * Generate FormField for date picker component
 */
function generateDateFormField(component: FormComponent): string {
  return `<FormField
  control={form.control}
  name="${component.name}"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>${component.label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>`;
}

/**
 * Generate FormField for file upload component
 */
function generateFileFormField(component: FormComponent): string {
  const accept =
    component.accept && component.accept !== "*" ? component.accept : "";

  return `<FormField
  control={form.control}
  name="${component.name}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${component.label}</FormLabel>
      <FormControl>
        <Input
          type="file"
          accept="${accept}"
          onChange={(e) => field.onChange(e.target.files)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>`;
}

/**
 * Utility function to indent lines by a specified number of spaces
 */
function indentLines(text: string, spaces: number): string {
  const indent = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.trim() ? indent + line : line))
    .join("\n");
}
