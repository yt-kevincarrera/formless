import { useState, useRef } from "react";
import { Upload, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useFormBuilderStore } from "@/store/formBuilderStore";

export function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importSchema = useFormBuilderStore((state) => state.importSchema);

  /**
   * Handle file selection and import
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setError(null);

    try {
      // Read file content
      const text = await file.text();

      // Validate JSON structure
      let schema;
      try {
        schema = JSON.parse(text);
      } catch (parseError) {
        throw new Error("Invalid JSON format. Please check your file.");
      }

      // Validate schema structure
      if (!schema.components) {
        throw new Error(
          "Invalid schema: missing 'components' field. Expected a form schema with a components array."
        );
      }

      if (!Array.isArray(schema.components)) {
        throw new Error(
          "Invalid schema: 'components' must be an array. Found: " +
            typeof schema.components
        );
      }

      // Validate each component has required fields
      for (let i = 0; i < schema.components.length; i++) {
        const component = schema.components[i];
        if (!component.id) {
          throw new Error(
            `Invalid schema: component at index ${i} is missing required field 'id'`
          );
        }
        if (!component.type) {
          throw new Error(
            `Invalid schema: component at index ${i} is missing required field 'type'`
          );
        }
        if (!component.name) {
          throw new Error(
            `Invalid schema: component at index ${i} is missing required field 'name'`
          );
        }

        // Validate component type
        const validTypes = [
          "input",
          "textarea",
          "select",
          "checkbox",
          "radio",
          "switch",
          "slider",
          "date",
          "file",
        ];
        if (!validTypes.includes(component.type)) {
          throw new Error(
            `Invalid schema: component at index ${i} has invalid type '${
              component.type
            }'. Valid types are: ${validTypes.join(", ")}`
          );
        }
      }

      // Import the schema
      importSchema(text);

      // Show success message
      toast.success("Schema imported successfully");

      // Close dialog and reset file input
      setOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      // Handle errors gracefully - maintain current state
      const errorMessage =
        err instanceof Error ? err.message : "Failed to import schema";
      setError(errorMessage);
      console.error("Import error:", err);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /**
   * Trigger file input click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle dialog close - clear error state
   */
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Form Schema</DialogTitle>
          <DialogDescription>
            Upload a JSON schema file to restore a previously exported form
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Import Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload Button */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose JSON File
          </Button>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Select a form schema JSON file that was previously exported from
              Formless.
            </p>
            <p className="text-xs">
              Note: Importing will replace your current form. Make sure to
              export your current work first if you want to keep it.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
