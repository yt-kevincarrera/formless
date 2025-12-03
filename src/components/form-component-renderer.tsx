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
            render={({ field }) => (
              <Input
                {...field}
                type="date"
                className={error ? "border-destructive" : ""}
              />
            )}
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
        return (
          <Input type="date" defaultValue={component.defaultValue} disabled />
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
