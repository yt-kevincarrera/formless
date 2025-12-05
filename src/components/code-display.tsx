import {
  useFormBuilderStore,
  selectComponents,
  selectTheme,
} from "@/store/formBuilderStore";
import { generateReactComponent } from "@/lib/reactComponentGenerator";
import { generateZodSchemaCode } from "@/lib/zodSchemaGenerator";
import { generateRHFSetup } from "@/lib/rhfSetupGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check, Maximize2, Minimize2 } from "lucide-react";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

export function CodeDisplay() {
  // Use optimized selectors
  const components = useFormBuilderStore(selectComponents);
  const settings = useFormBuilderStore((state) => state.settings);
  const theme = useFormBuilderStore(selectTheme);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("component");

  // Memoize code generation to avoid unnecessary recalculations
  const componentCode = useMemo(() => {
    const startTime = performance.now();
    const code = generateReactComponent(components, settings);
    const endTime = performance.now();
    if (endTime - startTime > 100) {
      console.warn(
        `Component code generation took ${(endTime - startTime).toFixed(2)}ms`
      );
    }
    return code;
  }, [components, settings]);

  const schemaCode = useMemo(() => {
    const startTime = performance.now();
    const code = generateZodSchemaCode(components);
    const endTime = performance.now();
    if (endTime - startTime > 100) {
      console.warn(
        `Schema code generation took ${(endTime - startTime).toFixed(2)}ms`
      );
    }
    return code;
  }, [components]);

  const setupCode = useMemo(() => {
    const startTime = performance.now();
    const code = generateRHFSetup(components);
    const endTime = performance.now();
    if (endTime - startTime > 100) {
      console.warn(
        `Setup code generation took ${(endTime - startTime).toFixed(2)}ms`
      );
    }
    return code;
  }, [components]);

  const handleCopy = async (code: string, tabName: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedTab(tabName);
      toast.success(`${tabName} code copied to clipboard`);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedTab(null);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy code");
      console.error("Failed to copy:", error);
    }
  };

  const syntaxTheme = useMemo(
    () => (theme === "dark" ? vscDarkPlus : vs),
    [theme]
  );

  const renderCodeTabs = (inDialog = false) => (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full flex flex-col overflow-hidden"
    >
      <div className={inDialog ? "px-0 pt-0" : "px-4 pt-2"}>
        <div className="flex items-center gap-2">
          <TabsList className="flex-1 grid grid-cols-3">
            <TabsTrigger value="component">Component</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>
          {!inDialog && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(true)}
              title="Expand code view"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <TabsContent
        value="component"
        className={`flex-1 flex flex-col overflow-hidden m-0 ${
          inDialog ? "p-0 pt-4" : "p-4"
        }`}
      >
        <div className="flex justify-end mb-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(componentCode, "Component")}
            className="gap-2"
          >
            {copiedTab === "Component" ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-auto rounded-md border border-border">
          <SyntaxHighlighter
            language="typescript"
            style={syntaxTheme}
            customStyle={{
              margin: 0,
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
            }}
            showLineNumbers
          >
            {componentCode}
          </SyntaxHighlighter>
        </div>
      </TabsContent>

      <TabsContent
        value="schema"
        className={`flex-1 flex flex-col overflow-hidden m-0 ${
          inDialog ? "p-0 pt-4" : "p-4"
        }`}
      >
        <div className="flex justify-end mb-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(schemaCode, "Schema")}
            className="gap-2"
          >
            {copiedTab === "Schema" ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-auto rounded-md border border-border">
          <SyntaxHighlighter
            language="typescript"
            style={syntaxTheme}
            customStyle={{
              margin: 0,
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
            }}
            showLineNumbers
          >
            {schemaCode}
          </SyntaxHighlighter>
        </div>
      </TabsContent>

      <TabsContent
        value="setup"
        className={`flex-1 flex flex-col overflow-hidden m-0 ${
          inDialog ? "p-0 pt-4" : "p-4"
        }`}
      >
        <div className="flex justify-end mb-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(setupCode, "Setup")}
            className="gap-2"
          >
            {copiedTab === "Setup" ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-auto rounded-md border border-border">
          <SyntaxHighlighter
            language="typescript"
            style={syntaxTheme}
            customStyle={{
              margin: 0,
              borderRadius: "0.875rem",
              fontSize: "0.875rem",
            }}
            showLineNumbers
          >
            {setupCode}
          </SyntaxHighlighter>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      <div className="h-full flex flex-col bg-background">
        {renderCodeTabs(false)}
      </div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[60vw]! max-h-[90vh] h-[90vh] flex flex-col w-[95vw]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Code View</DialogTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                title="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">{renderCodeTabs(true)}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
