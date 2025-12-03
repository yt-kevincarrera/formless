import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFormBuilderStore } from "@/store/formBuilderStore";
import { ExportDialog } from "@/components/export-dialog";
import { ImportDialog } from "@/components/import-dialog";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { FormSettingsDialog } from "@/components/form-settings-dialog";

export function Header() {
  const theme = useFormBuilderStore((state) => state.theme);
  const setTheme = useFormBuilderStore((state) => state.setTheme);

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Formless</h1>
          <p className="text-sm text-muted-foreground">Visual Form Builder</p>
        </div>
        <div className="flex items-center gap-4">
          <FormSettingsDialog />
          <ImportDialog />
          <ExportDialog />
          <KeyboardShortcutsDialog />
          <div className="flex items-center gap-3">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={handleThemeToggle}
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="theme-toggle" className="sr-only">
              Toggle theme
            </Label>
          </div>
        </div>
      </div>
    </header>
  );
}
