import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useFormBuilderStore, selectTheme } from "@/store/formBuilderStore";

const snippets = [
  {
    id: "rhf-input",
    title: "RHF Input",
    description: "Text input with validation and error handling",
    category: "Basic Components",
    code: `import { Field, FieldLabel, FieldError } from "@/components/ui/field";
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
}`,
  },
  {
    id: "rhf-textarea",
    title: "RHF TextArea",
    description: "Multi-line text input with configurable rows",
    category: "Basic Components",
    code: `import { Field, FieldLabel, FieldError } from "@/components/ui/field";
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
}`,
  },
  {
    id: "rhf-datepicker",
    title: "RHF DatePicker",
    description: "Calendar popover for date selection",
    category: "Basic Components",
    code: `import { Field, FieldLabel, FieldError } from "@/components/ui/field";
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
}`,
  },
  {
    id: "rhf-select",
    title: "RHF Select",
    description: "Dropdown with custom options array",
    category: "Basic Components",
    code: `import { Field, FieldLabel, FieldError } from "@/components/ui/field";
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
}`,
  },
  {
    id: "rhf-radio",
    title: "RHF Radio Group",
    description: "Single-choice radio buttons with labels",
    category: "Basic Components",
    code: `import { Field, FieldLabel, FieldError } from "@/components/ui/field";
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
}`,
  },
  {
    id: "rhf-checkbox",
    title: "RHF Checkbox",
    description: "Boolean checkbox with optional description",
    category: "Basic Components",
    code: `import { Field, FieldLabel, FieldError } from "@/components/ui/field";
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
}`,
  },
  {
    id: "rhf-switch",
    title: "RHF Switch",
    description: "Toggle switch for on/off states",
    category: "Basic Components",
    code: `import { Field, FieldLabel, FieldError } from "@/components/ui/field";
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
}`,
  },
  {
    id: "rhf-slider",
    title: "RHF Slider",
    description: "Numeric range slider with live value display",
    category: "Basic Components",
    code: `import { Field, FieldLabel, FieldError } from "@/components/ui/field";
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
}`,
  },
  {
    id: "rhf-file",
    title: "RHF File Upload",
    description: "File input with accept type filtering",
    category: "Basic Components",
    code: `import { Field, FieldLabel, FieldError } from "@/components/ui/field";
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
}`,
  },
  {
    id: "rhf-input-group-icon",
    title: "RHF Input with Icon",
    description: "Text input with leading icon addon",
    category: "Advanced Components",
    code: `import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Mail } from "lucide-react";

interface RHFInputWithIconProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function RHFInputWithIcon({
  name,
  label,
  control,
  errors,
  placeholder,
  icon = <Mail />,
}: RHFInputWithIconProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>{icon}</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              {...field}
              id={name}
              placeholder={placeholder}
            />
          </InputGroup>
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`,
  },
  {
    id: "rhf-input-group-button",
    title: "RHF Input with Button",
    description: "Search input with trailing action button",
    category: "Advanced Components",
    code: `import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Search } from "lucide-react";

interface RHFInputWithButtonProps {
  name: string;
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  placeholder?: string;
  onButtonClick?: () => void;
  buttonLabel?: string;
}

export function RHFInputWithButton({
  name,
  label,
  control,
  errors,
  placeholder,
  onButtonClick,
  buttonLabel = "Search",
}: RHFInputWithButtonProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InputGroup>
            <InputGroupInput
              {...field}
              id={name}
              placeholder={placeholder}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={onButtonClick}>
                <Search />
                {buttonLabel}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`,
  },
  {
    id: "rhf-item-card",
    title: "RHF Item Card",
    description: "Visual card selector with icons and descriptions",
    category: "Advanced Components",
    code: `import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import { Field, FieldError } from "@/components/ui/field";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { cn } from "@/lib/utils";

interface RHFItemCardProps {
  name: string;
  control: Control<any>;
  errors?: FieldErrors;
  options: Array<{
    value: string;
    title: string;
    description: string;
    icon?: React.ReactNode;
  }>;
}

export function RHFItemCard({
  name,
  control,
  errors,
  options,
}: RHFItemCardProps) {
  return (
    <Field>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            {options.map((option) => (
              <Item
                key={option.value}
                variant="outline"
                className={cn(
                  "cursor-pointer transition-colors",
                  field.value === option.value &&
                    "border-primary bg-primary/5"
                )}
                onClick={() => field.onChange(option.value)}
              >
                {option.icon && (
                  <ItemMedia variant="icon">{option.icon}</ItemMedia>
                )}
                <ItemContent>
                  <ItemTitle>{option.title}</ItemTitle>
                  <ItemDescription>{option.description}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </div>
        )}
      />
      <FieldError errors={[errors?.[name]]} />
    </Field>
  );
}`,
  },
];

export function CodeSnippetsLibrary() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const theme = useFormBuilderStore(selectTheme);

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = Array.from(new Set(snippets.map((s) => s.category)));

  const syntaxTheme = useMemo(
    () => (theme === "dark" ? vscDarkPlus : vs),
    [theme]
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Code2 className="h-4 w-4 mr-2" />
          Code Snippets
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>RHF Component Snippets</SheetTitle>
          <SheetDescription>
            Ready-to-use React Hook Form components with shadcn/ui. Copy and
            paste into your project.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 px-4">
          <Accordion type="single" collapsible className="w-full">
            {categories.map((category) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="text-base font-semibold">
                  {category}
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible className="w-full pl-2">
                    {snippets
                      .filter((s) => s.category === category)
                      .map((snippet) => (
                        <AccordionItem key={snippet.id} value={snippet.id}>
                          <AccordionTrigger className="text-sm hover:no-underline">
                            <div className="flex items-start justify-between w-full pr-2">
                              <div className="text-left">
                                <div className="font-medium">
                                  {snippet.title}
                                </div>
                                <div className="text-xs text-muted-foreground font-normal mt-0.5">
                                  {snippet.description}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleCopy(snippet.code, snippet.id)
                                  }
                                  className="gap-2"
                                >
                                  {copiedId === snippet.id ? (
                                    <>
                                      <Check className="h-4 w-4 text-green-500" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-4 w-4" />
                                      Copy Code
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="rounded-md overflow-hidden border border-border">
                                <SyntaxHighlighter
                                  language="typescript"
                                  style={syntaxTheme}
                                  customStyle={{
                                    margin: 0,
                                    fontSize: "0.75rem",
                                    maxHeight: "500px",
                                  }}
                                >
                                  {snippet.code}
                                </SyntaxHighlighter>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
