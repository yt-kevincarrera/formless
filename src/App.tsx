import { Header } from "@/components/header";
import { ComponentLibrary } from "@/components/component-library";
import { Canvas } from "@/components/canvas";
import { PropertiesPanel } from "@/components/properties-panel";
import { CodeDisplay } from "@/components/code-display";
import { Toaster } from "@/components/ui/sonner";
import { useFormBuilderStore } from "@/store/formBuilderStore";
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

function App() {
  const selectedComponentId = useFormBuilderStore(
    (state) => state.selectedComponentId
  );
  const components = useFormBuilderStore((state) => state.components);
  const removeComponent = useFormBuilderStore((state) => state.removeComponent);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Delete or Backspace is pressed
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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 grid grid-cols-[280px_1fr_320px_400px] overflow-hidden">
        <ComponentLibrary />
        <Canvas />
        <PropertiesPanel />
        <CodeDisplay />
      </div>
      <Toaster />

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
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default App;
