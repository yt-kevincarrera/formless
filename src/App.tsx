import { Header } from "@/components/header";
import { ComponentLibrary } from "@/components/component-library";
import { Canvas } from "@/components/canvas";
import { PropertiesPanel } from "@/components/properties-panel";

function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 grid grid-cols-[280px_1fr_320px] overflow-hidden">
        <ComponentLibrary />
        <Canvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default App;
