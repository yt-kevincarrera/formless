import { useState } from "react";
import { Download, Copy, FileJson, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFormBuilderStore } from "@/store/formBuilderStore";
import { generateReactComponent } from "@/lib/reactComponentGenerator";
import { generateZodSchemaCode } from "@/lib/zodSchemaGenerator";
import { generateRHFSetup } from "@/lib/rhfSetupGenerator";

export function ExportDialog() {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState<string | null>(null);
  const components = useFormBuilderStore((state) => state.components);
  const settings = useFormBuilderStore((state) => state.settings);
  const exportSchema = useFormBuilderStore((state) => state.exportSchema);

  // Generate all code artifacts
  const componentCode = generateReactComponent(components, settings);
  const schemaCode = generateZodSchemaCode(components);
  const setupCode = generateRHFSetup(components);

  /**
   * Export form schema as JSON file
   */
  const handleExportSchema = () => {
    try {
      const schemaJson = exportSchema();
      const blob = new Blob([schemaJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "form-schema.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Schema exported successfully");
    } catch (error) {
      console.error("Failed to export schema:", error);
      toast.error("Failed to export schema");
    }
  };

  /**
   * Copy React component code to clipboard
   */
  const handleCopyComponent = async () => {
    try {
      setIsCopying("component");
      await navigator.clipboard.writeText(componentCode);
      toast.success("Component code copied to clipboard");
    } catch (error) {
      console.error("Failed to copy component code:", error);
      toast.error("Failed to copy component code");
    } finally {
      setIsCopying(null);
    }
  };

  /**
   * Copy Zod schema code to clipboard
   */
  const handleCopySchema = async () => {
    try {
      setIsCopying("schema");
      await navigator.clipboard.writeText(schemaCode);
      toast.success("Schema code copied to clipboard");
    } catch (error) {
      console.error("Failed to copy schema code:", error);
      toast.error("Failed to copy schema code");
    } finally {
      setIsCopying(null);
    }
  };

  /**
   * Copy React Hook Form setup code to clipboard
   */
  const handleCopySetup = async () => {
    try {
      setIsCopying("setup");
      await navigator.clipboard.writeText(setupCode);
      toast.success("Setup code copied to clipboard");
    } catch (error) {
      console.error("Failed to copy setup code:", error);
      toast.error("Failed to copy setup code");
    } finally {
      setIsCopying(null);
    }
  };

  /**
   * Download complete project bundle as zip
   */
  const handleDownloadBundle = async () => {
    try {
      setIsExporting(true);
      // Dynamic import of JSZip
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Add component file
      zip.file("generated-form.tsx", componentCode);

      // Add schema file
      zip.file("schema.ts", schemaCode);

      // Add setup file
      zip.file("setup.ts", setupCode);

      // Add README with instructions
      const readme = generateReadme();
      zip.file("README.md", readme);

      // Add package.json snippet with dependencies
      const packageJson = generatePackageJson();
      zip.file("package.json", packageJson);

      // Generate zip file
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "formless-project.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Project bundle downloaded successfully");
    } catch (error) {
      console.error("Failed to download project bundle:", error);
      toast.error("Failed to download project bundle");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Form</DialogTitle>
          <DialogDescription>
            Export your form schema or download the complete project bundle
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {/* Export Schema JSON */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExportSchema}
          >
            <FileJson className="h-4 w-4 mr-2" />
            Export Schema (JSON)
          </Button>

          {/* Copy Component Code */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleCopyComponent}
            disabled={isCopying === "component"}
          >
            <Copy className="h-4 w-4 mr-2" />
            {isCopying === "component" ? "Copying..." : "Copy Component Code"}
          </Button>

          {/* Copy Schema Code */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleCopySchema}
            disabled={isCopying === "schema"}
          >
            <Copy className="h-4 w-4 mr-2" />
            {isCopying === "schema" ? "Copying..." : "Copy Schema Code"}
          </Button>

          {/* Copy Setup Code */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleCopySetup}
            disabled={isCopying === "setup"}
          >
            <Copy className="h-4 w-4 mr-2" />
            {isCopying === "setup" ? "Copying..." : "Copy Setup Code"}
          </Button>

          {/* Download Project Bundle */}
          <Button
            variant="default"
            className="w-full justify-start"
            onClick={handleDownloadBundle}
            disabled={isExporting}
          >
            <Package className="h-4 w-4 mr-2" />
            {isExporting ? "Preparing bundle..." : "Download Project Bundle"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Generate README file with setup instructions
 */
function generateReadme(): string {
  return `# Formless Generated Form

This project was generated by Formless, a visual form builder.

## Files Included

- \`generated-form.tsx\` - The React component with your form UI
- \`schema.ts\` - Zod validation schema
- \`setup.ts\` - React Hook Form setup code
- \`package.json\` - Required dependencies

## Installation

1. Install the required dependencies:

\`\`\`bash
npm install react-hook-form @hookform/resolvers zod
\`\`\`

2. Install shadcn/ui components (if not already installed):

\`\`\`bash
npx shadcn@latest init
\`\`\`

3. Add the required shadcn/ui components:

\`\`\`bash
npx shadcn@latest add button input textarea select checkbox radio-group switch slider label
\`\`\`

## Usage

1. Copy the files to your project
2. Import and use the \`GeneratedForm\` component
3. Refer to \`setup.ts\` for React Hook Form integration examples

## Documentation

- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

---

Generated by Formless - Visual Form Builder
`;
}

/**
 * Generate package.json with required dependencies
 */
function generatePackageJson(): string {
  const packageJson = {
    name: "formless-generated-form",
    version: "1.0.0",
    description: "Form generated by Formless visual form builder",
    dependencies: {
      react: "^19.2.0",
      "react-dom": "^19.2.0",
      "react-hook-form": "^7.67.0",
      "@hookform/resolvers": "^5.2.2",
      zod: "^4.1.13",
      "@radix-ui/react-label": "^2.1.8",
      "@radix-ui/react-checkbox": "^1.3.3",
      "@radix-ui/react-radio-group": "^1.3.8",
      "@radix-ui/react-select": "^2.2.6",
      "@radix-ui/react-slider": "^1.3.6",
      "@radix-ui/react-switch": "^1.2.6",
      "lucide-react": "^0.555.0",
      "class-variance-authority": "^0.7.1",
      clsx: "^2.1.1",
      "tailwind-merge": "^3.4.0",
    },
    devDependencies: {
      "@types/react": "^19.2.5",
      "@types/react-dom": "^19.2.3",
      typescript: "~5.9.3",
      tailwindcss: "^4.1.17",
    },
  };

  return JSON.stringify(packageJson, null, 2);
}
