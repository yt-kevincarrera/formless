import type { FormComponent } from "../types/form";

/**
 * Generate a complete React component code string from form components
 * This function creates production-ready React code using shadcn/ui Form components with Controller
 */
export function generateReactComponent(
  components: FormComponent[],
  settings?: any
): string {
  if (components.length === 0) {
    return generateEmptyComponent();
  }

  const imports = generateImports(components);
  const schemaName = "formSchema";
  const componentBody = generateComponentBody(components, schemaName, settings);

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

  // Always include these base imports for React Hook Form and shadcn Field
  imports.add('import { useForm, Controller } from "react-hook-form";');
  imports.add('import { zodResolver } from "@hookform/resolvers/zod";');
  imports.add('import * as z from "zod";');
  imports.add('import { Button } from "@/components/ui/button";');
  imports.add(
    'import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";'
  );

  // Determine which shadcn/ui components are needed
  for (const component of components) {
    switch (component.type) {
      case "input":
      case "password":
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
  schemaName: string,
  settings?: any
): string {
  const zodSchema = generateInlineZodSchema(components);
  const defaultValues = generateInlineDefaultValues(components);

  const showSubmit = settings?.showSubmitButton !== false;
  const showCancel = settings?.showCancelButton === true;
  const submitText = settings?.submitButtonText || "Submit";
  const cancelText = settings?.cancelButtonText || "Cancel";
  const resetOnSubmit = settings?.resetOnSubmit || false;
  const showSuccessMessage = settings?.showSuccessMessage !== false;
  const successMessage =
    settings?.successMessage || "Form submitted successfully!";
  const formWidth = settings?.formWidth || "md";
  const spacing = settings?.spacing || "normal";

  // Get max width class
  const getMaxWidthClass = () => {
    switch (formWidth) {
      case "sm":
        return "max-w-2xl";
      case "md":
        return "max-w-4xl";
      case "lg":
        return "max-w-5xl";
      case "xl":
        return "max-w-6xl";
      case "full":
        return "max-w-full";
      default:
        return "max-w-4xl";
    }
  };

  // Get spacing class
  const getSpacingClass = () => {
    switch (spacing) {
      case "compact":
        return "space-y-2";
      case "normal":
        return "space-y-4";
      case "relaxed":
        return "space-y-6";
      default:
        return "space-y-4";
    }
  };

  let buttons = "";
  if (showSubmit || showCancel) {
    const buttonElements = [];
    if (showSubmit) {
      buttonElements.push(`<Button type="submit">${submitText}</Button>`);
    }
    if (showCancel) {
      buttonElements.push(
        `<Button type="button" variant="outline">${cancelText}</Button>`
      );
    }
    buttons = `\n      <div className="flex gap-3">\n        ${buttonElements.join(
      "\n        "
    )}\n      </div>`;
  }

  // Sort components by layout position (top to bottom, left to right)
  const sortedComponents = [...components].sort((a, b) => {
    const aLayout = a.layout || { x: 0, y: 0, w: 12, h: 1 };
    const bLayout = b.layout || { x: 0, y: 0, w: 12, h: 1 };

    // Sort by row first, then by column
    if (aLayout.y !== bLayout.y) {
      return aLayout.y - bLayout.y;
    }
    return aLayout.x - bLayout.x;
  });

  // Group components by row
  const rows: FormComponent[][] = [];
  sortedComponents.forEach((component) => {
    const layout = component.layout || { x: 0, y: 0, w: 12, h: 1 };
    const rowIndex = layout.y;

    if (!rows[rowIndex]) {
      rows[rowIndex] = [];
    }
    rows[rowIndex].push(component);
  });

  // Helper to get col-span class
  const getColSpanClass = (width: number) => {
    const colSpanMap: Record<number, string> = {
      1: "md:col-span-1",
      2: "md:col-span-2",
      3: "md:col-span-3",
      4: "md:col-span-4",
      5: "md:col-span-5",
      6: "md:col-span-6",
      7: "md:col-span-7",
      8: "md:col-span-8",
      9: "md:col-span-9",
      10: "md:col-span-10",
      11: "md:col-span-11",
      12: "md:col-span-12",
    };
    return colSpanMap[width] || "md:col-span-12";
  };

  // Generate fields with grid layout
  const fieldsWithLayout = rows
    .filter((row) => row.length > 0)
    .map((row) => {
      if (row.length === 1 && (row[0].layout?.w ?? 12) === 12) {
        // Full width component - no grid wrapper needed
        const fieldJSX = generateFormFieldJSX(row[0]);
        return indentLines(fieldJSX, 4);
      } else {
        // Multiple components in row or partial width - use grid
        const rowFields = row
          .map((component) => {
            const layout = component.layout || { x: 0, y: 0, w: 12, h: 1 };
            const colSpan = getColSpanClass(layout.w);
            const fieldJSX = generateFormFieldJSX(component);
            return `<div className="${colSpan}">\n${indentLines(
              fieldJSX,
              6
            )}\n      </div>`;
          })
          .join("\n");

        return `<div className="grid grid-cols-1 md:grid-cols-12 gap-4">\n${indentLines(
          rowFields,
          6
        )}\n      </div>`;
      }
    })
    .join("\n\n");

  const fieldsContainer = `<div className="${getSpacingClass()}">\n${fieldsWithLayout}\n      </div>`;

  const onSubmitCode = resetOnSubmit
    ? `  function onSubmit(values: z.infer<typeof ${schemaName}>) {
    console.log(values);
    ${
      showSuccessMessage
        ? `// Show success message\n    alert("${successMessage}");`
        : ""
    }
    // Reset form after submission
    form.reset();
  }`
    : `  function onSubmit(values: z.infer<typeof ${schemaName}>) {
    console.log(values);
    ${
      showSuccessMessage
        ? `// Show success message\n    alert("${successMessage}");`
        : ""
    }
  }`;

  return `const ${schemaName} = ${zodSchema};

export default function GeneratedForm() {
  const form = useForm<z.infer<typeof ${schemaName}>>({
    resolver: zodResolver(${schemaName}),
    defaultValues: ${defaultValues},
  });

${onSubmitCode}

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full ${getMaxWidthClass()} mx-auto p-6">
      <FieldGroup>
      ${fieldsContainer}${buttons}
      </FieldGroup>
    </form>
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
      case "password":
      case "textarea":
        // Use specific validators for email/URL
        if (component.validation.email) {
          schema = 'z.email({ message: "Must be a valid email address" })';
        } else if (component.validation.url) {
          schema = 'z.url({ message: "Must be a valid URL" })';
        } else {
          schema = "z.string()";
        }

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
        if (component.validation.minDate) {
          schema += `.min(new Date("${component.validation.minDate}"))`;
        }
        if (component.validation.maxDate) {
          schema += `.max(new Date("${component.validation.maxDate}"))`;
        }
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
      case "date":
        value = component.defaultValue
          ? `"${component.defaultValue}"`
          : "undefined";
        break;
      case "file":
        value = "undefined";
        break;
      case "input":
      case "password":
      case "textarea":
      case "select":
      case "radio":
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
    case "password":
      return generatePasswordFormField(component);
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
 * Generate Field for input component using Controller
 */
function generateInputFormField(component: FormComponent): string {
  const placeholder = component.placeholder || "";

  // Determine input type based on validation
  let inputType = "text";
  if (component.validation.email) {
    inputType = "email";
  } else if (component.validation.url) {
    inputType = "url";
  }

  return `<Field>
  <FieldLabel htmlFor="${component.name}">${component.label}</FieldLabel>
  <Controller
    name="${component.name}"
    control={form.control}
    render={({ field }) => (
      <Input
        id="${component.name}"
        type="${inputType}"
        placeholder="${placeholder}"
        {...field}
        aria-invalid={!!form.formState.errors.${component.name}}
      />
    )}
  />
  <FieldError errors={[form.formState.errors.${component.name}]} />
</Field>`;
}

/**
 * Generate Field for password component using Controller
 */
function generatePasswordFormField(component: FormComponent): string {
  const placeholder = component.placeholder || "";

  return `<Field>
  <FieldLabel htmlFor="${component.name}">${component.label}</FieldLabel>
  <Controller
    name="${component.name}"
    control={form.control}
    render={({ field }) => (
      <Input
        id="${component.name}"
        type="password"
        placeholder="${placeholder}"
        {...field}
        aria-invalid={!!form.formState.errors.${component.name}}
      />
    )}
  />
  <FieldError errors={[form.formState.errors.${component.name}]} />
</Field>`;
}

/**
 * Generate Field for textarea component using Controller
 */
function generateTextareaFormField(component: FormComponent): string {
  const placeholder = component.placeholder || "";

  return `<Field>
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
}

/**
 * Generate Field for select component using Controller
 */
function generateSelectFormField(component: FormComponent): string {
  const options = component.options || [];
  const optionItems = options
    .map(
      (opt) =>
        `          <SelectItem value="${opt.value}">${opt.label}</SelectItem>`
    )
    .join("\n");

  return `<Field>
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
}

/**
 * Generate Field for checkbox component using Controller
 */
function generateCheckboxFormField(component: FormComponent): string {
  return `<Field orientation="horizontal">
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
}

/**
 * Generate Field for radio component using Controller
 */
function generateRadioFormField(component: FormComponent): string {
  const options = component.options || [];
  const radioItems = options
    .map(
      (opt) => `          <Field orientation="horizontal">
            <RadioGroupItem value="${opt.value}" id="${component.name}-${opt.value}" />
            <FieldLabel htmlFor="${component.name}-${opt.value}">${opt.label}</FieldLabel>
          </Field>`
    )
    .join("\n");

  return `<Field>
  <FieldLabel>${component.label}</FieldLabel>
  <Controller
    name="${component.name}"
    control={form.control}
    render={({ field }) => (
      <RadioGroup
        onValueChange={field.onChange}
        defaultValue={field.value}
        aria-invalid={!!form.formState.errors.${component.name}}
      >
${radioItems}
      </RadioGroup>
    )}
  />
  <FieldError errors={[form.formState.errors.${component.name}]} />
</Field>`;
}

/**
 * Generate Field for switch component using Controller
 */
function generateSwitchFormField(component: FormComponent): string {
  return `<Field orientation="horizontal">
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
}

/**
 * Generate Field for slider component using Controller
 */
function generateSliderFormField(component: FormComponent): string {
  const min = component.min ?? 0;
  const max = component.max ?? 100;
  const step = component.step ?? 1;

  return `<Field>
  <FieldLabel htmlFor="${component.name}">${component.label}</FieldLabel>
  <Controller
    name="${component.name}"
    control={form.control}
    render={({ field }) => (
      <Slider
        id="${component.name}"
        min={${min}}
        max={${max}}
        step={${step}}
        defaultValue={[field.value ?? 0]}
        onValueChange={(vals) => field.onChange(vals[0])}
        aria-invalid={!!form.formState.errors.${component.name}}
      />
    )}
  />
  <FieldError errors={[form.formState.errors.${component.name}]} />
</Field>`;
}

/**
 * Generate Field for date picker component using Controller
 */
function generateDateFormField(component: FormComponent): string {
  return `<Field>
  <FieldLabel>${component.label}</FieldLabel>
  <Controller
    name="${component.name}"
    control={form.control}
    render={({ field }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full pl-3 text-left font-normal",
              !field.value && "text-muted-foreground"
            )}
            aria-invalid={!!form.formState.errors.${component.name}}
          >
            {field.value ? (
              format(field.value, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
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
    )}
  />
  <FieldError errors={[form.formState.errors.${component.name}]} />
</Field>`;
}

/**
 * Generate Field for file upload component using Controller
 */
function generateFileFormField(component: FormComponent): string {
  const accept =
    component.accept && component.accept !== "*" ? component.accept : "";

  return `<Field>
  <FieldLabel htmlFor="${component.name}">${component.label}</FieldLabel>
  <Controller
    name="${component.name}"
    control={form.control}
    render={({ field: { onChange, value, ...field } }) => (
      <Input
        id="${component.name}"
        type="file"
        accept="${accept}"
        onChange={(e) => onChange(e.target.files)}
        aria-invalid={!!form.formState.errors.${component.name}}
        {...field}
      />
    )}
  />
  <FieldError errors={[form.formState.errors.${component.name}]} />
</Field>`;
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
