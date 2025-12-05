import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExportDialog } from "../components/export-dialog";
import { useFormBuilderStore } from "@/store/formBuilderStore";

// Mock the store
vi.mock("@/store/formBuilderStore", () => ({
  useFormBuilderStore: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock jszip
vi.mock("jszip", () => ({
  default: vi.fn().mockImplementation(() => ({
    file: vi.fn(),
    generateAsync: vi.fn().mockResolvedValue(new Blob(["test"])),
  })),
}));

describe("ExportDialog", () => {
  const mockComponents = [
    {
      id: "1",
      type: "input" as const,
      label: "Name",
      name: "name",
      validation: { required: true },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormBuilderStore as any).mockImplementation((selector: any) => {
      const state = {
        components: mockComponents,
        exportSchema: () =>
          JSON.stringify({ version: "1.0.0", components: mockComponents }),
      };
      return selector(state);
    });

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("should render export button", () => {
    render(<ExportDialog />);
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("should open dialog when export button is clicked", async () => {
    render(<ExportDialog />);
    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("Export Form")).toBeInTheDocument();
    });
  });

  it("should display all export options", async () => {
    render(<ExportDialog />);
    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("Export Schema (JSON)")).toBeInTheDocument();
      expect(screen.getByText("Copy Component Code")).toBeInTheDocument();
      expect(screen.getByText("Copy Schema Code")).toBeInTheDocument();
      expect(screen.getByText("Copy Setup Code")).toBeInTheDocument();
      expect(screen.getByText("Download Project Bundle")).toBeInTheDocument();
    });
  });

  it("should copy component code to clipboard", async () => {
    render(<ExportDialog />);
    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      const copyButton = screen.getByText("Copy Component Code");
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it("should copy schema code to clipboard", async () => {
    render(<ExportDialog />);
    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      const copyButton = screen.getByText("Copy Schema Code");
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it("should copy setup code to clipboard", async () => {
    render(<ExportDialog />);
    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      const copyButton = screen.getByText("Copy Setup Code");
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });
});
