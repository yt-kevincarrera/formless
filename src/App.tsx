import { Header } from "@/components/header";
import { ComponentLibrary } from "@/components/component-library";
import { Canvas } from "@/components/canvas";
import { PropertiesPanel } from "@/components/properties-panel";
import { CodeDisplay } from "@/components/code-display";
import { Toaster } from "@/components/ui/sonner";

function App() {
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
    </div>
  );
}

export default App;
