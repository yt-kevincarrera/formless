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
import { useFormBuilderStore } from "@/store/formBuilderStore";
import type { FormComponent } from "@/types/form";
import { FormComponentRenderer } from "@/components/form-component-renderer";
import { useState } from "react";

interface SortableComponentProps {
  component: FormComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function SortableComponent({
  component,
  isSelected,
  onSelect,
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
      className={`p-4 rounded-lg border-2 transition-all ${
        isDragging
          ? "opacity-50 scale-95"
          : isSelected
          ? "border-primary bg-accent"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div className="space-y-2">
        {/* Drag handle area */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-between cursor-move p-2 -m-2 rounded hover:bg-accent/50"
        >
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">
              {component.type} • {component.name}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">⋮⋮</div>
        </div>

        {/* Actual form component preview */}
        <div onClick={() => onSelect(component.id)} className="cursor-pointer">
          <FormComponentRenderer component={component} />
        </div>
      </div>
    </div>
  );
}

export function Canvas() {
  const components = useFormBuilderStore((state) => state.components);
  const selectedComponentId = useFormBuilderStore(
    (state) => state.selectedComponentId
  );
  const addComponent = useFormBuilderStore((state) => state.addComponent);
  const reorderComponents = useFormBuilderStore(
    (state) => state.reorderComponents
  );
  const selectComponent = useFormBuilderStore((state) => state.selectComponent);

  const [activeId, setActiveId] = useState<string | null>(null);

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
      <div className="h-full overflow-y-auto p-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Canvas</h2>
          <Card
            ref={setNodeRef}
            className={`p-8 min-h-[400px] transition-colors ${
              isOver ? "bg-accent/50 border-primary" : ""
            }`}
          >
            {components.length === 0 ? (
              <div className="flex items-center justify-center h-[400px]">
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
                <div className="space-y-3">
                  {components.map((component) => (
                    <SortableComponent
                      key={component.id}
                      component={component}
                      isSelected={component.id === selectedComponentId}
                      onSelect={selectComponent}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </Card>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="p-4 rounded-lg border-2 border-primary bg-card shadow-lg opacity-90">
            <div className="font-medium text-sm">Dragging...</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
