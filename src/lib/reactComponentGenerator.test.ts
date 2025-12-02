import { describe, it, expect } from "vitest";
import { generateReactComponent } from "./reactComponentGenerator";
import type { FormComponent } from "../types/form";

describe("generateReactComponent", () => {
  it("should generate empty component when no components provided", () => {
    const code = generateReactComponent([]);

    expect(code).toContain("export default function GeneratedForm()");
    expect(code).toContain("No form fields configured");
  });

  it("should generate input component with proper imports and JSX", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Email",
        name: "email",
        placeholder: "Enter your email",
        validation: { required: true },
      },
    ];

    const code = generateReactComponent(components);

    // Check imports
    expect(code).toContain('import { Input } from "@/components/ui/input"');
    expect(code).toContain('import { Label } from "@/components/ui/label"');

    // Check JSX structure
    expect(code).toContain("Email *");
    expect(code).toContain('name="email"');
    expect(code).toContain('placeholder="Enter your email"');

    // Check theme-aware classes
    expect(code).toContain("dark:bg-background");
    expect(code).toContain("dark:text-foreground");
  });

  it("should generate textarea component", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "textarea",
        label: "Description",
        name: "description",
        placeholder: "Enter description",
        validation: {},
      },
    ];

    const code = generateReactComponent(components);

    expect(code).toContain(
      'import { Textarea } from "@/components/ui/textarea"'
    );
    expect(code).toContain("<Textarea");
    expect(code).toContain('name="description"');
  });

  it("should generate select component with options", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "select",
        label: "Country",
        name: "country",
        validation: {},
        options: [
          { label: "USA", value: "us" },
          { label: "Canada", value: "ca" },
        ],
      },
    ];

    const code = generateReactComponent(components);

    expect(code).toContain(
      'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"'
    );
    expect(code).toContain("<Select");
    expect(code).toContain('<SelectItem value="us">USA</SelectItem>');
    expect(code).toContain('<SelectItem value="ca">Canada</SelectItem>');
  });

  it("should generate checkbox component", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "checkbox",
        label: "Accept terms",
        name: "terms",
        validation: { required: true },
        defaultValue: false,
      },
    ];

    const code = generateReactComponent(components);

    expect(code).toContain(
      'import { Checkbox } from "@/components/ui/checkbox"'
    );
    expect(code).toContain("<Checkbox");
    expect(code).toContain("Accept terms *");
  });

  it("should generate radio component with options", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "radio",
        label: "Size",
        name: "size",
        validation: {},
        options: [
          { label: "Small", value: "s" },
          { label: "Medium", value: "m" },
          { label: "Large", value: "l" },
        ],
      },
    ];

    const code = generateReactComponent(components);

    expect(code).toContain(
      'import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"'
    );
    expect(code).toContain("<RadioGroup");
    expect(code).toContain('<RadioGroupItem value="s"');
    expect(code).toContain("Small");
  });

  it("should generate switch component", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "switch",
        label: "Enable notifications",
        name: "notifications",
        validation: {},
        defaultValue: true,
      },
    ];

    const code = generateReactComponent(components);

    expect(code).toContain('import { Switch } from "@/components/ui/switch"');
    expect(code).toContain("<Switch");
    expect(code).toContain("defaultChecked");
  });

  it("should generate slider component with min/max/step", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "slider",
        label: "Volume",
        name: "volume",
        validation: {},
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 50,
      },
    ];

    const code = generateReactComponent(components);

    expect(code).toContain('import { Slider } from "@/components/ui/slider"');
    expect(code).toContain("<Slider");
    expect(code).toContain("min={0}");
    expect(code).toContain("max={100}");
    expect(code).toContain("step={5}");
    expect(code).toContain("defaultValue={[50]}");
  });

  it("should generate date picker component", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "date",
        label: "Birth Date",
        name: "birthDate",
        validation: {},
      },
    ];

    const code = generateReactComponent(components);

    expect(code).toContain(
      'import { Calendar } from "@/components/ui/calendar"'
    );
    expect(code).toContain(
      'import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"'
    );
    expect(code).toContain("<Calendar");
    expect(code).toContain("<Popover");
  });

  it("should generate file upload component", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "file",
        label: "Upload Document",
        name: "document",
        validation: {},
        accept: "application/pdf",
        maxSize: 5242880,
      },
    ];

    const code = generateReactComponent(components);

    expect(code).toContain('type="file"');
    expect(code).toContain('accept="application/pdf"');
  });

  it("should include theme-aware classes for all components", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Test",
        name: "test",
        validation: {},
      },
    ];

    const code = generateReactComponent(components);

    // Check for dark mode classes
    expect(code).toContain("dark:bg-background");
    expect(code).toContain("dark:text-foreground");
    expect(code).toContain("dark:border-input");
  });

  it("should generate multiple components correctly", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Name",
        name: "name",
        validation: { required: true },
      },
      {
        id: "2",
        type: "textarea",
        label: "Bio",
        name: "bio",
        validation: {},
      },
      {
        id: "3",
        type: "checkbox",
        label: "Subscribe",
        name: "subscribe",
        validation: {},
        defaultValue: false,
      },
    ];

    const code = generateReactComponent(components);

    // All components should be present
    expect(code).toContain('name="name"');
    expect(code).toContain('name="bio"');
    expect(code).toContain('name="subscribe"');

    // All necessary imports should be present
    expect(code).toContain("import { Input }");
    expect(code).toContain("import { Textarea }");
    expect(code).toContain("import { Checkbox }");
  });

  it("should use proper TypeScript function component syntax", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Test",
        name: "test",
        validation: {},
      },
    ];

    const code = generateReactComponent(components);

    expect(code).toContain("export default function GeneratedForm()");
    expect(code).toContain("return (");
  });

  it("should apply consistent TailwindCSS spacing and layout", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Test",
        name: "test",
        validation: {},
      },
    ];

    const code = generateReactComponent(components);

    expect(code).toContain("space-y-6");
    expect(code).toContain("space-y-4");
    expect(code).toContain("space-y-2");
    expect(code).toContain("max-w-2xl");
  });
});
