import { useDraggable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import type { ComponentType } from "@/types/form";
import {
  Type,
  KeyRound,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Circle,
  ToggleLeft,
  SlidersHorizontal,
  Calendar,
  Upload,
} from "lucide-react";

interface ComponentLibraryItem {
  type: ComponentType;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const COMPONENT_LIBRARY: ComponentLibraryItem[] = [
  {
    type: "input",
    icon: <Type className="w-5 h-5" />,
    label: "Text Input",
    description: "Single line text",
  },
  {
    type: "password",
    icon: <KeyRound className="w-5 h-5" />,
    label: "Password",
    description: "Password input",
  },
  {
    type: "textarea",
    icon: <AlignLeft className="w-5 h-5" />,
    label: "Textarea",
    description: "Multi-line text",
  },
  {
    type: "select",
    icon: <ChevronDown className="w-5 h-5" />,
    label: "Select",
    description: "Dropdown selection",
  },
  {
    type: "checkbox",
    icon: <CheckSquare className="w-5 h-5" />,
    label: "Checkbox",
    description: "Boolean toggle",
  },
  {
    type: "radio",
    icon: <Circle className="w-5 h-5" />,
    label: "Radio Group",
    description: "Single choice",
  },
  {
    type: "switch",
    icon: <ToggleLeft className="w-5 h-5" />,
    label: "Switch",
    description: "Toggle switch",
  },
  {
    type: "slider",
    icon: <SlidersHorizontal className="w-5 h-5" />,
    label: "Slider",
    description: "Range input",
  },
  {
    type: "date",
    icon: <Calendar className="w-5 h-5" />,
    label: "Date Picker",
    description: "Date selection",
  },
  {
    type: "file",
    icon: <Upload className="w-5 h-5" />,
    label: "File Upload",
    description: "File input",
  },
];

interface DraggableComponentProps {
  item: ComponentLibraryItem;
}

function DraggableComponent({ item }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${item.type}`,
    data: {
      type: item.type,
      source: "library",
    },
  });

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      aria-label={`Drag ${item.label} component to canvas`}
      title={`Drag to add ${item.label}`}
      className={`p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        isDragging ? "opacity-50 scale-95" : "opacity-100"
      }`}
      onKeyDown={(e) => {
        // Allow keyboard activation with Enter or Space
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Trigger drag start programmatically would require more complex implementation
          // For now, provide visual feedback
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-primary mt-0.5" aria-hidden="true">
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground">{item.label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function ComponentLibrary() {
  return (
    <aside
      className="h-full overflow-y-auto p-4 bg-sidebar border-r border-sidebar-border"
      aria-label="Component library"
    >
      <h2 className="text-lg font-semibold mb-4 text-sidebar-foreground">
        Component Library
      </h2>
      <div
        className="space-y-2"
        role="list"
        aria-label="Available form components"
      >
        {COMPONENT_LIBRARY.map((item) => (
          <div key={item.type} role="listitem">
            <DraggableComponent item={item} />
          </div>
        ))}
      </div>
    </aside>
  );
}
