import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FormComponent, FormSchema, ComponentType } from "../types/form";

interface FormBuilderStore {
  // Form state
  components: FormComponent[];
  selectedComponentId: string | null;

  // UI state
  theme: "light" | "dark";

  // Actions
  addComponent: (type: ComponentType, position: number) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<FormComponent>) => void;
  reorderComponents: (startIndex: number, endIndex: number) => void;
  selectComponent: (id: string | null) => void;
  setTheme: (theme: "light" | "dark") => void;

  // Import/Export
  exportSchema: () => string;
  importSchema: (json: string) => void;
  reset: () => void;
}

/**
 * Generate a unique ID for components
 */
const generateId = (): string => {
  return `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get default properties for a component type
 */
const getDefaultComponent = (
  type: ComponentType,
  position: number
): FormComponent => {
  const id = generateId();
  const baseComponent = {
    id,
    type,
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
    name: `field_${position}`,
    validation: {},
  };

  switch (type) {
    case "input":
      return {
        ...baseComponent,
        placeholder: "Enter text...",
      };
    case "textarea":
      return {
        ...baseComponent,
        placeholder: "Enter text...",
      };
    case "select":
      return {
        ...baseComponent,
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ],
      };
    case "checkbox":
      return {
        ...baseComponent,
        defaultValue: false,
      };
    case "radio":
      return {
        ...baseComponent,
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ],
      };
    case "switch":
      return {
        ...baseComponent,
        defaultValue: false,
      };
    case "slider":
      return {
        ...baseComponent,
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 50,
      };
    case "date":
      return {
        ...baseComponent,
      };
    case "file":
      return {
        ...baseComponent,
        accept: "*",
        maxSize: 5242880, // 5MB in bytes
      };
    default:
      return baseComponent;
  }
};

export const useFormBuilderStore = create<FormBuilderStore>()(
  persist(
    (set, get) => ({
      // Initial state
      components: [],
      selectedComponentId: null,
      theme: "light",

      // Actions
      addComponent: (type: ComponentType, position: number) => {
        const newComponent = getDefaultComponent(type, position);
        set((state) => {
          const newComponents = [...state.components];
          newComponents.splice(position, 0, newComponent);
          return {
            components: newComponents,
            selectedComponentId: newComponent.id,
          };
        });
      },

      removeComponent: (id: string) => {
        set((state) => ({
          components: state.components.filter((c) => c.id !== id),
          selectedComponentId:
            state.selectedComponentId === id ? null : state.selectedComponentId,
        }));
      },

      updateComponent: (id: string, updates: Partial<FormComponent>) => {
        set((state) => ({
          components: state.components.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      reorderComponents: (startIndex: number, endIndex: number) => {
        set((state) => {
          const newComponents = [...state.components];
          const [removed] = newComponents.splice(startIndex, 1);
          newComponents.splice(endIndex, 0, removed);
          return { components: newComponents };
        });
      },

      selectComponent: (id: string | null) => {
        set({ selectedComponentId: id });
      },

      setTheme: (theme: "light" | "dark") => {
        set({ theme });
      },

      // Import/Export
      exportSchema: () => {
        const state = get();
        const schema: FormSchema = {
          version: "1.0.0",
          components: state.components,
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
        return JSON.stringify(schema, null, 2);
      },

      importSchema: (json: string) => {
        try {
          const schema: FormSchema = JSON.parse(json);

          // Validate schema structure
          if (!schema.components || !Array.isArray(schema.components)) {
            throw new Error(
              "Invalid schema: missing or invalid components array"
            );
          }

          // Validate each component has required fields
          for (const component of schema.components) {
            if (!component.id || !component.type || !component.name) {
              throw new Error(
                "Invalid schema: component missing required fields (id, type, name)"
              );
            }
          }

          set({
            components: schema.components,
            selectedComponentId: null,
          });
        } catch (error) {
          console.error("Failed to import schema:", error);
          throw error;
        }
      },

      reset: () => {
        set({
          components: [],
          selectedComponentId: null,
        });
      },
    }),
    {
      name: "formless-storage",
      // Only persist theme preference
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
