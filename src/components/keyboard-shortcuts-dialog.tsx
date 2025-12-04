import { useState } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  const shortcuts = [
    {
      category: "General",
      items: [        { keys: ["Ctrl/Cmd", "Z"], description: "Undo" },
        {
          keys: ["Ctrl/Cmd", "Shift", "Z"],
          description: "Redo",
        },
        { keys: ["?"], description: "Show keyboard shortcuts" },
      ],
    },
    {
      category: "Component Management",
      items: [
        { keys: ["Delete"], description: "Delete selected component" },
        { keys: ["Backspace"], description: "Delete selected component" },
        { keys: ["Escape"], description: "Deselect component" },
        { keys: ["Tab"], description: "Navigate between fields" },
      ],
    },
    {
      category: "Canvas",
      items: [
        { keys: ["Click"], description: "Select component" },
        { keys: ["Drag"], description: "Reorder components" },
        { keys: ["Drag from sidebar"], description: "Add new component" },
      ],
    },
    {
      category: "Accessibility",
      items: [
        { keys: ["Tab"], description: "Navigate forward" },
        { keys: ["Shift", "Tab"], description: "Navigate backward" },
        { keys: ["Enter"], description: "Activate button/link" },
        { keys: ["Space"], description: "Toggle checkbox/switch" },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Keyboard shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to work more efficiently
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="font-semibold text-sm mb-3 text-foreground">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span
                          key={keyIndex}
                          className="flex items-center gap-1"
                        >
                          <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
