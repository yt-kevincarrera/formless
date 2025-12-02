import { Card } from "@/components/ui/card";

export function ComponentLibrary() {
  return (
    <div className="h-full overflow-y-auto p-4 bg-sidebar border-r border-sidebar-border">
      <h2 className="text-lg font-semibold mb-4 text-sidebar-foreground">
        Component Library
      </h2>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">
          Components will be added in the next task
        </p>
      </Card>
    </div>
  );
}
