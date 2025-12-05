import type { FormComponent } from "../types/form";

/**
 * Generate React Hook Form setup code string from form components
 * This function creates installation guide and suggested RHF wrapper components
 */
export function generateRHFSetup(components: FormComponent[]): string {
  if (components.length === 0) {
    return generateEmptySetup();
  }

  const dependencies = generateDependencies(components);
  const suggestedComponents = generateSuggestedComponents(components);
  const usageGuide = generateUsageGuide(components);

  return `${dependencies}

${suggestedComponents}

${usageGuide}`;
}

/**
 * Generate empty setup when no fields are present
 */
function generateEmptySetup(): string {
  return `// ============================================
// 📦 INSTALLATION & DEPENDENCIES
// ============================================

# Install required packages
pnpm add react-hook-form @hookform/resolvers zod

# Install shadcn/ui components (if not already installed)
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add button

// ============================================
// 🎯 SUGGESTED COMPONENTS
// ============================================

// No fields configured yet. Add components to your form to see suggested RHF wrapper components.

// ============================================
// 📖 USAGE GUIDE
// ============================================

// 1. Copy the suggested RHF components above into your project
// 2. Use the Component tab to see the full form implementation
// 3. Use the Schema tab to see the Zod validation schema
`;
}

/**
 * Generate installation and dependencies section
 */
function generateDependencies(components: FormComponent[]): string {
  const uniqueTypes = new Set(components.map((c) => c.type));
  const shadcnComponents = new Set<string>();

  // Map component types to shadcn components
  uniqueTypes.forEach((type) => {
    switch (type) {
      case "input":
      case "password":
        shadcnComponents.add("input");
        break;
      case "textarea":
        shadcnComponents.add("textarea");
        break;
      case "select":
        shadcnComponents.add("select");
        break;
      case "checkbox":
        shadcnComponents.add("checkbox");
        break;
      case "switch":
        shadcnComponents.add("switch");
        break;
      case "slider":
        shadcnComponents.add("slider");
        break;
      case "radio":
        shadcnComponents.add("radio-group");
        shadcnComponents.add("label");
        break;
      case "date":
        shadcnComponents.add("calendar");
        shadcnComponents.add("popover");
        break;
    }
  });

  const shadcnInstalls = Array.from(shadcnComponents)
    .map((comp) => `${comp}`).join(" ");

  return `// ============================================
// 📦 INSTALLATION & DEPENDENCIES
// ============================================

# Install required packages
pnpm add react-hook-form @hookform/resolvers zod

# Install shadcn/ui components
pnpm dlx shadcn@latest add button ${shadcnInstalls}`;
}

/**
 * Generate suggested RHF wrapper components based on form components
 */
function generateSuggestedComponents(components: FormComponent[]): string {
  const uniqueTypes = new Set(components.map((c) => c.type));
  const snippets: string[] = [];

  uniqueTypes.forEach((type) => {
    const snippet = getSnippetForType(type);
    if (snippet) {
      snippets.push(snippet);
    }
  });

  if (snippets.length === 0) {
    return `// ============================================
// 🎯 SUGGESTED COMPONENTS
// ============================================

// No reusable components needed for your form`;
  }

  return `// ============================================
// 🎯 SUGGESTED COMPONENTS
// ============================================
// Copy these reusable RHF wrapper components into your project

${snippets.join("\n\n// ---\n\n")}`;
}

/**
 * Get code snippet for a specific component type
 */
