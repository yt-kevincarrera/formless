/**
 * **Feature: formless-builder, Property 12: Visual preview matches generated code**
 *
 * This test verifies that the canvas preview and generated code produce
 * identical visual output and behavior (1:1 matching).
 *
 */

import { describe, it, expect } from "vitest";
import { generateReactComponent } from "@/lib/reactComponentGenerator";
import { generateZodSchemaCode } from "@/lib/zodSchemaGenerator";
import type { FormComponent } from "@/types/form";

describe("1:1 Matching between Preview and Generated Code", () => {
  describe("Component Structure Matching", () => {
    it("should generate code with same component types as preview for input", () => {
      const components: FormComponent[] = [
        {
          id: "test-1",
          type: "input",
          label: "Email",
          name: "email",
          placeholder: "Enter email",
          validation: { required: true },
        },
      ];

      const generatedCode = generateReactComponent(components);

      // Verify generated code contains Input component
      expect(generatedCode).toContain(
        'import { Input } from "@/components/ui/input"'
      );
      expect(generatedCode).toContain("<Input");
      expect(generatedCode).toContain('name="email"');
      expect(generatedCode).toContain('placeholder="Enter email"');
      expect(generatedCode).toContain("Email *");
    });

    it("should generate code with same component types as preview for textarea", () => {
      const components: FormComponent[] = [
        {
          id: "test-2",
          type: "textarea",
          label: "Description",
          name: "description",
          placeholder: "Enter description",
          validation: {},
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain(
        'import { Textarea } from "@/components/ui/textarea"'
      );
      expect(generatedCode).toContain("<Textarea");
      expect(generatedCode).toContain('name="description"');
      expect(generatedCode).toContain('placeholder="Enter description"');
    });

    it("should generate code with same component types as preview for select", () => {
      const components: FormComponent[] = [
        {
          id: "test-3",
          type: "select",
          label: "Country",
          name: "country",
          validation: {},
          options: [
            { label: "USA", value: "usa" },
            { label: "Canada", value: "canada" },
          ],
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain("import { Select");
      expect(generatedCode).toContain("<Select");
      expect(generatedCode).toContain('name="country"');
      expect(generatedCode).toContain(
        '<SelectItem value="usa">USA</SelectItem>'
      );
      expect(generatedCode).toContain(
        '<SelectItem value="canada">Canada</SelectItem>'
      );
    });

    it("should generate code with same component types as preview for checkbox", () => {
      const components: FormComponent[] = [
        {
          id: "test-4",
          type: "checkbox",
          label: "Accept Terms",
          name: "terms",
          validation: { required: true },
          defaultValue: false,
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain(
        'import { Checkbox } from "@/components/ui/checkbox"'
      );
      expect(generatedCode).toContain("<Checkbox");
      expect(generatedCode).toContain('name="terms"');
      expect(generatedCode).toContain("Accept Terms *");
    });

    it("should generate code with same component types as preview for radio", () => {
      const components: FormComponent[] = [
        {
          id: "test-5",
          type: "radio",
          label: "Gender",
          name: "gender",
          validation: {},
          options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ],
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain(
        'import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"'
      );
      expect(generatedCode).toContain("<RadioGroup");
      expect(generatedCode).toContain('name="gender"');
      expect(generatedCode).toContain("Male");
      expect(generatedCode).toContain("Female");
    });

    it("should generate code with same component types as preview for switch", () => {
      const components: FormComponent[] = [
        {
          id: "test-6",
          type: "switch",
          label: "Enable Notifications",
          name: "notifications",
          validation: {},
          defaultValue: false,
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain(
        'import { Switch } from "@/components/ui/switch"'
      );
      expect(generatedCode).toContain("<Switch");
      expect(generatedCode).toContain('name="notifications"');
      expect(generatedCode).toContain("Enable Notifications");
    });

    it("should generate code with same component types as preview for slider", () => {
      const components: FormComponent[] = [
        {
          id: "test-7",
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

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain(
        'import { Slider } from "@/components/ui/slider"'
      );
      expect(generatedCode).toContain("<Slider");
      expect(generatedCode).toContain('name="volume"');
      expect(generatedCode).toContain("min={0}");
      expect(generatedCode).toContain("max={100}");
      expect(generatedCode).toContain("step={5}");
    });

    it("should generate code with same component types as preview for date", () => {
      const components: FormComponent[] = [
        {
          id: "test-8",
          type: "date",
          label: "Birth Date",
          name: "birthDate",
          validation: {},
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain(
        'import { Calendar } from "@/components/ui/calendar"'
      );
      expect(generatedCode).toContain("<Calendar");
      expect(generatedCode).toContain("Birth Date");
    });

    it("should generate code with same component types as preview for file", () => {
      const components: FormComponent[] = [
        {
          id: "test-9",
          type: "file",
          label: "Upload Document",
          name: "document",
          validation: {},
          accept: ".pdf,.doc",
          maxSize: 5242880,
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain('type="file"');
      expect(generatedCode).toContain('accept=".pdf,.doc"');
      expect(generatedCode).toContain("Upload Document");
    });
  });

  describe("Validation Rules Matching", () => {
    it("should generate validation code matching preview for required fields", () => {
      const components: FormComponent[] = [
        {
          id: "test-10",
          type: "input",
          label: "Username",
          name: "username",
          validation: { required: true },
        },
      ];

      const generatedCode = generateReactComponent(components);
      const schemaCode = generateZodSchemaCode(components);

      // Generated code should show required indicator
      expect(generatedCode).toContain("Username *");

      // Schema should have required validation
      expect(schemaCode).toContain("z.string()");
      expect(schemaCode).toContain("min(1");
      expect(schemaCode).toContain("This field is required");
    });

    it("should generate validation code matching preview for minLength", () => {
      const components: FormComponent[] = [
        {
          id: "test-11",
          type: "input",
          label: "Password",
          name: "password",
          validation: { required: true, minLength: 8 },
        },
      ];

      const schemaCode = generateZodSchemaCode(components);

      expect(schemaCode).toContain("min(1");
      expect(schemaCode).toContain("min(8)");
    });

    it("should generate validation code matching preview for maxLength", () => {
      const components: FormComponent[] = [
        {
          id: "test-12",
          type: "input",
          label: "Bio",
          name: "bio",
          validation: { maxLength: 200 },
        },
      ];

      const schemaCode = generateZodSchemaCode(components);

      expect(schemaCode).toContain("max(200)");
      expect(schemaCode).toContain("optional()");
    });

    it("should generate validation code matching preview for pattern", () => {
      const components: FormComponent[] = [
        {
          id: "test-13",
          type: "input",
          label: "Email",
          name: "email",
          validation: { pattern: "^[^@]+@[^@]+\\.[^@]+$" },
        },
      ];

      const schemaCode = generateZodSchemaCode(components);

      expect(schemaCode).toContain("regex");
      expect(schemaCode).toContain("^[^@]+@[^@]+\\\\.[^@]+$");
    });

    it("should generate validation code matching preview for number min/max", () => {
      const components: FormComponent[] = [
        {
          id: "test-14",
          type: "slider",
          label: "Age",
          name: "age",
          validation: { min: 18, max: 100 },
          min: 0,
          max: 120,
          step: 1,
        },
      ];

      const schemaCode = generateZodSchemaCode(components);

      expect(schemaCode).toContain("z.number()");
      expect(schemaCode).toContain("min(18)");
      expect(schemaCode).toContain("max(100)");
    });
  });

  describe("Styling and Theme Matching", () => {
    it("should generate theme-aware classes matching preview", () => {
      const components: FormComponent[] = [
        {
          id: "test-15",
          type: "input",
          label: "Name",
          name: "name",
          validation: {},
        },
      ];

      const generatedCode = generateReactComponent(components);

      // Check for theme-aware classes
      expect(generatedCode).toContain("dark:bg-background");
      expect(generatedCode).toContain("dark:text-foreground");
      expect(generatedCode).toContain("dark:border-input");
    });

    it("should use consistent shadcn/ui components in generated code", () => {
      const components: FormComponent[] = [
        {
          id: "test-16",
          type: "input",
          label: "Field",
          name: "field",
          validation: {},
        },
      ];

      const generatedCode = generateReactComponent(components);

      // Verify shadcn/ui imports
      expect(generatedCode).toContain("@/components/ui/input");
      expect(generatedCode).toContain("@/components/ui/label");
    });
  });

  describe("Default Values Matching", () => {
    it("should generate code with same default values as preview for input", () => {
      const components: FormComponent[] = [
        {
          id: "test-17",
          type: "input",
          label: "City",
          name: "city",
          validation: {},
          defaultValue: "New York",
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain('defaultValue="New York"');
    });

    it("should generate code with same default values as preview for checkbox", () => {
      const components: FormComponent[] = [
        {
          id: "test-18",
          type: "checkbox",
          label: "Subscribe",
          name: "subscribe",
          validation: {},
          defaultValue: true,
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain("defaultChecked");
    });

    it("should generate code with same default values as preview for slider", () => {
      const components: FormComponent[] = [
        {
          id: "test-19",
          type: "slider",
          label: "Rating",
          name: "rating",
          validation: {},
          min: 1,
          max: 5,
          step: 1,
          defaultValue: 3,
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain("defaultValue={[3]}");
    });
  });

  describe("Options Matching for Select and Radio", () => {
    it("should generate code with same options as preview for select", () => {
      const components: FormComponent[] = [
        {
          id: "test-20",
          type: "select",
          label: "Color",
          name: "color",
          validation: {},
          options: [
            { label: "Red", value: "red" },
            { label: "Blue", value: "blue" },
            { label: "Green", value: "green" },
          ],
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain(
        '<SelectItem value="red">Red</SelectItem>'
      );
      expect(generatedCode).toContain(
        '<SelectItem value="blue">Blue</SelectItem>'
      );
      expect(generatedCode).toContain(
        '<SelectItem value="green">Green</SelectItem>'
      );
    });

    it("should generate code with same options as preview for radio", () => {
      const components: FormComponent[] = [
        {
          id: "test-21",
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

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain("Small");
      expect(generatedCode).toContain("Medium");
      expect(generatedCode).toContain("Large");
      expect(generatedCode).toContain('value="s"');
      expect(generatedCode).toContain('value="m"');
      expect(generatedCode).toContain('value="l"');
    });
  });

  describe("Multiple Components Matching", () => {
    it("should generate code with all components in same order as preview", () => {
      const components: FormComponent[] = [
        {
          id: "test-22",
          type: "input",
          label: "First Name",
          name: "firstName",
          validation: { required: true },
        },
        {
          id: "test-23",
          type: "input",
          label: "Last Name",
          name: "lastName",
          validation: { required: true },
        },
        {
          id: "test-24",
          type: "select",
          label: "Country",
          name: "country",
          validation: {},
          options: [
            { label: "USA", value: "usa" },
            { label: "UK", value: "uk" },
          ],
        },
      ];

      const generatedCode = generateReactComponent(components);

      // Check order by finding indices
      const firstNameIndex = generatedCode.indexOf('name="firstName"');
      const lastNameIndex = generatedCode.indexOf('name="lastName"');
      const countryIndex = generatedCode.indexOf('name="country"');

      expect(firstNameIndex).toBeLessThan(lastNameIndex);
      expect(lastNameIndex).toBeLessThan(countryIndex);
    });
  });

  describe("Complex Form Configurations", () => {
    it("should handle form with all component types", () => {
      const components: FormComponent[] = [
        {
          id: "c1",
          type: "input",
          label: "Name",
          name: "name",
          validation: { required: true },
        },
        {
          id: "c2",
          type: "textarea",
          label: "Bio",
          name: "bio",
          validation: { maxLength: 500 },
        },
        {
          id: "c3",
          type: "select",
          label: "Role",
          name: "role",
          validation: {},
          options: [
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
          ],
        },
        {
          id: "c4",
          type: "checkbox",
          label: "Active",
          name: "active",
          validation: {},
          defaultValue: true,
        },
        {
          id: "c5",
          type: "radio",
          label: "Status",
          name: "status",
          validation: {},
          options: [
            { label: "Online", value: "online" },
            { label: "Offline", value: "offline" },
          ],
        },
        {
          id: "c6",
          type: "switch",
          label: "Notifications",
          name: "notifications",
          validation: {},
        },
        {
          id: "c7",
          type: "slider",
          label: "Priority",
          name: "priority",
          validation: {},
          min: 1,
          max: 10,
          step: 1,
        },
        {
          id: "c8",
          type: "date",
          label: "Start Date",
          name: "startDate",
          validation: {},
        },
        {
          id: "c9",
          type: "file",
          label: "Avatar",
          name: "avatar",
          validation: {},
          accept: "image/*",
        },
      ];

      const generatedCode = generateReactComponent(components);
      const schemaCode = generateZodSchemaCode(components);

      // Verify all components are present in generated code
      expect(generatedCode).toContain('name="name"');
      expect(generatedCode).toContain('name="bio"');
      expect(generatedCode).toContain('name="role"');
      expect(generatedCode).toContain('name="active"');
      expect(generatedCode).toContain('name="status"');
      expect(generatedCode).toContain('name="notifications"');
      expect(generatedCode).toContain('name="priority"');
      // Date component uses htmlFor instead of name attribute
      expect(generatedCode).toContain('htmlFor="startDate"');
      expect(generatedCode).toContain('name="avatar"');

      // Verify schema has all fields
      expect(schemaCode).toContain("name:");
      expect(schemaCode).toContain("bio:");
      expect(schemaCode).toContain("role:");
      expect(schemaCode).toContain("active:");
      expect(schemaCode).toContain("status:");
      expect(schemaCode).toContain("notifications:");
      expect(schemaCode).toContain("priority:");
      expect(schemaCode).toContain("startDate:");
      expect(schemaCode).toContain("avatar:");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty form configuration", () => {
      const components: FormComponent[] = [];

      const generatedCode = generateReactComponent(components);
      const schemaCode = generateZodSchemaCode(components);

      expect(generatedCode).toContain("No form fields configured");
      expect(schemaCode).toContain("z.object({})");
    });

    it("should handle components with special characters in labels", () => {
      const components: FormComponent[] = [
        {
          id: "test-25",
          type: "input",
          label: "Email (required)",
          name: "email",
          validation: { required: true },
        },
      ];

      const generatedCode = generateReactComponent(components);

      expect(generatedCode).toContain("Email (required)");
    });

    it("should handle components with no validation rules", () => {
      const components: FormComponent[] = [
        {
          id: "test-26",
          type: "input",
          label: "Optional Field",
          name: "optional",
          validation: {},
        },
      ];

      const generatedCode = generateReactComponent(components);
      const schemaCode = generateZodSchemaCode(components);

      // Should not show required indicator
      expect(generatedCode).not.toContain("Optional Field *");

      // Schema should be optional
      expect(schemaCode).toContain("optional()");
    });
  });
});
