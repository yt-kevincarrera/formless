import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  useFormBuilderStore,
  selectSelectedComponent,
} from "@/store/formBuilderStore";
import type { FormComponent, Option } from "@/types/form";
import { Trash2, Plus, X, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function PropertiesPanel() {
  const selectedComponent = useFormBuilderStore(selectSelectedComponent);
  const updateComponent = useFormBuilderStore((state) => state.updateComponent);
  const removeComponent = useFormBuilderStore((state) => state.removeComponent);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Local state for inputs to allow typing before validation
  const [localName, setLocalName] = useState(selectedComponent?.name || "");
  const [localPattern, setLocalPattern] = useState(
    selectedComponent?.validation.pattern || ""
  );

  // Update local state when selected component changes
  useEffect(() => {
    if (selectedComponent) {
      setLocalName(selectedComponent.name);
      setLocalPattern(selectedComponent.validation.pattern || "");
      setValidationError(null);
    }
  }, [selectedComponent]);

  if (!selectedComponent) {
    return (
      <div className="h-full overflow-y-auto p-4 bg-sidebar">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">No component selected</p>
        </Card>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<FormComponent>) => {
    try {
      setValidationError(null);
      updateComponent(selectedComponent.id, updates);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update component";
      setValidationError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDelete = () => {
    removeComponent(selectedComponent.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="h-full overflow-y-auto p-4 bg-sidebar">
      <div className="flex items-center justify-between mb-4">
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
        {/* Validation Error Alert */}
        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

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
              value={localName}
              onChange={(e) => {
                setLocalName(e.target.value);
                // Debounced update will happen via useEffect
              }}
              onBlur={() => {
                if (localName !== selectedComponent.name) {
                  handleUpdate({ name: localName });
                }
              }}
              placeholder="field_name"
              className={
                validationError?.includes("name") ? "border-destructive" : ""
              }
            />
            <p className="text-xs text-muted-foreground">
              Must be a valid JavaScript identifier (no spaces, special
              characters, or reserved keywords)
            </p>
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
                  min="0"
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
                  min="0"
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

              {selectedComponent.type === "input" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={selectedComponent.validation.email || false}
                      onCheckedChange={(checked) =>
                        handleUpdate({
                          validation: {
                            ...selectedComponent.validation,
                            email: checked as boolean,
                            url: checked
                              ? false
                              : selectedComponent.validation.url,
                          },
                        })
                      }
                    />
                    <Label htmlFor="email" className="font-normal">
                      Must be valid email
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="url"
                      checked={selectedComponent.validation.url || false}
                      onCheckedChange={(checked) =>
                        handleUpdate({
                          validation: {
                            ...selectedComponent.validation,
                            url: checked as boolean,
                            email: checked
                              ? false
                              : selectedComponent.validation.email,
                          },
                        })
                      }
                    />
                    <Label htmlFor="url" className="font-normal">
                      Must be valid URL
                    </Label>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="pattern">Pattern (Regex)</Label>
                <Input
                  id="pattern"
                  value={localPattern}
                  onChange={(e) => {
                    setLocalPattern(e.target.value);
                  }}
                  onBlur={() => {
                    if (
                      localPattern !==
                      (selectedComponent.validation.pattern || "")
                    ) {
                      handleUpdate({
                        validation: {
                          ...selectedComponent.validation,
                          pattern: localPattern || undefined,
                        },
                      });
                    }
                  }}
                  placeholder="^[a-zA-Z]+$"
                  className={
                    validationError?.includes("regex")
                      ? "border-destructive"
                      : ""
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter a valid regular expression pattern
                </p>
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
                  value={selectedComponent.validation.min ?? ""}
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
                  value={selectedComponent.validation.max ?? ""}
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

          {/* Date validation */}
          {selectedComponent.type === "date" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="minDate">Min Date</Label>
                <Input
                  id="minDate"
                  type="date"
                  value={selectedComponent.validation.minDate || ""}
                  onChange={(e) =>
                    handleUpdate({
                      validation: {
                        ...selectedComponent.validation,
                        minDate: e.target.value || undefined,
                      },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Earliest allowed date
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDate">Max Date</Label>
                <Input
                  id="maxDate"
                  type="date"
                  value={selectedComponent.validation.maxDate || ""}
                  onChange={(e) =>
                    handleUpdate({
                      validation: {
                        ...selectedComponent.validation,
                        maxDate: e.target.value || undefined,
                      },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Latest allowed date
                </p>
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
