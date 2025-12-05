import { useState, useMemo } from "react";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormComponentRenderer } from "@/components/form-component-renderer";
import { useFormBuilderStore } from "@/store/formBuilderStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateZodSchema } from "@/lib/zodSchemaGenerator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FormComponent } from "@/types/form";

export function PreviewDialog() {
  const [open, setOpen] = useState(false);
  const components = useFormBuilderStore((state) => state.components);
  const settings = useFormBuilderStore((state) => state.settings);

  // Generate Zod schema from components
  const zodSchema = generateZodSchema(components);

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: components.reduce((acc, component) => {
      acc[component.name] = component.defaultValue ?? "";
      return acc;
    }, {} as Record<string, any>),
  });

  const onSubmit = (data: any) => {
    console.log("Form submitted:", data);
    if (settings.showSuccessMessage) {
      toast.success(settings.successMessage || "Form submitted successfully!");
    }
    if (settings.resetOnSubmit) {
      reset();
    }
  };

  const handleCancel = () => {
    reset();
    setOpen(false);
  };

  const formWidthClass = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full",
  }[settings.formWidth || "md"];

  const spacingClass = {
    compact: "space-y-3",
    normal: "space-y-4",
    relaxed: "space-y-6",
  }[settings.spacing || "normal"];

  // Group components by row based on their layout
  const componentRows = useMemo(() => {
    // Sort components by layout position (top to bottom, left to right)
    const sortedComponents = [...components].sort((a, b) => {
      const aLayout = a.layout || { x: 0, y: 0, w: 12, h: 1 };
      const bLayout = b.layout || { x: 0, y: 0, w: 12, h: 1 };

      // Sort by row first, then by column
      if (aLayout.y !== bLayout.y) {
        return aLayout.y - bLayout.y;
      }
      return aLayout.x - bLayout.x;
    });

    // Group components by row
    const rows: FormComponent[][] = [];
    sortedComponents.forEach((component) => {
      const layout = component.layout || { x: 0, y: 0, w: 12, h: 1 };
      const rowIndex = layout.y;

      if (!rows[rowIndex]) {
        rows[rowIndex] = [];
      }
      rows[rowIndex].push(component);
    });

    return rows.filter((row) => row.length > 0);
  }, [components]);

  // Get Tailwind col-span class based on width
  const getColSpanClass = (width: number) => {
    const colSpanMap: Record<number, string> = {
      1: "md:col-span-1",
      2: "md:col-span-2",
      3: "md:col-span-3",
      4: "md:col-span-4",
      5: "md:col-span-5",
      6: "md:col-span-6",
      7: "md:col-span-7",
      8: "md:col-span-8",
      9: "md:col-span-9",
      10: "md:col-span-10",
      11: "md:col-span-11",
      12: "md:col-span-12",
    };
    return colSpanMap[width] || "md:col-span-12";
  };

  // Render components with grid layout matching the canvas
  const renderComponentsWithLayout = () => {
    return componentRows.map((row, rowIndex) => {
      if (row.length === 1 && (row[0].layout?.w ?? 12) === 12) {
        // Full width component - no grid wrapper needed
        return (
          <FormComponentRenderer
            key={row[0].id}
            component={row[0]}
            control={control}
            errors={errors}
          />
        );
      } else {
        // Multiple components in row or partial width - use grid
        return (
          <div
            key={rowIndex}
            className="grid grid-cols-1 md:grid-cols-12 gap-4"
          >
            {row.map((component) => {
              const layout = component.layout || { x: 0, y: 0, w: 12, h: 1 };
              const colSpanClass = getColSpanClass(layout.w);
              return (
                <div key={component.id} className={colSpanClass}>
                  <FormComponentRenderer
                    component={component}
                    control={control}
                    errors={errors}
                  />
                </div>
              );
            })}
          </div>
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Preview form">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(formWidthClass, "max-h-[90vh] overflow-y-auto")}
      >
        <DialogHeader>
          <DialogTitle>{settings.formName || "Form Preview"}</DialogTitle>
          {settings.formDescription && (
            <DialogDescription>{settings.formDescription}</DialogDescription>
          )}
        </DialogHeader>

        {components.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No components added yet.</p>
            <p className="text-sm mt-2">
              Add components from the library to preview your form.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="py-4">
            <div className={spacingClass}>{renderComponentsWithLayout()}</div>

            {(settings.showSubmitButton || settings.showCancelButton) && (
              <div className="flex gap-3 mt-6 pt-4 border-t">
                {settings.showSubmitButton && (
                  <Button type="submit">
                    {settings.submitButtonText || "Submit"}
                  </Button>
                )}
                {settings.showCancelButton && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    {settings.cancelButtonText || "Cancel"}
                  </Button>
                )}
              </div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
