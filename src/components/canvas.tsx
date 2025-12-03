import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import {
  useFormBuilderStore,
  selectComponents,
  selectSelectedComponentId,
} from "@/store/formBuilderStore";
import type { FormComponent } from "@/types/form";
import { FormComponentRenderer } from "@/components/form-component-renderer";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  generateZodSchema,
  generateDefaultValues,
} from "@/lib/zodSchemaGenerator";

interface SortableComponentProps {
  component: FormComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  control: any;
  errors: any;
}

function SortableComponent({
  component,
  isSelected,
  onSelect,
  control,
  errors,
}: SortableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
    data: {
      type: component.type,
      source: "canvas",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
        isDragging
          ? "opacity-30 scale-95 rotate-2 shadow-xl border-primary"
          : isSelected
          ? "border-primary bg-accent shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
      }`}
    >
      <div className="space-y-2">
        {/* Drag handle area */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-between cursor-grab active:cursor-grabbing p-2 -m-2 rounded hover:bg-accent/50 transition-colors"
          title="Drag to reorder"
        >
          <div className="flex-1">
            <div className="text-xs text-muted-foreground font-medium">
              {component.type} • {component.name}
            </div>
          </div>
          <div className="text-xs text-muted-foreground select-none">⋮⋮</div>
        </div>

        {/* Actual form component preview with validation */}
        <div onClick={() => onSelect(component.id)} className="cursor-pointer">
          <FormComponentRenderer
            component={component}
            control={control}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );
}

export function Canvas() {
  const components = useFormBuilderStore(selectComponents);
  const selectedComponentId = useFormBuilderStore(selectSelectedComponentId);
  const addComponent = useFormBuilderStore((state) => state.addComponent);
  const reorderComponents = useFormBuilderStore(
    (state) => state.reorderComponents
  );
  const selectComponent = useFormBuilderStore((state) => state.selectComponent);
  const removeComponent = useFormBuilderStore((state) => state.removeComponent);

  const [activeId, setActiveId] = useState<string | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete or Backspace to delete selected component
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedComponentId
      ) {
        // Don't delete if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }

        e.preventDefault();
        removeComponent(selectedComponentId);
      }

      // Escape to deselect
      if (e.key === "Escape" && selectedComponentId) {
        e.preventDefault();
        selectComponent(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedComponentId, removeComponent, selectComponent]);

  // Generate Zod schema and default values from components
  const schema = useMemo(() => {
    if (components.length === 0) {
      return null;
    }
    return generateZodSchema(components);
  }, [components]);

  const defaultValues = useMemo(() => {
    return generateDefaultValues(components);
  }, [components]);

  // Set up React Hook Form with Zod validation
  const {
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: "onChange", // Validate on change for real-time feedback
  });

  // Reset form when components change
  useMemo(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-droppable",
  });

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Case 1: Dragging from library to canvas
    if (activeData?.source === "library") {
      const componentType = activeData.type;
      let position = components.length;

      // If dropping over an existing component, insert before it
      if (overData?.source === "canvas") {
        const overIndex = components.findIndex((c) => c.id === over.id);
        if (overIndex !== -1) {
          position = overIndex;
        }
      }

      addComponent(componentType, position);
    }
    // Case 2: Reordering components within canvas
    else if (activeData?.source === "canvas" && overData?.source === "canvas") {
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderComponents(oldIndex, newIndex);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <main
        className="h-full overflow-y-auto p-6 bg-background"
        role="main"
        aria-label="Form canvas"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Canvas</h2>
          <Card
            ref={setNodeRef}
            role="region"
            aria-label="Form builder canvas - drop components here"
            className={`p-8 min-h-[400px] transition-colors ${
              isOver ? "bg-accent/50 border-primary" : ""
            }`}
          >
            {components.length === 0 ? (
              <div
                className="flex items-center justify-center h-[400px]"
                role="status"
                aria-live="polite"
              >
                <div className="text-center">
                  <p className="text-muted-foreground text-lg mb-2">
                    Drag components from the sidebar to start building your form
                  </p>
                  <p className="text-muted-foreground text-sm">
                    You can reorder components by dragging them within the
                    canvas
                  </p>
                </div>
              </div>
            ) : (
              <SortableContext
                items={components.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="space-y-3"
                  role="list"
                  aria-label="Form components"
                >
                  {components.map((component) => (
                    <div key={component.id} role="listitem">
                      <SortableComponent
                        component={component}
                        isSelected={component.id === selectedComponentId}
                        onSelect={selectComponent}
                        control={control}
                        errors={errors}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            )}
          </Card>
        </div>
      </main>
      <DragOverlay>
        {activeId ? (
          <div className="p-4 rounded-lg border-2 border-primary bg-card shadow-2xl opacity-95 rotate-3 scale-105">
            <div className="font-medium text-sm flex items-center gap-2">
              <span className="animate-pulse">↕</span>
              <span>Moving component...</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
