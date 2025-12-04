import { useDroppable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useFormBuilderStore,
  selectComponents,
  selectSelectedComponentId,
} from "@/store/formBuilderStore";
import type { FormComponent } from "@/types/form";
import { FormComponentRenderer } from "@/components/form-component-renderer";
import { useMemo, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  generateZodSchema,
  generateDefaultValues,
} from "@/lib/zodSchemaGenerator";
import { toast } from "sonner";
import GridLayout, { type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";

interface GridComponentProps {
  component: FormComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  control: any;
  errors: any;
}

function GridComponent({
  component,
  isSelected,
  onSelect,
  control,
  errors,
}: GridComponentProps) {
  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't select if clicking on an input/textarea/button (to allow interaction)
    const target = e.target as HTMLElement;
    const isInteractiveElement =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "BUTTON" ||
      target.tagName === "SELECT" ||
      target.closest("button") ||
      target.closest('[role="slider"]') ||
      target.closest('[role="checkbox"]') ||
      target.closest('[role="switch"]');

    if (!isInteractiveElement) {
      onSelect(component.id);
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`h-full w-full p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? "border-primary bg-accent shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
      }`}
    >
      <div className="h-full flex flex-col gap-1.5">
        {/* Drag handle area */}
        <div
          className="flex items-center justify-between cursor-grab active:cursor-grabbing p-1.5 -mx-1.5 rounded hover:bg-accent/50 transition-colors shrink-0"
          title="Drag to move or resize"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1">
            <div className="text-xs text-muted-foreground font-medium">
              {component.type} • {component.name}
            </div>
          </div>
          <div className="text-xs text-muted-foreground select-none">⋮⋮</div>
        </div>

        {/* Actual form component preview with validation */}
        <div
          className={`pointer-events-auto flex-1 min-h-0 ${
            component.type === "radio" || component.type === "select"
              ? "overflow-y-auto"
              : "overflow-visible"
          }`}
          onFocus={() => onSelect(component.id)}
          onMouseDown={(e) => {
            // Select on mouse down for immediate feedback
            const target = e.target as HTMLElement;
            const isInteractiveElement =
              target.tagName === "INPUT" ||
              target.tagName === "TEXTAREA" ||
              target.tagName === "BUTTON" ||
              target.tagName === "SELECT" ||
              target.closest("button") ||
              target.closest('[role="slider"]') ||
              target.closest('[role="checkbox"]') ||
              target.closest('[role="switch"]');

            if (isInteractiveElement) {
              onSelect(component.id);
            }
          }}
        >
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
  const settings = useFormBuilderStore((state) => state.settings);
  const selectComponent = useFormBuilderStore((state) => state.selectComponent);
  const removeComponent = useFormBuilderStore((state) => state.removeComponent);
  const updateComponent = useFormBuilderStore((state) => state.updateComponent);

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (gridContainerRef.current) {
        const width = gridContainerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    // Initial measurement
    updateWidth();

    window.addEventListener("resize", updateWidth);
    const resizeObserver = new ResizeObserver(updateWidth);
    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateWidth);
      resizeObserver.disconnect();
    };
  }, [components.length]); // Re-measure when components change

  const layout: Layout[] = useMemo(() => {
    return components.map((component, index) => {
      const getMinHeight = (type: string) => {
        switch (type) {
          case "checkbox":
          case "switch":
            return 1.25; 
          case "textarea":
            return 2; 
          default:
            return 2; 
        }
      };

      const defaultH = component.layout?.h ?? 2;
      const minH = getMinHeight(component.type);

      return {
        i: component.id,
        x: component.layout?.x ?? 0,
        y: component.layout?.y ?? index * 2,
        w: component.layout?.w ?? 12,
        h: defaultH,
        minW: 2, // Minimum 2 columns
        minH: minH,
      };
    });
  }, [components]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    newLayout.forEach((item) => {
      const component = components.find((c) => c.id === item.i);
      if (component) {
        const currentLayout = component.layout || { x: 0, y: 0, w: 12, h: 1 };
        const hasChanged =
          currentLayout.x !== item.x ||
          currentLayout.y !== item.y ||
          currentLayout.w !== item.w ||
          currentLayout.h !== item.h;

        if (hasChanged) {
          updateComponent(component.id, {
            layout: {
              x: item.x,
              y: item.y,
              w: item.w,
              h: item.h,
            },
          });
        }
      }
    });
  };

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

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-droppable",
    data: {
      type: "canvas",
      source: "canvas",
    },
  });

  const handleSubmit = (data: any) => {
    toast.success("Form submitted!", {
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4 overflow-auto">
          <code className="text-white text-xs">
            {JSON.stringify(data, null, 2)}
          </code>
        </pre>
      ),
      duration: 10000,
    });
  };

  return (
    <main
      className="h-full overflow-y-auto p-6 bg-background"
      role="main"
      aria-label="Form canvas"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Canvas</h2>
        <form onSubmit={control.handleSubmit(handleSubmit)}>
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
                    Drag to reposition • Drag corners to resize
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div
                  ref={gridContainerRef}
                  className="w-full relative"
                  style={{ minHeight: "200px" }}
                >
                  <GridLayout
                    className="layout"
                    layout={layout}
                    cols={12}
                    rowHeight={55}
                    width={containerWidth}
                    onLayoutChange={handleLayoutChange}
                    draggableHandle=".cursor-grab"
                    compactType={null}
                    preventCollision={false}
                    isResizable={true}
                    isDraggable={true}
                    margin={[8, 8]}
                  >
                    {components.map((component) => (
                      <div key={component.id}>
                        <GridComponent
                          component={component}
                          isSelected={component.id === selectedComponentId}
                          onSelect={selectComponent}
                          control={control}
                          errors={errors}
                        />
                      </div>
                    ))}
                  </GridLayout>

                  {/* Helpful hint overlay */}
                  {components.length > 0 && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
                      <strong>💡 Tips:</strong> Drag the <strong>⋮⋮</strong>{" "}
                      icon to move • Drag the{" "}
                      <strong>bottom-right corner</strong> to resize • Change
                      width in Properties panel
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                {(settings.showSubmitButton || settings.showCancelButton) && (
                  <div className="flex gap-3 pt-4 border-t mt-6">
                    {settings.showSubmitButton && (
                      <Button type="submit">
                        {settings.submitButtonText || "Submit"}
                      </Button>
                    )}
                    {settings.showCancelButton && (
                      <Button type="button" variant="outline">
                        {settings.cancelButtonText || "Cancel"}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </Card>
        </form>
      </div>
    </main>
  );
}
