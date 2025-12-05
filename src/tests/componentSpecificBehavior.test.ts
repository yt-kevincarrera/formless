import { describe, it, expect } from "vitest";
import { generateZodSchema } from "../lib/zodSchemaGenerator";
import { generateReactComponent } from "../lib/reactComponentGenerator";
import type { FormComponent } from "../types/form";

describe("Component-Specific Validation and Behavior", () => {
  describe("Select components - multiple options", () => {
    it("should handle select components with multiple options", () => {
      const components: FormComponent[] = [
        {
          id: "select-1",
          type: "select",
          label: "Country",
          name: "country",
          validation: { required: true },
          options: [
            { label: "United States", value: "us" },
            { label: "Canada", value: "ca" },
            { label: "Mexico", value: "mx" },
          ],
        },
      ];

      // Test Zod schema generation
      const schema = generateZodSchema(components);
      expect(schema).toBeDefined();

      // Valid value should pass
      const validResult = schema.safeParse({ country: "us" });
      expect(validResult.success).toBe(true);

      // Invalid value should fail
      const invalidResult = schema.safeParse({ country: "invalid" });
      expect(invalidResult.success).toBe(false);

      // Test React component generation
      const reactCode = generateReactComponent(components);
      expect(reactCode).toContain("Select");
      expect(reactCode).toContain("SelectItem");
      expect(reactCode).toContain("United States");
      expect(reactCode).toContain("Canada");
      expect(reactCode).toContain("Mexico");
    });

    it("should generate enum validation for select options", () => {
      const components: FormComponent[] = [
        {
          id: "select-1",
          type: "select",
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

      const schema = generateZodSchema(components);

      // All valid options should pass
      expect(schema.safeParse({ size: "s" }).success).toBe(true);
      expect(schema.safeParse({ size: "m" }).success).toBe(true);
      expect(schema.safeParse({ size: "l" }).success).toBe(true);

      // Invalid option should fail
      expect(schema.safeParse({ size: "xl" }).success).toBe(false);
    });
  });

  describe("Radio components - single selection enforcement", () => {
    it("should handle radio components with multiple options", () => {
      const components: FormComponent[] = [
        {
          id: "radio-1",
          type: "radio",
          label: "Payment Method",
          name: "payment",
          validation: { required: true },
          options: [
            { label: "Credit Card", value: "credit" },
            { label: "PayPal", value: "paypal" },
            { label: "Bank Transfer", value: "bank" },
          ],
        },
      ];

      // Test Zod schema generation
      const schema = generateZodSchema(components);
      expect(schema).toBeDefined();

      // Valid single value should pass
      const validResult = schema.safeParse({ payment: "credit" });
      expect(validResult.success).toBe(true);

      // Invalid value should fail
      const invalidResult = schema.safeParse({ payment: "invalid" });
      expect(invalidResult.success).toBe(false);

      // Test React component generation
      const reactCode = generateReactComponent(components);
      expect(reactCode).toContain("RadioGroup");
      expect(reactCode).toContain("RadioGroupItem");
      expect(reactCode).toContain("Credit Card");
      expect(reactCode).toContain("PayPal");
      expect(reactCode).toContain("Bank Transfer");
    });

    it("should enforce single selection via enum validation", () => {
      const components: FormComponent[] = [
        {
          id: "radio-1",
          type: "radio",
          label: "Choice",
          name: "choice",
          validation: {},
          options: [
            { label: "Option A", value: "a" },
            { label: "Option B", value: "b" },
          ],
        },
      ];

      const schema = generateZodSchema(components);

      // Only one value should be valid at a time
      expect(schema.safeParse({ choice: "a" }).success).toBe(true);
      expect(schema.safeParse({ choice: "b" }).success).toBe(true);

      // Multiple values or invalid values should fail
      expect(schema.safeParse({ choice: "c" }).success).toBe(false);
    });
  });

  describe("Slider components - min/max/step constraints", () => {
    it("should respect min/max constraints in validation", () => {
      const components: FormComponent[] = [
        {
          id: "slider-1",
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

      const schema = generateZodSchema(components);

      // Values within range should pass
      expect(schema.safeParse({ volume: 0 }).success).toBe(true);
      expect(schema.safeParse({ volume: 50 }).success).toBe(true);
      expect(schema.safeParse({ volume: 100 }).success).toBe(true);

      // Values outside range should fail
      expect(schema.safeParse({ volume: -1 }).success).toBe(false);
      expect(schema.safeParse({ volume: 101 }).success).toBe(false);
    });

    it("should include min/max/step in generated React code", () => {
      const components: FormComponent[] = [
        {
          id: "slider-1",
          type: "slider",
          label: "Temperature",
          name: "temp",
          validation: {},
          min: 10,
          max: 30,
          step: 2,
          defaultValue: 20,
        },
      ];

      const reactCode = generateReactComponent(components);
      expect(reactCode).toContain("Slider");
      expect(reactCode).toContain("min={10}");
      expect(reactCode).toContain("max={30}");
      expect(reactCode).toContain("step={2}");
      expect(reactCode).toContain("defaultValue={[20]}");
    });

    it("should use validation min/max if provided", () => {
      const components: FormComponent[] = [
        {
          id: "slider-1",
          type: "slider",
          label: "Rating",
          name: "rating",
          validation: {
            min: 1,
            max: 5,
          },
          min: 0,
          max: 10,
          step: 1,
        },
      ];

      const schema = generateZodSchema(components);

      // Validation min/max should take precedence
      expect(schema.safeParse({ rating: 1 }).success).toBe(true);
      expect(schema.safeParse({ rating: 5 }).success).toBe(true);
      expect(schema.safeParse({ rating: 0 }).success).toBe(false);
      expect(schema.safeParse({ rating: 6 }).success).toBe(false);
    });
  });

  describe("File upload components - file type and size validation", () => {
    it("should validate file types", () => {
      const components: FormComponent[] = [
        {
          id: "file-1",
          type: "file",
          label: "Profile Picture",
          name: "avatar",
          validation: { required: true },
          accept: "image/png,image/jpeg",
          maxSize: 1048576, // 1MB
        },
      ];

      const schema = generateZodSchema(components);

      // Valid file type should pass
      const validFile = new File(["content"], "test.png", {
        type: "image/png",
      });
      expect(schema.safeParse({ avatar: validFile }).success).toBe(true);

      // Invalid file type should fail
      const invalidFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      expect(schema.safeParse({ avatar: invalidFile }).success).toBe(false);
    });

    it("should validate file size", () => {
      const components: FormComponent[] = [
        {
          id: "file-1",
          type: "file",
          label: "Document",
          name: "doc",
          validation: {},
          accept: "*",
          maxSize: 1024, // 1KB
        },
      ];

      const schema = generateZodSchema(components);

      // Small file should pass
      const smallFile = new File(["x".repeat(500)], "small.txt", {
        type: "text/plain",
      });
      expect(schema.safeParse({ doc: smallFile }).success).toBe(true);

      // Large file should fail
      const largeFile = new File(["x".repeat(2000)], "large.txt", {
        type: "text/plain",
      });
      expect(schema.safeParse({ doc: largeFile }).success).toBe(false);
    });

    it("should include accept attribute in generated React code", () => {
      const components: FormComponent[] = [
        {
          id: "file-1",
          type: "file",
          label: "Upload",
          name: "upload",
          validation: {},
          accept: "image/*,.pdf",
          maxSize: 5242880,
        },
      ];

      const reactCode = generateReactComponent(components);
      expect(reactCode).toContain('type="file"');
      expect(reactCode).toContain('accept="image/*,.pdf"');
    });

    it("should handle wildcard accept", () => {
      const components: FormComponent[] = [
        {
          id: "file-1",
          type: "file",
          label: "Any File",
          name: "anyfile",
          validation: {},
          accept: "*",
          maxSize: 1048576,
        },
      ];

      const schema = generateZodSchema(components);

      // Any file type should pass (only size matters)
      const file1 = new File(["content"], "test.txt", { type: "text/plain" });
      const file2 = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      expect(schema.safeParse({ anyfile: file1 }).success).toBe(true);
      expect(schema.safeParse({ anyfile: file2 }).success).toBe(true);
    });
  });

  describe("Integration - all component types together", () => {
    it("should handle form with all component-specific validations", () => {
      const components: FormComponent[] = [
        {
          id: "select-1",
          type: "select",
          label: "Category",
          name: "category",
          validation: { required: true },
          options: [
            { label: "A", value: "a" },
            { label: "B", value: "b" },
          ],
        },
        {
          id: "radio-1",
          type: "radio",
          label: "Priority",
          name: "priority",
          validation: { required: true },
          options: [
            { label: "High", value: "high" },
            { label: "Low", value: "low" },
          ],
        },
        {
          id: "slider-1",
          type: "slider",
          label: "Score",
          name: "score",
          validation: {},
          min: 0,
          max: 10,
          step: 1,
        },
        {
          id: "file-1",
          type: "file",
          label: "Attachment",
          name: "attachment",
          validation: {},
          accept: "application/pdf",
          maxSize: 1048576,
        },
      ];

      const schema = generateZodSchema(components);

      // Valid data should pass
      const validFile = new File(["content"], "doc.pdf", {
        type: "application/pdf",
      });
      const validData = {
        category: "a",
        priority: "high",
        score: 5,
        attachment: validFile,
      };
      expect(schema.safeParse(validData).success).toBe(true);

      // Invalid select value should fail
      expect(
        schema.safeParse({ ...validData, category: "invalid" }).success
      ).toBe(false);

      // Invalid radio value should fail
      expect(
        schema.safeParse({ ...validData, priority: "invalid" }).success
      ).toBe(false);

      // Out of range slider value should fail
      expect(schema.safeParse({ ...validData, score: 11 }).success).toBe(false);

      // Invalid file type should fail
      const invalidFile = new File(["content"], "doc.txt", {
        type: "text/plain",
      });
      expect(
        schema.safeParse({ ...validData, attachment: invalidFile }).success
      ).toBe(false);
    });
  });
});
