import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportDialog } from "./import-dialog";
import { useFormBuilderStore } from "@/store/formBuilderStore";

// Mock the toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ImportDialog", () => {
  beforeEach(() => {
    // Reset store before each test
    useFormBuilderStore.setState({
      components: [],
      selectedComponentId: null,
    });
  });

  it("should render import button", () => {
    render(<ImportDialog />);
    expect(screen.getByRole("button", { name: /import/i })).toBeInTheDocument();
  });

  it("should open dialog when button is clicked", async () => {
    const user = userEvent.setup();
    render(<ImportDialog />);

    const button = screen.getByRole("button", { name: /import/i });
    await user.click(button);

    expect(
      screen.getByRole("heading", { name: /import form schema/i })
    ).toBeInTheDocument();
  });

  it("should import valid schema successfully", async () => {
    const user = userEvent.setup();
    render(<ImportDialog />);

    // Open dialog
    const button = screen.getByRole("button", { name: /import/i });
    await user.click(button);

    // Create a valid schema file
    const validSchema = {
      version: "1.0.0",
      components: [
        {
          id: "test-1",
          type: "input",
          name: "testField",
          label: "Test Field",
          validation: {},
        },
      ],
    };

    const fileContent = JSON.stringify(validSchema);
    const file = new File([fileContent], "schema.json", {
      type: "application/json",
    });

    // Mock the text() method on the File object
    Object.defineProperty(file, "text", {
      value: vi.fn().mockResolvedValue(fileContent),
    });

    // Find the hidden file input
    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Upload file
    await user.upload(hiddenInput, file);

    // Wait for import to complete
    await waitFor(() => {
      const state = useFormBuilderStore.getState();
      expect(state.components).toHaveLength(1);
      expect(state.components[0].id).toBe("test-1");
    });
  });

  it("should show error for invalid JSON", async () => {
    const user = userEvent.setup();
    render(<ImportDialog />);

    // Open dialog
    const button = screen.getByRole("button", { name: /import/i });
    await user.click(button);

    // Create an invalid JSON file
    const fileContent = "invalid json";
    const file = new File([fileContent], "schema.json", {
      type: "application/json",
    });

    // Mock the text() method on the File object
    Object.defineProperty(file, "text", {
      value: vi.fn().mockResolvedValue(fileContent),
    });

    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Upload file
    await user.upload(hiddenInput, file);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/import failed/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid json format/i)).toBeInTheDocument();
    });
  });

  it("should show error for schema missing components field", async () => {
    const user = userEvent.setup();
    render(<ImportDialog />);

    // Open dialog
    const button = screen.getByRole("button", { name: /import/i });
    await user.click(button);

    // Create schema without components
    const invalidSchema = {
      version: "1.0.0",
    };

    const fileContent = JSON.stringify(invalidSchema);
    const file = new File([fileContent], "schema.json", {
      type: "application/json",
    });

    // Mock the text() method on the File object
    Object.defineProperty(file, "text", {
      value: vi.fn().mockResolvedValue(fileContent),
    });

    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Upload file
    await user.upload(hiddenInput, file);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/import failed/i)).toBeInTheDocument();
      expect(
        screen.getByText(/missing 'components' field/i)
      ).toBeInTheDocument();
    });
  });

  it("should show error for component missing required fields", async () => {
    const user = userEvent.setup();
    render(<ImportDialog />);

    // Open dialog
    const button = screen.getByRole("button", { name: /import/i });
    await user.click(button);

    // Create schema with invalid component
    const invalidSchema = {
      version: "1.0.0",
      components: [
        {
          id: "test-1",
          // Missing type and name
        },
      ],
    };

    const fileContent = JSON.stringify(invalidSchema);
    const file = new File([fileContent], "schema.json", {
      type: "application/json",
    });

    // Mock the text() method on the File object
    Object.defineProperty(file, "text", {
      value: vi.fn().mockResolvedValue(fileContent),
    });

    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Upload file
    await user.upload(hiddenInput, file);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/import failed/i)).toBeInTheDocument();
      expect(
        screen.getByText(/missing required field 'type'/i)
      ).toBeInTheDocument();
    });
  });

  it("should show error for invalid component type", async () => {
    const user = userEvent.setup();
    render(<ImportDialog />);

    // Open dialog
    const button = screen.getByRole("button", { name: /import/i });
    await user.click(button);

    // Create schema with invalid component type
    const invalidSchema = {
      version: "1.0.0",
      components: [
        {
          id: "test-1",
          type: "invalid-type",
          name: "testField",
          label: "Test Field",
          validation: {},
        },
      ],
    };

    const fileContent = JSON.stringify(invalidSchema);
    const file = new File([fileContent], "schema.json", {
      type: "application/json",
    });

    // Mock the text() method on the File object
    Object.defineProperty(file, "text", {
      value: vi.fn().mockResolvedValue(fileContent),
    });

    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Upload file
    await user.upload(hiddenInput, file);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/import failed/i)).toBeInTheDocument();
      expect(
        screen.getByText(/invalid type 'invalid-type'/i)
      ).toBeInTheDocument();
    });
  });

  it("should maintain current state on import failure", async () => {
    const user = userEvent.setup();

    // Set initial state
    useFormBuilderStore.setState({
      components: [
        {
          id: "existing-1",
          type: "input",
          name: "existingField",
          label: "Existing Field",
          validation: {},
        },
      ],
      selectedComponentId: "existing-1",
    });

    render(<ImportDialog />);

    // Open dialog
    const button = screen.getByRole("button", { name: /import/i });
    await user.click(button);

    // Create an invalid JSON file
    const fileContent = "invalid json";
    const file = new File([fileContent], "schema.json", {
      type: "application/json",
    });

    // Mock the text() method on the File object
    Object.defineProperty(file, "text", {
      value: vi.fn().mockResolvedValue(fileContent),
    });

    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Upload file
    await user.upload(hiddenInput, file);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/import failed/i)).toBeInTheDocument();
    });

    // Verify state is unchanged
    const state = useFormBuilderStore.getState();
    expect(state.components).toHaveLength(1);
    expect(state.components[0].id).toBe("existing-1");
    expect(state.selectedComponentId).toBe("existing-1");
  });
});
