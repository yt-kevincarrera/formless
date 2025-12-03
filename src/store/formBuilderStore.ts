import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  FormComponent,
  FormSchema,
  ComponentType,
  FormSettings,
} from "../types/form";

interface FormBuilderStore {
  // Form state
  components: FormComponent[];
  selectedComponentId: string | null;
  settings: FormSettings;

  // UI state
  theme: "light" | "dark";

  // Actions
  addComponent: (type: ComponentType, position: number) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<FormComponent>) => void;
  reorderComponents: (startIndex: number, endIndex: number) => void;
  selectComponent: (id: string | null) => void;
  setTheme: (theme: "light" | "dark") => void;
  updateSettings: (updates: Partial<FormSettings>) => void;

  // Import/Export
  exportSchema: () => string;
  importSchema: (json: string) => void;
  reset: () => void;
}

/**
 * Generate a unique ID for components using crypto.randomUUID or fallback
 */
const generateId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `component-${crypto.randomUUID()}`;
  }
  // Fallback for older browsers
  return `component-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Validate component name is a valid JavaScript identifier
 */
const isValidComponentName = (name: string): boolean => {
  // Must start with letter, underscore, or dollar sign
  // Can contain letters, numbers, underscores, dollar signs
  const validNameRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

  // Reserved JavaScript keywords
  const reservedKeywords = [
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "new",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
    "let",
    "static",
    "enum",
    "await",
    "implements",
    "interface",
    "package",
    "private",
    "protected",
    "public",
  ];

  return (
    validNameRegex.test(name) && !reservedKeywords.includes(name.toLowerCase())
  );
};

/**
 * Validate regex pattern
 */
const isValidRegex = (pattern: string): boolean => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generate a unique field name based on type and existing names
 */
const generateUniqueFieldName = (
  type: ComponentType,
  existingNames: string[]
): string => {
  const baseName = type.toLowerCase();
  let counter = 1;
  let fieldName = `${baseName}_${counter}`;

  // Keep incrementing until we find a unique name
  while (existingNames.includes(fieldName)) {
    counter++;
    fieldName = `${baseName}_${counter}`;
  }

  return fieldName;
};

/**
 * Get default properties for a component type
 */
const getDefaultComponent = (
  type: ComponentType,
  existingComponents: FormComponent[]
): FormComponent => {
  const id = generateId();
  const existingNames = existingComponents.map((c) => c.name);
  const uniqueName = generateUniqueFieldName(type, existingNames);

  const baseComponent = {
    id,
    type,
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
    name: uniqueName,
    validation: {},
  };

  switch (type) {
    case "input":
      return {
        ...baseComponent,
        placeholder: "Enter text...",
        defaultValue: "",
      };
    case "textarea":
      return {
        ...baseComponent,
        placeholder: "Enter text...",
        defaultValue: "",
      };
    case "select":
      return {
        ...baseComponent,
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ],
        defaultValue: "",
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
        defaultValue: "",
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
        defaultValue: undefined,
      };
    case "file":
      return {
        ...baseComponent,
        accept: "*",
        maxSize: 5242880, // 5MB in bytes
        defaultValue: undefined,
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
      settings: {
        showSubmitButton: true,
        showCancelButton: false,
        submitButtonText: "Submit",
        cancelButtonText: "Cancel",
        layout: "single",
      },

      // Actions
      addComponent: (type: ComponentType, position: number) => {
        set((state) => {
          const newComponent = getDefaultComponent(type, state.components);
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
        // Validate component name if being updated
        if (updates.name !== undefined) {
          if (!updates.name.trim()) {
            throw new Error("Component name cannot be empty");
          }

          if (!isValidComponentName(updates.name)) {
            throw new Error(
              "Invalid component name. Must be a valid JavaScript identifier (start with letter/underscore, no spaces or special characters, not a reserved keyword)"
            );
          }

          // Check for duplicate names
          const state = get();
          const isDuplicate = state.components.some(
            (c) => c.id !== id && c.name === updates.name
          );

          if (isDuplicate) {
            throw new Error(
              `Component name "${updates.name}" is already in use. Please choose a unique name.`
            );
          }
        }

        // Validate regex pattern if being updated
        if (
          updates.validation?.pattern !== undefined &&
          updates.validation.pattern !== ""
        ) {
          if (!isValidRegex(updates.validation.pattern)) {
            throw new Error(
              "Invalid regex pattern. Please check your regular expression syntax."
            );
          }
        }

        // Validate option values for select/radio components
        if (updates.options !== undefined && updates.options.length > 0) {
          const values = updates.options.map((opt) => opt.value);
          const uniqueValues = new Set(values);

          if (values.length !== uniqueValues.size) {
            throw new Error(
              "Duplicate option values detected. Each option must have a unique value."
            );
          }

          // Check for empty values
          if (values.some((v) => !v.trim())) {
            throw new Error("Option values cannot be empty.");
          }
        }

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

      updateSettings: (updates: Partial<FormSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      // Import/Export
      exportSchema: () => {
        const state = get();
        const schema: FormSchema = {
          version: "1.0.0",
          components: state.components,
          settings: state.settings,
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
            settings: schema.settings || {
              showSubmitButton: true,
              showCancelButton: false,
              submitButtonText: "Submit",
              cancelButtonText: "Cancel",
              layout: "single",
            },
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
      partialize: (state) => ({
        theme: state.theme,
        components: state.components,
        settings: state.settings,
      }),
    }
  )
);

// Optimized selectors for better performance
export const selectComponents = (state: FormBuilderStore) => state.components;
export const selectSelectedComponentId = (state: FormBuilderStore) =>
  state.selectedComponentId;
export const selectTheme = (state: FormBuilderStore) => state.theme;
export const selectSelectedComponent = (state: FormBuilderStore) => {
  const { components, selectedComponentId } = state;
  return components.find((c) => c.id === selectedComponentId) || null;
};
