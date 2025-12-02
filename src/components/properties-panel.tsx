import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFormBuilderStore } from "@/store/formBuilderStore";
import type { FormComponent, Option } from "@/types/form";
import { Trash2, Plus, X } from "lucide-react";
import { useState } from "react";

export function PropertiesPanel() {
  const selectedComponentId = useFormBuilderStore(
    (state) => state.selectedComponentId
  );
  const components = useFormBuilderStore((state) => state.components);
  const updateComponent = useFormBuilderStore((state) => state.updateComponent);
  const removeComponent = useFormBuilderStore((state) => state.removeComponent);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const selectedComponent = components.find(
    (c) => c.id === selectedComponentId
  );

  if (!selectedComponent) {
    return (
      <div className="h-full overflow-y-auto p-4 bg-sidebar border-l border-sidebar-border">
        <h2 className="text-lg font-semibold mb-4 text-sidebar-foreground">
          Properties
        </h2>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">No component selected</p>
        </Card>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<FormComponent>) => {
    updateComponent(selectedComponent.id, updates);
  };

  const handleDelete = () => {
    removeComponent(selectedComponent.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="h-full overflow-y-auto p-4 bg-sidebar border-l border-sidebar-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          Properties
        </h2>
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="h-8">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Component</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedComponent.label}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-6">
        {/* Common Properties */}
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={selectedComponent.label}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              placeholder="Field label"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={selectedComponent.name}
              onChange={(e) => handleUpdate({ name: e.target.value })}
              placeholder="field_name"
            />
          </div>

          {/* Placeholder for input/textarea */}
          {(selectedComponent.type === "input" ||
            selectedComponent.type === "textarea") && (
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={selectedComponent.placeholder || ""}
                onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                placeholder="Enter placeholder text"
              />
            </div>
          )}

          {/* Default Value */}
          {selectedComponent.type !== "file" && (
            <div className="space-y-2">
              <Label htmlFor="defaultValue">Default Value</Label>
              {selectedComponent.type === "checkbox" ||
              selectedComponent.type === "switch" ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="defaultValue"
                    checked={selectedComponent.defaultValue || false}
                    onCheckedChange={(checked) =>
                      handleUpdate({ defaultValue: checked })
                    }
                  />
                  <Label htmlFor="defaultValue" className="font-normal">
                    Checked by default
                  </Label>
                </div>
              ) : (
                <Input
                  id="defaultValue"
                  value={selectedComponent.defaultValue || ""}
                  onChange={(e) =>
                    handleUpdate({ defaultValue: e.target.value })
                  }
                  placeholder="Default value"
                />
              )}
            </div>
          )}
        </Card>

        {/* Validation Rules */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-sm">Validation</h3>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={selectedComponent.validation.required || false}
              onCheckedChange={(checked) =>
                handleUpdate({
                  validation: {
                    ...selectedComponent.validation,
                    required: checked as boolean,
                  },
                })
              }
            />
            <Label htmlFor="required" className="font-normal">
              Required
            </Label>
          </div>

          {/* String validation (input, textarea) */}
          {(selectedComponent.type === "input" ||
            selectedComponent.type === "textarea") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="minLength">Min Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  value={selectedComponent.validation.minLength || ""}
                  onChange={(e) =>
                    handleUpdate({
                      validation: {
                        ...selectedComponent.validation,
                        minLength: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      },
                    })
                  }
                  placeholder="Minimum length"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLength">Max Length</Label>
                <Input
                  id="maxLength"
                  type="number"
                  value={selectedComponent.validation.maxLength || ""}
                  onChange={(e) =>
                    handleUpdate({
                      validation: {
                        ...selectedComponent.validation,
                        maxLength: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      },
                    })
                  }
                  placeholder="Maximum length"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern">Pattern (Regex)</Label>
                <Input
                  id="pattern"
                  value={selectedComponent.validation.pattern || ""}
                  onChange={(e) =>
                    handleUpdate({
                      validation: {
                        ...selectedComponent.validation,
                        pattern: e.target.value || undefined,
                      },
                    })
                  }
                  placeholder="^[a-zA-Z]+$"
                />
              </div>
            </>
          )}

          {/* Number validation (slider) */}
          {selectedComponent.type === "slider" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="min">Min Value</Label>
                <Input
                  id="min"
                  type="number"
                  value={selectedComponent.validation.min || ""}
                  onChange={(e) =>
                    handleUpdate({
                      validation: {
                        ...selectedComponent.validation,
                        min: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      },
                    })
                  }
                  placeholder="Minimum value"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max">Max Value</Label>
                <Input
                  id="max"
                  type="number"
                  value={selectedComponent.validation.max || ""}
                  onChange={(e) =>
                    handleUpdate({
                      validation: {
                        ...selectedComponent.validation,
                        max: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      },
                    })
                  }
                  placeholder="Maximum value"
                />
              </div>
            </>
          )}
        </Card>

        {/* Options Editor for Select and Radio */}
        {(selectedComponent.type === "select" ||
          selectedComponent.type === "radio") && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Options</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOption: Option = {
                    label: `Option ${
                      (selectedComponent.options?.length || 0) + 1
                    }`,
                    value: `option${
                      (selectedComponent.options?.length || 0) + 1
                    }`,
                  };
                  handleUpdate({
                    options: [...(selectedComponent.options || []), newOption],
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>

            <div className="space-y-3">
              {selectedComponent.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 border rounded-md"
                >
                  <div className="flex-1 space-y-2">
                    <Input
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [
                          ...(selectedComponent.options || []),
                        ];
                        newOptions[index] = {
                          ...newOptions[index],
                          label: e.target.value,
                        };
                        handleUpdate({ options: newOptions });
                      }}
                      placeholder="Label"
                      className="h-8"
                    />
                    <Input
                      value={option.value}
                      onChange={(e) => {
                        const newOptions = [
                          ...(selectedComponent.options || []),
                        ];
                        newOptions[index] = {
                          ...newOptions[index],
                          value: e.target.value,
                        };
                        handleUpdate({ options: newOptions });
                      }}
                      placeholder="Value"
                      className="h-8"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOptions = selectedComponent.options?.filter(
                        (_, i) => i !== index
                      );
                      handleUpdate({ options: newOptions });
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Slider-specific properties */}
        {selectedComponent.type === "slider" && (
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">Slider Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="slider-min">Min</Label>
              <Input
                id="slider-min"
                type="number"
                value={selectedComponent.min ?? 0}
                onChange={(e) =>
                  handleUpdate({
                    min: e.target.value ? parseInt(e.target.value) : 0,
                  })
                }
                placeholder="Minimum value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slider-max">Max</Label>
              <Input
                id="slider-max"
                type="number"
                value={selectedComponent.max ?? 100}
                onChange={(e) =>
                  handleUpdate({
                    max: e.target.value ? parseInt(e.target.value) : 100,
                  })
                }
                placeholder="Maximum value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slider-step">Step</Label>
              <Input
                id="slider-step"
                type="number"
                value={selectedComponent.step ?? 1}
                onChange={(e) =>
                  handleUpdate({
                    step: e.target.value ? parseInt(e.target.value) : 1,
                  })
                }
                placeholder="Step value"
              />
            </div>
          </Card>
        )}

        {/* File upload-specific properties */}
        {selectedComponent.type === "file" && (
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">File Upload Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="accept">Accepted File Types</Label>
              <Input
                id="accept"
                value={selectedComponent.accept || "*"}
                onChange={(e) => handleUpdate({ accept: e.target.value })}
                placeholder="e.g., image/*,.pdf,.doc"
              />
              <p className="text-xs text-muted-foreground">
                Use MIME types or file extensions (e.g., image/*, .pdf)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSize">Max File Size (bytes)</Label>
              <Input
                id="maxSize"
                type="number"
                value={selectedComponent.maxSize ?? 5242880}
                onChange={(e) =>
                  handleUpdate({
                    maxSize: e.target.value
                      ? parseInt(e.target.value)
                      : 5242880,
                  })
                }
                placeholder="5242880 (5MB)"
              />
              <p className="text-xs text-muted-foreground">
                {selectedComponent.maxSize
                  ? `${(selectedComponent.maxSize / 1024 / 1024).toFixed(2)} MB`
                  : "5.00 MB"}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
