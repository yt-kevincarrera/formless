import { describe, it, expect, beforeEach } from "vitest";
import { useFormBuilderStore } from "./formBuilderStore";

describe("FormBuilderStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useFormBuilderStore.getState().reset();
    useFormBuilderStore.setState({ selectedComponentId: null, theme: "light" });
  });

  describe("addComponent", () => {
    it("should add a component with unique ID and defaults", () => {
      const { addComponent } = useFormBuilderStore.getState();

      addComponent("input", 0);

      const state = useFormBuilderStore.getState();
      expect(state.components).toHaveLength(1);
      expect(state.components[0].type).toBe("input");
      expect(state.components[0].id).toBeDefined();
      expect(state.components[0].name).toBe("field_0");
      expect(state.components[0].label).toBe("Input Field");
    });

    it("should add component at specified position", () => {
      const { addComponent } = useFormBuilderStore.getState();

      addComponent("input", 0);
      addComponent("textarea", 0);

      const state = useFormBuilderStore.getState();
      expect(state.components).toHaveLength(2);
      expect(state.components[0].type).toBe("textarea");
      expect(state.components[1].type).toBe("input");
    });

    it("should select newly added component", () => {
      const { addComponent } = useFormBuilderStore.getState();

      addComponent("input", 0);

      const state = useFormBuilderStore.getState();
      expect(state.selectedComponentId).toBe(state.components[0].id);
    });
  });

  describe("removeComponent", () => {
    it("should remove component by id", () => {
      const { addComponent, removeComponent } = useFormBuilderStore.getState();

      addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      removeComponent(componentId);

      const state = useFormBuilderStore.getState();
      expect(state.components).toHaveLength(0);
    });

    it("should clear selection if removed component was selected", () => {
      const { addComponent, removeComponent } = useFormBuilderStore.getState();

      addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      removeComponent(componentId);

      const state = useFormBuilderStore.getState();
      expect(state.selectedComponentId).toBeNull();
    });
  });

  describe("updateComponent", () => {
    it("should update component properties", () => {
      const { addComponent, updateComponent } = useFormBuilderStore.getState();

      addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      updateComponent(componentId, {
        label: "Updated Label",
        name: "updated_name",
      });

      const state = useFormBuilderStore.getState();
      expect(state.components[0].label).toBe("Updated Label");
      expect(state.components[0].name).toBe("updated_name");
    });
  });

  describe("reorderComponents", () => {
    it("should reorder components", () => {
      const { addComponent, reorderComponents } =
        useFormBuilderStore.getState();

      addComponent("input", 0);
      addComponent("textarea", 1);
      addComponent("select", 2);

      reorderComponents(0, 2);

      const state = useFormBuilderStore.getState();
      expect(state.components).toHaveLength(3);
      expect(state.components[0].type).toBe("textarea");
      expect(state.components[1].type).toBe("select");
      expect(state.components[2].type).toBe("input");
    });
  });

  describe("selectComponent", () => {
    it("should select component by id", () => {
      const { addComponent, selectComponent } = useFormBuilderStore.getState();

      addComponent("input", 0);
      const componentId = useFormBuilderStore.getState().components[0].id;

      selectComponent(componentId);

      const state = useFormBuilderStore.getState();
      expect(state.selectedComponentId).toBe(componentId);
    });

    it("should allow deselecting by passing null", () => {
      const { addComponent, selectComponent } = useFormBuilderStore.getState();

      addComponent("input", 0);
      selectComponent(null);

      const state = useFormBuilderStore.getState();
      expect(state.selectedComponentId).toBeNull();
    });
  });

  describe("setTheme", () => {
    it("should update theme", () => {
      const { setTheme } = useFormBuilderStore.getState();

      setTheme("dark");

      const state = useFormBuilderStore.getState();
      expect(state.theme).toBe("dark");
    });
  });

  describe("exportSchema", () => {
    it("should export schema as JSON string", () => {
      const { addComponent, exportSchema } = useFormBuilderStore.getState();

      addComponent("input", 0);
      addComponent("textarea", 1);

      const json = exportSchema();
      const schema = JSON.parse(json);

      expect(schema.version).toBe("1.0.0");
      expect(schema.components).toHaveLength(2);
      expect(schema.metadata).toBeDefined();
    });
  });

  describe("importSchema", () => {
    it("should import valid schema", () => {
      const { importSchema } = useFormBuilderStore.getState();

      const schema = {
        version: "1.0.0",
        components: [
          {
            id: "test-1",
            type: "input" as const,
            label: "Test Input",
            name: "test_input",
            validation: {},
          },
        ],
      };

      importSchema(JSON.stringify(schema));

      const state = useFormBuilderStore.getState();
      expect(state.components).toHaveLength(1);
      expect(state.components[0].id).toBe("test-1");
    });

    it("should throw error for invalid schema", () => {
      const { importSchema } = useFormBuilderStore.getState();

      expect(() => importSchema("invalid json")).toThrow();
    });

    it("should throw error for schema missing components", () => {
      const { importSchema } = useFormBuilderStore.getState();

      const invalidSchema = { version: "1.0.0" };

      expect(() => importSchema(JSON.stringify(invalidSchema))).toThrow();
    });
  });

  describe("reset", () => {
    it("should clear all components and selection", () => {
      const { addComponent, reset } = useFormBuilderStore.getState();

      addComponent("input", 0);
      addComponent("textarea", 1);

      reset();

      const state = useFormBuilderStore.getState();
      expect(state.components).toHaveLength(0);
      expect(state.selectedComponentId).toBeNull();
    });
  });
});
