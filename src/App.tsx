import { Header } from "@/components/header";
import { ComponentLibrary } from "@/components/component-library";
import { Canvas } from "@/components/canvas";
import { PropertiesPanel } from "@/components/properties-panel";
import { CodeDisplay } from "@/components/code-display";
import { Toaster } from "@/components/ui/sonner";
import {
  useFormBuilderStore,
  selectSelectedComponentId,
  selectComponents,
} from "@/store/formBuilderStore";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function App() {
  const selectedComponentId = useFormBuilderStore(selectSelectedComponentId);
  const components = useFormBuilderStore(selectComponents);
  const removeComponent = useFormBuilderStore((state) => state.removeComponent);
  const addComponent = useFormBuilderStore((state) => state.addComponent);
  const reorderComponents = useFormBuilderStore(
    (state) => state.reorderComponents
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<string | null>(
    null
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Don't trigger if user is typing in an input field
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }

        // Only trigger if a component is selected
        if (selectedComponentId) {
          e.preventDefault();
          setComponentToDelete(selectedComponentId);
          setIsDeleteDialogOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedComponentId]);

  const handleDelete = () => {
    if (componentToDelete) {
      removeComponent(componentToDelete);
      setComponentToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const componentLabel = componentToDelete
    ? components.find((c) => c.id === componentToDelete)?.label
    : "";

  const handleDragStart = (event: DragStartEvent) => {
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
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 grid grid-cols-[280px_1fr_400px] overflow-hidden">
          <ComponentLibrary />
          <Canvas />
          <div className="h-full overflow-hidden">
            <Tabs defaultValue="properties" className="h-full flex flex-col">
              <div className="px-4 pt-4 border-l border-border bg-sidebar">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent
                value="properties"
                className="flex-1 m-0 overflow-hidden"
              >
                <PropertiesPanel />
              </TabsContent>
              <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
                <CodeDisplay />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <Toaster closeButton />

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

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Component</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{componentLabel}"? This action
                cannot be undone.
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
    </DndContext>
  );
}

export default App;
