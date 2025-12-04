import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormBuilderStore } from "@/store/formBuilderStore";
import { Settings } from "lucide-react";

export function FormSettingsDialog() {
  const settings = useFormBuilderStore((state) => state.settings);
  const updateSettings = useFormBuilderStore((state) => state.updateSettings);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Form Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Form Settings</DialogTitle>
          <DialogDescription>
            Configure your form's appearance and behavior
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* Form Metadata */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Form Information</h3>
            <div className="space-y-2">
              <Label htmlFor="formName">Form Name</Label>
              <Input
                id="formName"
                value={settings.formName}
                onChange={(e) => updateSettings({ formName: e.target.value })}
                placeholder="My Form"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formDescription">Description (optional)</Label>
              <Input
                id="formDescription"
                value={settings.formDescription}
                onChange={(e) =>
                  updateSettings({ formDescription: e.target.value })
                }
                placeholder="Brief description of your form"
              />
            </div>
          </div>

          {/* Form Width */}
          <div className="space-y-2">
            <Label htmlFor="formWidth">Form Width</Label>
            <Select
              value={settings.formWidth}
              onValueChange={(value: "sm" | "md" | "lg" | "xl" | "full") =>
                updateSettings({ formWidth: value })
              }
            >
              <SelectTrigger id="formWidth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small (640px)</SelectItem>
                <SelectItem value="md">Medium (768px)</SelectItem>
                <SelectItem value="lg">Large (1024px)</SelectItem>
                <SelectItem value="xl">Extra Large (1280px)</SelectItem>
                <SelectItem value="full">Full Width</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Spacing */}
          <div className="space-y-2">
            <Label htmlFor="spacing">Field Spacing</Label>
            <Select
              value={settings.spacing}
              onValueChange={(value: "compact" | "normal" | "relaxed") =>
                updateSettings({ spacing: value })
              }
            >
              <SelectTrigger id="spacing">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="relaxed">Relaxed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showSubmit"
                checked={settings.showSubmitButton}
                onCheckedChange={(checked) =>
                  updateSettings({ showSubmitButton: checked as boolean })
                }
              />
              <Label htmlFor="showSubmit" className="font-normal">
                Show Submit Button
              </Label>
            </div>
            {settings.showSubmitButton && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="submitText">Submit Button Text</Label>
                <Input
                  id="submitText"
                  value={settings.submitButtonText}
                  onChange={(e) =>
                    updateSettings({ submitButtonText: e.target.value })
                  }
                  placeholder="Submit"
                />
              </div>
            )}
          </div>

          {/* Cancel Button */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showCancel"
                checked={settings.showCancelButton}
                onCheckedChange={(checked) =>
                  updateSettings({ showCancelButton: checked as boolean })
                }
              />
              <Label htmlFor="showCancel" className="font-normal">
                Show Cancel Button
              </Label>
            </div>
            {settings.showCancelButton && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="cancelText">Cancel Button Text</Label>
                <Input
                  id="cancelText"
                  value={settings.cancelButtonText}
                  onChange={(e) =>
                    updateSettings({ cancelButtonText: e.target.value })
                  }
                  placeholder="Cancel"
                />
              </div>
            )}
          </div>

          {/* Form Behavior */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Form Behavior</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="resetOnSubmit"
                checked={settings.resetOnSubmit}
                onCheckedChange={(checked) =>
                  updateSettings({ resetOnSubmit: checked as boolean })
                }
              />
              <Label htmlFor="resetOnSubmit" className="font-normal">
                Reset form after submission
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showSuccessMessage"
                checked={settings.showSuccessMessage}
                onCheckedChange={(checked) =>
                  updateSettings({ showSuccessMessage: checked as boolean })
                }
              />
              <Label htmlFor="showSuccessMessage" className="font-normal">
                Show success message
              </Label>
            </div>
            {settings.showSuccessMessage && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="successMessage">Success Message</Label>
                <Input
                  id="successMessage"
                  value={settings.successMessage}
                  onChange={(e) =>
                    updateSettings({ successMessage: e.target.value })
                  }
                  placeholder="Form submitted successfully!"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
