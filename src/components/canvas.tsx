import { Card } from "@/components/ui/card";

export function Canvas() {
  return (
    <div className="h-full overflow-y-auto p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Canvas</h2>
        <Card className="p-8 min-h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Drag components from the sidebar to start building your form
          </p>
        </Card>
      </div>
    </div>
  );
}
