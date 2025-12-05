import { describe, it, expect, beforeEach } from "vitest";
import { useFormBuilderStore } from "../store/formBuilderStore";

describe("Error Handling", () => {
  beforeEach(() => {
    // Reset store before each test
    useFormBuilderStore.getState().reset();
  });

  describe("Component Name Validation", () => {
    it("should reject empty component names", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      expect(() => {
        store.updateComponent(componentId, { name: "" });
      }).toThrow("Component name cannot be empty");
    });

    it("should reject component names with spaces", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      expect(() => {
        store.updateComponent(componentId, { name: "invalid name" });
      }).toThrow("Invalid component name");
    });

    it("should reject component names with special characters", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      expect(() => {
        store.updateComponent(componentId, { name: "invalid-name!" });
      }).toThrow("Invalid component name");
    });

    it("should reject reserved JavaScript keywords", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      expect(() => {
        store.updateComponent(componentId, { name: "class" });
      }).toThrow("Invalid component name");

      expect(() => {
        store.updateComponent(componentId, { name: "return" });
      }).toThrow("Invalid component name");

      expect(() => {
        store.updateComponent(componentId, { name: "function" });
      }).toThrow("Invalid component name");
    });

    it("should accept valid component names", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      expect(() => {
        store.updateComponent(componentId, { name: "validName" });
      }).not.toThrow();

      expect(() => {
        store.updateComponent(componentId, { name: "valid_name" });
      }).not.toThrow();

      expect(() => {
        store.updateComponent(componentId, { name: "_validName" });
      }).not.toThrow();

      expect(() => {
        store.updateComponent(componentId, { name: "$validName" });
      }).not.toThrow();
    });

    it("should reject duplicate component names", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("input", 0);
      store.addComponent("textarea", 1);

      const state = useFormBuilderStore.getState();
      const firstId = state.components[0].id;
      const secondId = state.components[1].id;

      store.updateComponent(firstId, { name: "firstName" });

      expect(() => {
        store.updateComponent(secondId, { name: "firstName" });
      }).toThrow("already in use");
    });
  });

  describe("Regex Pattern Validation", () => {
    it("should reject invalid regex patterns", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      expect(() => {
        store.updateComponent(componentId, {
          validation: { pattern: "[invalid" },
        });
      }).toThrow("Invalid regex pattern");
    });

    it("should accept valid regex patterns", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      expect(() => {
        store.updateComponent(componentId, {
          validation: { pattern: "^[a-zA-Z]+$" },
        });
      }).not.toThrow();

      expect(() => {
        store.updateComponent(componentId, {
          validation: { pattern: "\\d{3}-\\d{4}" },
        });
      }).not.toThrow();
    });

    it("should accept empty regex pattern", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      expect(() => {
        store.updateComponent(componentId, {
          validation: { pattern: "" },
        });
      }).not.toThrow();
    });
  });

  describe("Option Value Validation", () => {
    it("should reject duplicate option values", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("select", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      expect(() => {
        store.updateComponent(componentId, {
          options: [
            { label: "Option 1", value: "opt1" },
            { label: "Option 2", value: "opt1" },
          ],
        });
      }).toThrow("Duplicate option values");
    });

    it("should reject empty option values", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("select", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      expect(() => {
        store.updateComponent(componentId, {
          options: [
            { label: "Option 1", value: "opt1" },
            { label: "Option 2", value: "" },
          ],
        });
      }).toThrow("Option values cannot be empty");
    });

    it("should accept valid unique options", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("select", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      expect(() => {
        store.updateComponent(componentId, {
          options: [
            { label: "Option 1", value: "opt1" },
            { label: "Option 2", value: "opt2" },
            { label: "Option 3", value: "opt3" },
          ],
        });
      }).not.toThrow();
    });
  });

  describe("State Preservation on Errors", () => {
    it("should maintain state when validation fails", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("input", 0);
      const state = useFormBuilderStore.getState();
      const componentId = state.components[0].id;
      const originalName = state.components[0].name;

      try {
        store.updateComponent(componentId, { name: "invalid name" });
      } catch (error) {
        // Error expected
      }

      // State should remain unchanged
      const updatedState = useFormBuilderStore.getState();
      expect(updatedState.components[0].name).toBe(originalName);
    });

    it("should maintain state when regex validation fails", () => {
      const store = useFormBuilderStore.getState();

      store.addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      store.updateComponent(componentId, {
        validation: { pattern: "^valid$" },
      });

      const validPattern =
        useFormBuilderStore.getState().components[0].validation.pattern;

      try {
        store.updateComponent(componentId, {
          validation: { pattern: "[invalid" },
        });
      } catch (error) {
        // Error expected
      }

      // Pattern should remain unchanged
      const currentPattern =
        useFormBuilderStore.getState().components[0].validation.pattern;
      expect(currentPattern).toBe(validPattern);
    });
  });
});
