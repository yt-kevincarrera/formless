import { describe, it, expect } from "vitest";
import { generateRHFSetup } from "./rhfSetupGenerator";
import type { FormComponent } from "../types/form";

describe("generateRHFSetup", () => {
  it("should generate empty setup for no components", () => {
    const result = generateRHFSetup([]);

    expect(result).toContain('import { useForm } from "react-hook-form"');
    expect(result).toContain(
      'import { zodResolver } from "@hookform/resolvers/zod"'
    );
    expect(result).toContain("defaultValues: {}");
  });

  it("should generate useForm hook with zodResolver", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Name",
        name: "name",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain("useForm<FormData>");
    expect(result).toContain("resolver: zodResolver(formSchema)");
  });

  it("should generate default values for simple input", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Name",
        name: "name",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain('name: ""');
  });

  it("should use configured default values", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Name",
        name: "name",
        defaultValue: "John Doe",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain('name: "John Doe"');
  });

  it("should generate default values for checkbox as false", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "checkbox",
        label: "Accept Terms",
        name: "acceptTerms",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain("acceptTerms: false");
  });

  it("should generate default values for slider with min value", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "slider",
        label: "Volume",
        name: "volume",
        min: 10,
        max: 100,
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain("volume: 10");
  });

  it("should generate default values for date as undefined", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "date",
        label: "Birth Date",
        name: "birthDate",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain("birthDate: undefined");
  });

  it("should import Controller for select components", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "select",
        label: "Country",
        name: "country",
        options: [
          { label: "USA", value: "us" },
          { label: "UK", value: "uk" },
        ],
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain('import { Controller } from "react-hook-form"');
  });

  it("should generate Controller for select component", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "select",
        label: "Country",
        name: "country",
        options: [
          { label: "USA", value: "us" },
          { label: "UK", value: "uk" },
        ],
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain("<Controller");
    expect(result).toContain('name="country"');
    expect(result).toContain("control={form.control}");
    expect(result).toContain("onValueChange={field.onChange}");
  });

  it("should generate Controller for date component", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "date",
        label: "Birth Date",
        name: "birthDate",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain("<Controller");
    expect(result).toContain('name="birthDate"');
    expect(result).toContain("control={form.control}");
    expect(result).toContain("<Calendar");
    expect(result).toContain("selected={field.value}");
    expect(result).toContain("onSelect={field.onChange}");
  });

  it("should generate Controller for file component", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "file",
        label: "Upload Document",
        name: "document",
        accept: "application/pdf",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain("<Controller");
    expect(result).toContain('name="document"');
    expect(result).toContain("control={form.control}");
    expect(result).toContain('type="file"');
    expect(result).toContain('accept="application/pdf"');
  });

  it("should generate simple field registrations for input", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Name",
        name: "name",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain('form.register("name")');
  });

  it("should generate registrations for multiple simple components", () => {
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
        type: "textarea",
        label: "Description",
        name: "description",
        validation: {},
      },
      {
        id: "3",
        type: "checkbox",
        label: "Accept",
        name: "accept",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain('form.register("name")');
    expect(result).toContain('form.register("description")');
    expect(result).toContain('form.register("accept")');
  });

  it("should handle mixed simple and complex components", () => {
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
        type: "select",
        label: "Country",
        name: "country",
        options: [{ label: "USA", value: "us" }],
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain('form.register("name")');
    expect(result).toContain("<Controller");
    expect(result).toContain('name="country"');
  });

  it("should include proper TypeScript types", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Name",
        name: "name",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    expect(result).toContain("useForm<FormData>");
    expect(result).toContain("import { formSchema, type FormData } from");
  });

  it("should generate proper indentation and formatting", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Name",
        name: "name",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    // Check that the code has proper structure
    expect(result).toContain("const form = useForm<FormData>({");
    expect(result).toContain("  resolver: zodResolver(formSchema),");
    expect(result).toContain("  defaultValues: {");
    expect(result).toContain("  },");
    expect(result).toContain("});");
  });

  it("should handle all component types correctly", () => {
    const components: FormComponent[] = [
      {
        id: "1",
        type: "input",
        label: "Text",
        name: "text",
        validation: {},
      },
      {
        id: "2",
        type: "textarea",
        label: "Description",
        name: "description",
        validation: {},
      },
      {
        id: "3",
        type: "select",
        label: "Select",
        name: "select",
        options: [{ label: "Option", value: "opt" }],
        validation: {},
      },
      {
        id: "4",
        type: "checkbox",
        label: "Checkbox",
        name: "checkbox",
        validation: {},
      },
      {
        id: "5",
        type: "radio",
        label: "Radio",
        name: "radio",
        options: [{ label: "Option", value: "opt" }],
        validation: {},
      },
      {
        id: "6",
        type: "switch",
        label: "Switch",
        name: "switch",
        validation: {},
      },
      {
        id: "7",
        type: "slider",
        label: "Slider",
        name: "slider",
        min: 0,
        max: 100,
        validation: {},
      },
      {
        id: "8",
        type: "date",
        label: "Date",
        name: "date",
        validation: {},
      },
      {
        id: "9",
        type: "file",
        label: "File",
        name: "file",
        validation: {},
      },
    ];

    const result = generateRHFSetup(components);

    // Check all default values are present
    expect(result).toContain('text: ""');
    expect(result).toContain('description: ""');
    expect(result).toContain('select: ""');
    expect(result).toContain("checkbox: false");
    expect(result).toContain('radio: ""');
    expect(result).toContain("switch: false");
    expect(result).toContain("slider: 0");
    expect(result).toContain("date: undefined");
    expect(result).toContain("file: undefined");

    // Check registrations/controllers
    expect(result).toContain('form.register("text")');
    expect(result).toContain('form.register("description")');
    expect(result).toContain('name="select"');
    expect(result).toContain('form.register("checkbox")');
    expect(result).toContain('form.register("radio")');
    expect(result).toContain('form.register("switch")');
    expect(result).toContain('form.register("slider")');
    expect(result).toContain('name="date"');
    expect(result).toContain('name="file"');
  });
});
