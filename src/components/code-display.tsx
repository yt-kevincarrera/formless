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
import { Copy, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

export function CodeDisplay() {
  // Use optimized selectors
  const components = useFormBuilderStore(selectComponents);
  const theme = useFormBuilderStore(selectTheme);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Memoize code generation to avoid unnecessary recalculations
  const componentCode = useMemo(() => {
    const startTime = performance.now();
    const code = generateReactComponent(components);
    const endTime = performance.now();
    if (endTime - startTime > 100) {
      console.warn(
        `Component code generation took ${(endTime - startTime).toFixed(2)}ms`
      );
    }
    return code;
  }, [components]);

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

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Generated Code
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Production-ready code for your form
        </p>
      </div>

      <Tabs
        defaultValue="component"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="component">Component</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="component"
          className="flex-1 flex flex-col overflow-hidden m-0 p-4"
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
          className="flex-1 flex flex-col overflow-hidden m-0 p-4"
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
          className="flex-1 flex flex-col overflow-hidden m-0 p-4"
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
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
              showLineNumbers
            >
              {setupCode}
            </SyntaxHighlighter>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
