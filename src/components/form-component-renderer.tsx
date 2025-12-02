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
import { useState } from "react";

interface FormComponentRendererProps {
  component: FormComponent;
  onClick?: () => void;
}

export function FormComponentRenderer({
  component,
  onClick,
}: FormComponentRendererProps) {
  // Local state for interactive preview
  const [value, setValue] = useState<any>(component.defaultValue ?? "");

  const renderComponent = () => {
    switch (component.type) {
      case "input":
        return (
          <Input
            placeholder={component.placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required={component.validation.required}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={component.placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required={component.validation.required}
          />
        );

      case "select":
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
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
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={component.id}
              checked={value}
              onCheckedChange={setValue}
            />
            <Label
              htmlFor={component.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {component.label}
            </Label>
          </div>
        );

      case "radio":
        return (
          <RadioGroup value={value} onValueChange={setValue}>
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
              checked={value}
              onCheckedChange={setValue}
            />
            <Label htmlFor={component.id}>{component.label}</Label>
          </div>
        );

      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[value]}
              onValueChange={(vals) => setValue(vals[0])}
              min={component.min ?? 0}
              max={component.max ?? 100}
              step={component.step ?? 1}
            />
            <div className="text-sm text-muted-foreground text-center">
              Value: {value}
            </div>
          </div>
        );

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required={component.validation.required}
          />
        );

      case "file":
        return (
          <Input
            type="file"
            accept={component.accept}
            onChange={(e) => setValue(e.target.files?.[0]?.name || "")}
            required={component.validation.required}
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
    </div>
  );
}