function getSnippetForType(type: string): string | null {
  switch (type) {
    case "input":
      return `// RHFInput - Text input with validation
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, Control, FieldErrors } from "react-hook-form";

interface RHFInputProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  placeholder?: string;
  type?: string;
}

export function RHFInput({
  name,
  label,
  control,
  errors,
  placeholder,
  type = "text",
}: RHFInputProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
          />
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`;

    case "password":
      return `// RHFPassword - Password input
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, Control, FieldErrors } from "react-hook-form";

interface RHFPasswordProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  placeholder?: string;
}

export function RHFPassword({
  name,
  label,
  control,
  errors,
  placeholder,
}: RHFPasswordProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            id={name}
            type="password"
            placeholder={placeholder}
          />
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`;

    case "textarea":
      return `// RHFTextArea - Multi-line text input
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Controller, Control, FieldErrors } from "react-hook-form";

interface RHFTextAreaProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  placeholder?: string;
  rows?: number;
}

export function RHFTextArea({
  name,
  label,
  control,
  errors,
  placeholder,
  rows = 4,
}: RHFTextAreaProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            rows={rows}
          />
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`;

    case "select":
      return `// RHFSelect - Dropdown selector
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, Control, FieldErrors } from "react-hook-form";

interface RHFSelectProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

export function RHFSelect({
  name,
  label,
  control,
  errors,
  placeholder = "Select an option",
  options,
}: RHFSelectProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={name}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`;

    case "checkbox":
      return `// RHFCheckbox - Boolean checkbox
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller, Control, FieldErrors } from "react-hook-form";

interface RHFCheckboxProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  description?: string;
}

export function RHFCheckbox({
  name,
  label,
  control,
  errors,
  description,
}: RHFCheckboxProps) {
  return (
    <Field>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <div className="grid gap-1.5 leading-none">
              <FieldLabel htmlFor={name}>{label}</FieldLabel>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`;

    case "switch":
      return `// RHFSwitch - Toggle switch
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Controller, Control, FieldErrors } from "react-hook-form";

interface RHFSwitchProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  description?: string;
}

export function RHFSwitch({
  name,
  label,
  control,
  errors,
  description,
}: RHFSwitchProps) {
  return (
    <Field>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <div className="grid gap-1.5 leading-none">
              <FieldLabel htmlFor={name}>{label}</FieldLabel>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`;

    case "slider":
      return `// RHFSlider - Numeric range slider
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Controller, Control, FieldErrors } from "react-hook-form";

interface RHFSliderProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  min?: number;
  max?: number;
  step?: number;
}

export function RHFSlider({
  name,
  label,
  control,
  errors,
  min = 0,
  max = 100,
  step = 1,
}: RHFSliderProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Slider
              id={name}
              value={[field.value]}
              onValueChange={(vals) => field.onChange(vals[0])}
              min={min}
              max={max}
              step={step}
            />
            <div className="text-sm text-muted-foreground text-center">
              Value: {field.value}
            </div>
          </div>
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`;

    case "radio":
      return `// RHFRadio - Radio button group
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Controller, Control, FieldErrors } from "react-hook-form";

interface RHFRadioProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  options: Array<{ value: string; label: string }>;
}

export function RHFRadio({
  name,
  label,
  control,
  errors,
  options,
}: RHFRadioProps) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup value={field.value} onValueChange={field.onChange}>
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={\`\${name}-\${option.value}\`}
                />
                <Label htmlFor={\`\${name}-\${option.value}\`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`;

    case "date":
      return `// RHFDatePicker - Calendar date picker
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Controller, Control, FieldErrors } from "react-hook-form";

interface RHFDatePickerProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  placeholder?: string;
}

export function RHFDatePicker({
  name,
  label,
  control,
  errors,
  placeholder = "Pick a date",
}: RHFDatePickerProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
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
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>{placeholder}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
              />
            </PopoverContent>
          </Popover>
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`;

    case "file":
      return `// RHFFile - File upload input
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, Control, FieldErrors } from "react-hook-form";

interface RHFFileProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  accept?: string;
}

export function RHFFile({
  name,
  label,
  control,
  errors,
  accept,
}: RHFFileProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <Input
            {...field}
            id={name}
            type="file"
            accept={accept}
            onChange={(e) => onChange(e.target.files?.[0])}
          />
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`;

    default:
      return null;
  }
}

/**
 * Generate usage guide section
 */
function generateUsageGuide(components: FormComponent[]): string {
  const uniqueTypes = new Set(components.map((c) => c.type));
  const componentNames = Array.from(uniqueTypes)
    .map((type) => {
      switch (type) {
        case "input":
          return "RHFInput";
        case "password":
          return "RHFPassword";
        case "textarea":
          return "RHFTextArea";
        case "select":
          return "RHFSelect";
        case "checkbox":
          return "RHFCheckbox";
        case "switch":
          return "RHFSwitch";
        case "slider":
          return "RHFSlider";
        case "radio":
          return "RHFRadio";
        case "date":
          return "RHFDatePicker";
        case "file":
          return "RHFFile";
        default:
          return null;
      }
    })
    .filter(Boolean);

  const exampleComponent = components[0];
  let usageExample = "";

  if (exampleComponent) {
    const componentName = componentNames[0] || "RHFInput";
    usageExample = `
// Example usage in your form:
<${componentName}
  name="${exampleComponent.name}"
  label="${exampleComponent.label}"
  control={form.control}
  errors={form.formState.errors}
  ${
    exampleComponent.placeholder
      ? `placeholder="${exampleComponent.placeholder}"`
      : ""
  }
/>`;
  }

  return `// ============================================
// 📖 USAGE GUIDE
// ============================================

// 1. Copy the suggested RHF components above into your project
//    (e.g., src/components/rhf/RHFInput.tsx)

// 2. Import them in your form component:
${componentNames
  .map((name) => `//    import { ${name} } from "@/components/rhf/${name}";`)
  .join("\n")}

// 3. Use them in your form with the generated schema from the Schema tab
${usageExample}

// 4. See the Component tab for the complete form implementation

// 5. These wrapper components are reusable across your entire project!`;
}
