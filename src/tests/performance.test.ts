import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormBuilderStore } from "@/store/formBuilderStore";

describe("Performance Tests", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useFormBuilderStore());
    act(() => {
      result.current.reset();
    });
  });

  it("should complete property updates within 100ms", () => {
    const { result } = renderHook(() => useFormBuilderStore());

    // Add a component
    act(() => {
      result.current.addComponent("input", 0);
    });

    const componentId = result.current.components[0].id;

    // Measure update performance
    const startTime = performance.now();
    act(() => {
      result.current.updateComponent(componentId, {
        label: "Updated Label",
        placeholder: "Updated Placeholder",
      });
    });
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100);
    expect(result.current.components[0].label).toBe("Updated Label");
  });

  it("should handle multiple rapid updates efficiently", () => {
    const { result } = renderHook(() => useFormBuilderStore());

    // Add multiple components
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.addComponent("input", i);
      }
    });

    expect(result.current.components).toHaveLength(10);

    // Measure multiple updates
    const startTime = performance.now();
    act(() => {
      result.current.components.forEach((component, index) => {
        result.current.updateComponent(component.id, {
          label: `Component ${index}`,
        });
      });
    });
    const endTime = performance.now();

    const duration = endTime - startTime;
    // Should complete all 10 updates in reasonable time
    expect(duration).toBeLessThan(500);
  });

  it("should efficiently reorder components", () => {
    const { result } = renderHook(() => useFormBuilderStore());

    // Add components
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.addComponent("input", i);
      }
    });

    const originalOrder = result.current.components.map((c) => c.id);

    // Measure reorder performance
    const startTime = performance.now();
    act(() => {
      result.current.reorderComponents(0, 4);
    });
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100);

    // Verify reorder worked
    const newOrder = result.current.components.map((c) => c.id);
    expect(newOrder[4]).toBe(originalOrder[0]);
    expect(newOrder).toHaveLength(5);
  });

  it("should efficiently add and remove components", () => {
    const { result } = renderHook(() => useFormBuilderStore());

    // Measure add performance
    const addStartTime = performance.now();
    act(() => {
      result.current.addComponent("input", 0);
    });
    const addEndTime = performance.now();

    expect(addEndTime - addStartTime).toBeLessThan(100);
    expect(result.current.components).toHaveLength(1);

    const componentId = result.current.components[0].id;

    // Measure remove performance
    const removeStartTime = performance.now();
    act(() => {
      result.current.removeComponent(componentId);
    });
    const removeEndTime = performance.now();

    expect(removeEndTime - removeStartTime).toBeLessThan(100);
    expect(result.current.components).toHaveLength(0);
  });

  it("should efficiently select components", () => {
    const { result } = renderHook(() => useFormBuilderStore());

    act(() => {
      result.current.addComponent("input", 0);
    });

    const componentId = result.current.components[0].id;

    // Measure selection performance
    const startTime = performance.now();
    act(() => {
      result.current.selectComponent(componentId);
    });
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100);
    expect(result.current.selectedComponentId).toBe(componentId);
  });
});
