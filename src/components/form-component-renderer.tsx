import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { FormComponent } from "@/types/form";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

interface FormComponentRendererProps {
  component: FormComponent;
  onClick?: () => void;
  control?: Control<any>;
  errors?: FieldErrors;
}

export function FormComponentRenderer({
  component,
  onClick,
  control,
  errors,
}: FormComponentRendererProps) {
  const error = errors?.[component.name];
  const errorMessage = error?.message as string | undefined;

  // If no control is provided, render a static preview (for drag overlay, etc.)
  if (!control) {
    return <StaticComponentPreview component={component} onClick={onClick} />;
  }

  const renderComponent = () => {
    switch (component.type) {
      case "input":
        // Determine input type based on validation
        let inputType = "text";
        if (component.validation.email) {
          inputType = "email";
        } else if (component.validation.url) {
          inputType = "url";
        }

        return (
          <Controller
            name={component.name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type={inputType}
                placeholder={component.placeholder}
                className={error ? "border-destructive" : ""}
              />
            )}
          />
        );

      case "password":
        return (
          <Controller
            name={component.name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="password"
                placeholder={component.placeholder}
                className={error ? "border-destructive" : ""}
              />
            )}
          />
        );

      case "textarea":
        return (
          <Controller
            name={component.name}
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder={component.placeholder}
                className={error ? "border-destructive" : ""}
              />
            )}
          />
        );

      case "select":
        return (
          <Controller
            name={component.name}
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={error ? "border-destructive" : ""}>
                  <SelectValue
                    placeholder={component.placeholder || "Select an option"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {component.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case "checkbox":
        return (
          <Controller
            name={component.name}
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={component.id}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label
                  htmlFor={component.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {component.label}
                </Label>
              </div>
            )}
          />
        );

      case "radio":
        return (
          <Controller
            name={component.name}
            control={control}
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange}>
                {component.options?.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`${component.id}-${option.value}`}
                    />
                    <Label htmlFor={`${component.id}-${option.value}`}>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        );

      case "switch":
        return (
          <Controller
            name={component.name}
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Switch
                  id={component.id}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor={component.id}>{component.label}</Label>
              </div>
            )}
          />
        );

      case "slider":
        return (
          <Controller
            name={component.name}
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Slider
                  value={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                  min={component.min ?? 0}
                  max={component.max ?? 100}
                  step={component.step ?? 1}
                />
                <div className="text-sm text-muted-foreground text-center">
                  Value: {field.value}
                </div>
              </div>
            )}
          />
        );

      case "date":
        return (
          <Controller
            name={component.name}
            control={control}
            render={({ field }) => {
              // Parse date string to Date object, handling timezone correctly
              const parseDate = (dateStr: string) => {
                if (!dateStr) return undefined;
                const [year, month, day] = dateStr.split("-").map(Number);
                return new Date(year, month - 1, day);
              };

              const selectedDate = field.value
                ? parseDate(field.value)
                : undefined;

              return (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                        error && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                      }}
                      disabled={(date) => {
                        const minDate = component.validation.minDate
                          ? parseDate(component.validation.minDate)
                          : undefined;
                        const maxDate = component.validation.maxDate
                          ? parseDate(component.validation.maxDate)
                          : undefined;

                        if (minDate && date < minDate) return true;
                        if (maxDate && date > maxDate) return true;
                        return false;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              );
            }}
          />
        );

      case "file":
        return (
          <Controller
            name={component.name}
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <Input
                {...field}
                type="file"
                accept={component.accept}
                onChange={(e) => onChange(e.target.files?.[0])}
                className={error ? "border-destructive" : ""}
              />
            )}
          />
        );

      default:
        return (
          <div className="text-muted-foreground text-sm">
            Unknown component type: {component.type}
          </div>
        );
    }
  };

  // For checkbox and switch, the label is rendered as part of the component
  const showLabel =
    component.type !== "checkbox" && component.type !== "switch";

  return (
    <div onClick={onClick} className="space-y-2">
      {showLabel && (
        <Label htmlFor={component.id}>
          {component.label}
          {component.validation.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
      )}
      {renderComponent()}
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

/**
 * Static preview component for when React Hook Form is not available
 */
function StaticComponentPreview({
  component,
  onClick,
}: {
  component: FormComponent;
  onClick?: () => void;
}) {
  const renderComponent = () => {
    switch (component.type) {
      case "input":
        return (
          <Input
            placeholder={component.placeholder}
            defaultValue={component.defaultValue}
            disabled
          />
        );

      case "password":
        return (
          <Input
            type="password"
            placeholder={component.placeholder}
            defaultValue={component.defaultValue}
            disabled
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={component.placeholder}
            defaultValue={component.defaultValue}
            disabled
          />
        );

      case "select":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue
                placeholder={component.placeholder || "Select an option"}
              />
            </SelectTrigger>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={component.id}
              defaultChecked={component.defaultValue}
              disabled
            />
            <Label htmlFor={component.id}>{component.label}</Label>
          </div>
        );

      case "radio":
        return (
          <RadioGroup disabled>
            {component.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${component.id}-${option.value}`}
                />
                <Label htmlFor={`${component.id}-${option.value}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={component.id}
              defaultChecked={component.defaultValue}
              disabled
            />
            <Label htmlFor={component.id}>{component.label}</Label>
          </div>
        );

      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[component.defaultValue ?? component.min ?? 0]}
              min={component.min ?? 0}
              max={component.max ?? 100}
              step={component.step ?? 1}
              disabled
            />
            <div className="text-sm text-muted-foreground text-center">
              Value: {component.defaultValue ?? component.min ?? 0}
            </div>
          </div>
        );

      case "date":
        const parseDate = (dateStr: string) => {
          if (!dateStr) return undefined;
          const [year, month, day] = dateStr.split("-").map(Number);
          return new Date(year, month - 1, day);
        };

        const defaultDate = component.defaultValue
          ? parseDate(component.defaultValue)
          : undefined;

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !component.defaultValue && "text-muted-foreground"
                )}
                disabled
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {defaultDate ? (
                  format(defaultDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
          </Popover>
        );

      case "file":
        return <Input type="file" accept={component.accept} disabled />;

      default:
        return (
          <div className="text-muted-foreground text-sm">
            Unknown component type: {component.type}
          </div>
        );
    }
  };

  const showLabel =
    component.type !== "checkbox" && component.type !== "switch";

  return (
    <div onClick={onClick} className="space-y-2">
      {showLabel && (
        <Label htmlFor={component.id}>
          {component.label}
          {component.validation.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
      )}
      {renderComponent()}
    </div>
  );
}
