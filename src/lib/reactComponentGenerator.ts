import type { FormComponent } from "../types/form";

/**
 * Generate a complete React component code string from form components
 * This function creates production-ready React code using shadcn/ui components
 */
export function generateReactComponent(components: FormComponent[]): string {
  if (components.length === 0) {
    return generateEmptyComponent();
  }

  const imports = generateImports(components);
  const componentBody = generateComponentBody(components);

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

  // Always include these base imports
  imports.add('import { Label } from "@/components/ui/label";');

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
        imports.add('import { Button } from "@/components/ui/button";');
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
 * Generate the main component body with all form fields
 */
function generateComponentBody(components: FormComponent[]): string {
  const fields = components
    .map((component) => generateFieldJSX(component))
    .join("\n\n");

  return `export default function GeneratedForm() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6 bg-background dark:bg-background">
      <div className="space-y-4">
${indentLines(fields, 8)}
      </div>
    </div>
  );
}
`;
}

/**
 * Generate JSX for a single form field based on component type
 */
function generateFieldJSX(component: FormComponent): string {
  switch (component.type) {
    case "input":
      return generateInputJSX(component);
    case "textarea":
      return generateTextareaJSX(component);
    case "select":
      return generateSelectJSX(component);
    case "checkbox":
      return generateCheckboxJSX(component);
    case "radio":
      return generateRadioJSX(component);
    case "switch":
      return generateSwitchJSX(component);
    case "slider":
      return generateSliderJSX(component);
    case "date":
      return generateDateJSX(component);
    case "file":
      return generateFileJSX(component);
    default:
      return "";
  }
}

/**
 * Generate JSX for input component
 */
function generateInputJSX(component: FormComponent): string {
  const required = component.validation.required ? " *" : "";
  const placeholder = component.placeholder
    ? ` placeholder="${component.placeholder}"`
    : "";
  const defaultValue = component.defaultValue
    ? ` defaultValue="${component.defaultValue}"`
    : "";

  return `<div className="space-y-2">
  <Label htmlFor="${component.name}" className="text-foreground dark:text-foreground">
    ${component.label}${required}
  </Label>
  <Input
    id="${component.name}"
    name="${component.name}"
    type="text"${placeholder}${defaultValue}
    className="bg-background dark:bg-background border-input dark:border-input"
  />
</div>`;
}

/**
 * Generate JSX for textarea component
 */
function generateTextareaJSX(component: FormComponent): string {
  const required = component.validation.required ? " *" : "";
  const placeholder = component.placeholder
    ? ` placeholder="${component.placeholder}"`
    : "";
  const defaultValue = component.defaultValue
    ? ` defaultValue="${component.defaultValue}"`
    : "";

  return `<div className="space-y-2">
  <Label htmlFor="${component.name}" className="text-foreground dark:text-foreground">
    ${component.label}${required}
  </Label>
  <Textarea
    id="${component.name}"
    name="${component.name}"${placeholder}${defaultValue}
    className="bg-background dark:bg-background border-input dark:border-input"
  />
</div>`;
}

/**
 * Generate JSX for select component
 */
function generateSelectJSX(component: FormComponent): string {
  const required = component.validation.required ? " *" : "";
  const options = component.options || [];
  const defaultValue = component.defaultValue
    ? ` defaultValue="${component.defaultValue}"`
    : "";

  const optionItems = options
    .map(
      (opt) =>
        `      <SelectItem value="${opt.value}">${opt.label}</SelectItem>`
    )
    .join("\n");

  return `<div className="space-y-2">
  <Label htmlFor="${component.name}" className="text-foreground dark:text-foreground">
    ${component.label}${required}
  </Label>
  <Select name="${component.name}"${defaultValue}>
    <SelectTrigger className="bg-background dark:bg-background border-input dark:border-input">
      <SelectValue placeholder="Select an option" />
    </SelectTrigger>
    <SelectContent className="bg-background dark:bg-background border-input dark:border-input">
${optionItems}
    </SelectContent>
  </Select>
</div>`;
}

/**
 * Generate JSX for checkbox component
 */
function generateCheckboxJSX(component: FormComponent): string {
  const required = component.validation.required ? " *" : "";
  const defaultChecked = component.defaultValue ? " defaultChecked" : "";

  return `<div className="flex items-center space-x-2">
  <Checkbox
    id="${component.name}"
    name="${component.name}"${defaultChecked}
    className="border-input dark:border-input data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary"
  />
  <Label
    htmlFor="${component.name}"
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground dark:text-foreground"
  >
    ${component.label}${required}
  </Label>
</div>`;
}

/**
 * Generate JSX for radio component
 */
function generateRadioJSX(component: FormComponent): string {
  const required = component.validation.required ? " *" : "";
  const options = component.options || [];
  const defaultValue = component.defaultValue
    ? ` defaultValue="${component.defaultValue}"`
    : "";

  const radioItems = options
    .map(
      (opt) => `    <div className="flex items-center space-x-2">
      <RadioGroupItem value="${opt.value}" id="${component.name}-${opt.value}" className="border-input dark:border-input" />
      <Label htmlFor="${component.name}-${opt.value}" className="text-foreground dark:text-foreground">${opt.label}</Label>
    </div>`
    )
    .join("\n");

  return `<div className="space-y-2">
  <Label className="text-foreground dark:text-foreground">
    ${component.label}${required}
  </Label>
  <RadioGroup name="${component.name}"${defaultValue} className="space-y-2">
${radioItems}
  </RadioGroup>
</div>`;
}

/**
 * Generate JSX for switch component
 */
function generateSwitchJSX(component: FormComponent): string {
  const required = component.validation.required ? " *" : "";
  const defaultChecked = component.defaultValue ? " defaultChecked" : "";

  return `<div className="flex items-center justify-between space-x-2">
  <Label htmlFor="${component.name}" className="text-foreground dark:text-foreground">
    ${component.label}${required}
  </Label>
  <Switch
    id="${component.name}"
    name="${component.name}"${defaultChecked}
    className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary"
  />
</div>`;
}

/**
 * Generate JSX for slider component
 */
function generateSliderJSX(component: FormComponent): string {
  const required = component.validation.required ? " *" : "";
  const min = component.min ?? 0;
  const max = component.max ?? 100;
  const step = component.step ?? 1;
  const defaultValue = component.defaultValue ?? min;

  return `<div className="space-y-2">
  <Label htmlFor="${component.name}" className="text-foreground dark:text-foreground">
    ${component.label}${required}
  </Label>
  <Slider
    id="${component.name}"
    name="${component.name}"
    min={${min}}
    max={${max}}
    step={${step}}
    defaultValue={[${defaultValue}]}
    className="**:[[role=slider]]:bg-primary dark:**:[[role=slider]]:bg-primary"
  />
  <div className="flex justify-between text-xs text-muted-foreground dark:text-muted-foreground">
    <span>${min}</span>
    <span>${max}</span>
  </div>
</div>`;
}

/**
 * Generate JSX for date picker component
 */
function generateDateJSX(component: FormComponent): string {
  const required = component.validation.required ? " *" : "";

  return `<div className="space-y-2">
  <Label htmlFor="${component.name}" className="text-foreground dark:text-foreground">
    ${component.label}${required}
  </Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal bg-background dark:bg-background border-input dark:border-input",
          "text-foreground dark:text-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>Pick a date</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0 bg-background dark:bg-background border-input dark:border-input">
      <Calendar
        mode="single"
        className="bg-background dark:bg-background"
      />
    </PopoverContent>
  </Popover>
</div>`;
}

/**
 * Generate JSX for file upload component
 */
function generateFileJSX(component: FormComponent): string {
  const required = component.validation.required ? " *" : "";
  const accept =
    component.accept && component.accept !== "*"
      ? ` accept="${component.accept}"`
      : "";

  return `<div className="space-y-2">
  <Label htmlFor="${component.name}" className="text-foreground dark:text-foreground">
    ${component.label}${required}
  </Label>
  <Input
    id="${component.name}"
    name="${component.name}"
    type="file"${accept}
    className="bg-background dark:bg-background border-input dark:border-input file:bg-primary file:text-primary-foreground dark:file:bg-primary dark:file:text-primary-foreground"
  />
</div>`;
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
