import { describe, it, expect } from "vitest";
import { generateReactComponent } from "@/lib/reactComponentGenerator";
import { generateZodSchemaCode } from "@/lib/zodSchemaGenerator";
import { generateRHFSetup } from "@/lib/rhfSetupGenerator";
import type { FormComponent } from "@/types/form";

describe("Code Generation Performance Tests", () => {
  const createMockComponents = (count: number): FormComponent[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `component-${i}`,
      type: "input" as const,
      label: `Field ${i}`,
      name: `field_${i}`,
      placeholder: `Enter field ${i}`,
      validation: {
        required: true,
        minLength: 3,
        maxLength: 50,
      },
    }));
  };

  it("should generate React component code within 100ms for small forms", () => {
    const components = createMockComponents(5);

    const startTime = performance.now();
    const code = generateReactComponent(components);
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100);
    expect(code).toContain("export default function GeneratedForm");
  });

  it("should generate Zod schema code within 100ms for small forms", () => {
    const components = createMockComponents(5);

    const startTime = performance.now();
    const code = generateZodSchemaCode(components);
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100);
    expect(code).toContain("export const formSchema");
  });

  it("should generate RHF setup code within 100ms for small forms", () => {
    const components = createMockComponents(5);

    const startTime = performance.now();
    const code = generateRHFSetup(components);
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100);
    expect(code).toContain("useForm");
  });

  it("should handle larger forms efficiently (10 components)", () => {
    const components = createMockComponents(10);

    const reactStart = performance.now();
    const reactCode = generateReactComponent(components);
    const reactEnd = performance.now();

    const schemaStart = performance.now();
    const schemaCode = generateZodSchemaCode(components);
    const schemaEnd = performance.now();

    const setupStart = performance.now();
    const setupCode = generateRHFSetup(components);
    const setupEnd = performance.now();

    // Each should complete reasonably fast
    expect(reactEnd - reactStart).toBeLessThan(200);
    expect(schemaEnd - schemaStart).toBeLessThan(200);
    expect(setupEnd - setupStart).toBeLessThan(200);

    // Verify code was generated
    expect(reactCode).toContain("export default function GeneratedForm");
    expect(schemaCode).toContain("export const formSchema");
    expect(setupCode).toContain("useForm");
  });

  it("should generate all three code artifacts efficiently", () => {
    const components = createMockComponents(5);

    const startTime = performance.now();
    const reactCode = generateReactComponent(components);
    const schemaCode = generateZodSchemaCode(components);
    const setupCode = generateRHFSetup(components);
    const endTime = performance.now();

    const totalDuration = endTime - startTime;
    // All three should complete within 300ms total
    expect(totalDuration).toBeLessThan(300);

    expect(reactCode).toContain("export default function GeneratedForm");
    expect(schemaCode).toContain("export const formSchema");
    expect(setupCode).toContain("useForm");
  });

  it("should handle complex components with many options", () => {
    const components: FormComponent[] = [
      {
        id: "select-1",
        type: "select",
        label: "Select Field",
        name: "select_field",
        options: Array.from({ length: 20 }, (_, i) => ({
          label: `Option ${i}`,
          value: `option${i}`,
        })),
        validation: { required: true },
      },
      {
        id: "radio-1",
        type: "radio",
        label: "Radio Field",
        name: "radio_field",
        options: Array.from({ length: 15 }, (_, i) => ({
          label: `Choice ${i}`,
          value: `choice${i}`,
        })),
        validation: { required: true },
      },
    ];

    const startTime = performance.now();
    const reactCode = generateReactComponent(components);
    const schemaCode = generateZodSchemaCode(components);
    const setupCode = generateRHFSetup(components);
    const endTime = performance.now();

    const totalDuration = endTime - startTime;
    expect(totalDuration).toBeLessThan(300);

    expect(reactCode).toContain("Select");
    expect(reactCode).toContain("RadioGroup");
    expect(schemaCode).toContain("z.enum");
  });
});
