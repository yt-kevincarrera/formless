import { Card } from "@/components/ui/card";
import { useFormBuilderStore } from "@/store/formBuilderStore";

export function PropertiesPanel() {
  const selectedComponentId = useFormBuilderStore(
    (state) => state.selectedComponentId
  );

  return (
    <div className="h-full overflow-y-auto p-4 bg-sidebar border-l border-sidebar-border">
      <h2 className="text-lg font-semibold mb-4 text-sidebar-foreground">
        Properties
      </h2>
      <Card className="p-4">
        {selectedComponentId ? (
          <p className="text-sm text-muted-foreground">
            Component properties will be added in a later task
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No component selected</p>
        )}
      </Card>
    </div>
  );
}
