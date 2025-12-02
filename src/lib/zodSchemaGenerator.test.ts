import { describe, it, expect } from "vitest";
import { generateZodSchema, generateDefaultValues } from "./zodSchemaGenerator";
import type { FormComponent } from "@/types/form";

describe("zodSchemaGenerator", () => {
  describe("generateZodSchema", () => {
    it("should generate schema for input with required validation", () => {
      const components: FormComponent[] = [
        {
          id: "1",
          type: "input",
          label: "Name",
          name: "name",
          validation: { required: true },
        },
      ];

      const schema = generateZodSchema(components);

      // Empty string should fail validation
      const emptyResult = schema.safeParse({ name: "" });
      expect(emptyResult.success).toBe(false);

      // Valid string should pass
      const validResult = schema.safeParse({ name: "John" });
      expect(validResult.success).toBe(true);
    });

    it("should generate schema for input with minLength validation", () => {
      const components: FormComponent[] = [
        {
          id: "1",
          type: "input",
          label: "Username",
          name: "username",
          validation: { minLength: 3 },
        },
      ];

      const schema = generateZodSchema(components);

      // Too short should fail
      const tooShortResult = schema.safeParse({ username: "ab" });
      expect(tooShortResult.success).toBe(false);

      // Valid length should pass
      const validResult = schema.safeParse({ username: "abc" });
      expect(validResult.success).toBe(true);
    });

    it("should generate schema for select with enum validation", () => {
      const components: FormComponent[] = [
        {
          id: "1",
          type: "select",
          label: "Country",
          name: "country",
          validation: { required: true },
          options: [
            { label: "USA", value: "usa" },
            { label: "Canada", value: "canada" },
          ],
        },
      ];

      const schema = generateZodSchema(components);
      const validResult = schema.safeParse({ country: "usa" });
      const invalidResult = schema.safeParse({ country: "invalid" });

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    it("should generate schema for checkbox with boolean validation", () => {
      const components: FormComponent[] = [
        {
          id: "1",
          type: "checkbox",
          label: "Accept Terms",
          name: "acceptTerms",
          validation: { required: true },
        },
      ];

      const schema = generateZodSchema(components);
      const result = schema.safeParse({ acceptTerms: true });

      expect(result.success).toBe(true);
    });

    it("should generate schema for slider with min/max validation", () => {
      const components: FormComponent[] = [
        {
          id: "1",
          type: "slider",
          label: "Age",
          name: "age",
          min: 18,
          max: 100,
          validation: {},
        },
      ];

      const schema = generateZodSchema(components);
      const tooLowResult = schema.safeParse({ age: 10 });
      const validResult = schema.safeParse({ age: 25 });
      const tooHighResult = schema.safeParse({ age: 150 });

      expect(tooLowResult.success).toBe(false);
      expect(validResult.success).toBe(true);
      expect(tooHighResult.success).toBe(false);
    });

    it("should make fields optional when not required", () => {
      const components: FormComponent[] = [
        {
          id: "1",
          type: "input",
          label: "Optional Field",
          name: "optional",
          validation: {},
        },
      ];

      const schema = generateZodSchema(components);
      const result = schema.safeParse({});

      expect(result.success).toBe(true);
    });
  });

  describe("generateDefaultValues", () => {
    it("should generate default values for various component types", () => {
      const components: FormComponent[] = [
        {
          id: "1",
          type: "input",
          label: "Name",
          name: "name",
          validation: {},
        },
        {
          id: "2",
          type: "checkbox",
          label: "Subscribe",
          name: "subscribe",
          validation: {},
        },
        {
          id: "3",
          type: "slider",
          label: "Volume",
          name: "volume",
          min: 0,
          max: 100,
          validation: {},
        },
      ];

      const defaults = generateDefaultValues(components);

      expect(defaults).toEqual({
        name: "",
        subscribe: false,
        volume: 0,
      });
    });

    it("should use component defaultValue when provided", () => {
      const components: FormComponent[] = [
        {
          id: "1",
          type: "input",
          label: "Name",
          name: "name",
          defaultValue: "John Doe",
          validation: {},
        },
        {
          id: "2",
          type: "checkbox",
          label: "Subscribe",
          name: "subscribe",
          defaultValue: true,
          validation: {},
        },
      ];

      const defaults = generateDefaultValues(components);

      expect(defaults).toEqual({
        name: "John Doe",
        subscribe: true,
      });
    });
  });
});
