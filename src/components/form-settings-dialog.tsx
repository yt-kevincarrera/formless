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
            Configure the layout and buttons for your form
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Layout */}
          <div className="space-y-2">
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={settings.layout}
              onValueChange={(value: "single" | "two-column") =>
                updateSettings({ layout: value })
              }
            >
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Column</SelectItem>
                <SelectItem value="two-column">Two Columns</SelectItem>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
