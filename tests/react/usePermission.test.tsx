import { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import {
  usePermission,
  useHasPermission,
  useCanAny,
  useCanAll,
  useIsRestricted,
} from "../../src/react/usePermission";
import { RBACProvider } from "../../src/react/RBACProvider";

// Define test permission types
type TestPermission =
  | "read"
  | "write"
  | "delete"
  | "update"
  | "admin"
  | "finance-delete"
  | string;
type TestRole = "viewer" | "editor" | "admin" | "guest";

describe("usePermission", () => {
  describe("Basic Permission Checks", () => {
    it("should return hasPermission true for granted permission", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("read"),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(true);
      expect(result.current.isInitialized).toBe(true);
    });

    it("should return hasPermission false for missing permission", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("write"),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(false);
      expect(result.current.isInitialized).toBe(true);
    });

    it("should return hasPermission null when not initialized", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("read"),
        { wrapper },
      );

      expect(result.current.hasPermission).toBeNull();
      expect(result.current.isInitialized).toBe(false);
    });

    it("should return hasPermission false when not initialized with returnNullWhenUninitialized false", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission("read", {
            returnNullWhenUninitialized: false,
          }),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(false);
    });

    it("should return true for empty permission array", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>([]),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(true);
    });

    it("should handle string permission", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("read"),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(true);
    });

    it("should handle array permission", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>(["read", "write"]),
        {
          wrapper,
        },
      );

      expect(result.current.hasPermission).toBe(true);
    });
  });

  describe("Check Types (SOME vs EVERY)", () => {
    it("should check SOME by default - at least one permission required", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission(["read", "write", "delete"]),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(true);
    });

    it("should check SOME explicitly - at least one permission required", () => {
      const config = { permissions: ["write"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission<TestRole, TestPermission>(["read", "write"], {
            checkType: "SOME",
          }),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(true);
    });

    it("should check EVERY - all permissions required", () => {
      const config = { permissions: ["read", "write"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission<TestRole, TestPermission>(["read", "write"], {
            checkType: "EVERY",
          }),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(true);
    });

    it("should fail EVERY when missing one permission", () => {
      const config = { permissions: ["read", "write"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission(["read", "write", "delete"], { checkType: "EVERY" }),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(false);
    });

    it("should fail SOME when no permissions match", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission<TestRole, TestPermission>(["write", "delete"], {
            checkType: "SOME",
          }),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(false);
    });
  });

  describe("Role-Based Permissions", () => {
    it("should check permissions from roles", () => {
      const config = {
        roles: ["editor"],
        roleDefinitions: {
          editor: ["read", "write"],
        },
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("write"),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(true);
    });

    it("should check permissions from multiple roles", () => {
      const config = {
        roles: ["viewer", "editor"],
        roleDefinitions: {
          viewer: ["read"],
          editor: ["write", "delete"],
        },
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission(["read", "write", "delete"]),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(true);
    });

    it("should combine direct and role-based permissions", () => {
      const config = {
        permissions: ["update"],
        roles: ["editor"],
        roleDefinitions: {
          editor: ["read", "write"],
        },
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission(["read", "write", "update"], { checkType: "EVERY" }),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(true);
    });
  });

  describe("Restrictions", () => {
    it("should deny restricted permissions", () => {
      const config = {
        permissions: ["read", "write", "delete"],
        restrictions: ["delete"],
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("delete"),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(false);
    });

    it("should mark permission as restricted", () => {
      const config = {
        permissions: ["delete"],
        restrictions: ["delete"],
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission<TestRole, TestPermission>("delete", {
            includeDetails: true,
          }),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(false);
      expect(result.current.isRestricted).toBe(true);
    });

    it("should not check restriction details when includeDetails is false", () => {
      const config = {
        permissions: ["delete"],
        restrictions: ["delete"],
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("write"),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(false);
      expect(result.current.isRestricted).toBe(false);
    });
  });

  describe("Sector Restrictions", () => {
    it("should deny sector-restricted permissions", () => {
      const config = {
        permissions: ["delete"],
        sector: "finance" as any,
        sectorRestrictions: {
          finance: ["delete"],
        },
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("admin"),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(false);
    });

    it("should mark sector restriction correctly", () => {
      const config = {
        permissions: ["delete"],
        sector: "finance" as any,
        sectorRestrictions: {
          finance: ["delete"],
        },
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission<TestRole, TestPermission>("delete", {
            includeDetails: true,
          }),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(false);
      expect(result.current.isRestricted).toBe(true);
      expect(result.current.restrictionReason).toBe("sector");
    });

    it("should allow permission in different sector", () => {
      const config = {
        permissions: ["delete"],
        sector: "hr" as any,
        sectorRestrictions: {
          finance: ["delete"],
        },
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("delete"),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(true);
    });

    it("should return current sector", () => {
      const config = {
        permissions: ["read"],
        sector: "finance" as any,
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission<TestRole, TestPermission>("read", {
            includeDetails: true,
          }),
        { wrapper },
      );

      expect(result.current.currentSector).toBe("finance");
    });
  });

  describe("Additional Information", () => {
    it("should return all effective permissions", () => {
      const config = {
        permissions: ["read", "write"],
        roles: ["editor"],
        roleDefinitions: {
          editor: ["delete"],
        },
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission<TestRole, TestPermission>("read", {
            includeDetails: true,
          }),
        { wrapper },
      );

      expect(result.current.allPermissions.has("read")).toBe(true);

      expect(result.current.allPermissions.has("write")).toBe(true);

      expect(result.current.allPermissions.has("delete")).toBe(true);
    });

    it("should return all restrictions", () => {
      const config = {
        permissions: ["read"],
        restrictions: ["write", "delete"],
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission<TestRole, TestPermission>("read", {
            includeDetails: true,
          }),
        { wrapper },
      );

      expect(result.current.allRestrictions.has("write")).toBe(true);

      expect(result.current.allRestrictions.has("delete")).toBe(true);
    });

    it("should return empty sets when not initialized", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission<TestRole, TestPermission>("read", {
            includeDetails: true,
          }),
        { wrapper },
      );

      expect(result.current.allPermissions.size).toBe(0);
      expect(result.current.allRestrictions.size).toBe(0);
    });
  });

  describe("Dynamic Permission Checking with can()", () => {
    it("should provide can() function for dynamic checks", () => {
      const config = { permissions: ["read", "write"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("read"),
        { wrapper },
      );

      expect(result.current.can("read")).toBe(true);

      expect(result.current.can("write")).toBe(true);

      expect(result.current.can("delete")).toBe(false);
    });

    it("should support SOME check in can()", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("read"),
        { wrapper },
      );

      expect(result.current.can(["read", "write", "delete"], "SOME")).toBe(
        true,
      );

      expect(result.current.can(["write", "delete"], "SOME")).toBe(false);
    });

    it("should support EVERY check in can()", () => {
      const config = { permissions: ["read", "write"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("read"),
        {
          wrapper,
        },
      );

      expect(result.current.can(["read", "write"], "EVERY")).toBe(true);

      expect(result.current.can(["read", "write", "delete"], "EVERY")).toBe(
        false,
      );
    });

    it("should use hook checkType when not specified in can()", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () =>
          usePermission<TestRole, TestPermission>(["read", "write"], {
            checkType: "SOME",
          }),
        { wrapper },
      );

      expect(result.current.can(["read", "write"])).toBe(true);
    });

    it("should return false when not initialized", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>("read"),
        { wrapper },
      );

      expect(result.current.can("read")).toBe(false);
    });
  });

  describe("Memoization", () => {
    it("should memoize result when dependencies do not change", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result, rerender } = renderHook(
        () => usePermission<TestRole, TestPermission>("read"),
        {
          wrapper,
        },
      );

      const firstResult = result.current.hasPermission;
      rerender();
      const secondResult = result.current.hasPermission;

      expect(firstResult).toBe(secondResult);
      expect(firstResult).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined permission in array", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );
      const { result } = renderHook(
        () => usePermission(["read", undefined as any]),
        { wrapper },
      );

      expect(result.current.hasPermission).toBe(true);
    });

    it("should handle null permission names", () => {
      const config = { permissions: ["read"] };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <RBACProvider config={config}>{children}</RBACProvider>
      );

      const { result } = renderHook(
        () => usePermission<TestRole, TestPermission>([null, "read"] as any),
        {
          wrapper,
        },
      );

      expect(result.current.hasPermission).toBe(true);
    });
  });
});

describe("useHasPermission", () => {
  it("should return boolean for granted permission", () => {
    const config = { permissions: ["read"] };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useHasPermission<TestRole, TestPermission>("read"),
      { wrapper },
    );

    expect(result.current).toBe(true);
  });

  it("should return boolean for denied permission", () => {
    const config = { permissions: ["read"] };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useHasPermission<TestRole, TestPermission>("write"),
      {
        wrapper,
      },
    );

    expect(result.current).toBe(false);
  });

  it("should return null when not initialized", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useHasPermission<TestRole, TestPermission>("read"),
      { wrapper },
    );

    expect(result.current).toBeNull();
  });

  it("should use SOME check type by default", () => {
    const config = { permissions: ["read"] };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useHasPermission<TestRole, TestPermission>(["read", "write"]),
      {
        wrapper,
      },
    );

    expect(result.current).toBe(true);
  });

  it("should support EVERY check type", () => {
    const config = { permissions: ["read", "write"] };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useHasPermission(["read", "write"], "EVERY"),
      { wrapper },
    );

    expect(result.current).toBe(true);
  });

  it("should fail EVERY check when missing permission", () => {
    const config = { permissions: ["read"] };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useHasPermission(["read", "write"], "EVERY"),
      { wrapper },
    );

    expect(result.current).toBe(false);
  });
});

describe("useCanAny", () => {
  it("should return true when has at least one permission", () => {
    const config = { permissions: ["read"] };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useCanAny(["read", "write", "delete"]),
      { wrapper },
    );

    expect(result.current).toBe(true);
  });

  it("should return false when has no permissions", () => {
    const config = { permissions: ["admin"] };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useCanAny(["read", "write", "delete"]),
      { wrapper },
    );

    expect(result.current).toBe(false);
  });

  it("should return null when not initialized", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useCanAny<TestRole, TestPermission>(["read", "write"]),
      {
        wrapper,
      },
    );

    expect(result.current).toBeNull();
  });

  it("should work with role-based permissions", () => {
    const config = {
      roles: ["editor"],
      roleDefinitions: {
        editor: ["write"],
      },
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useCanAny(["read", "write", "delete"]),
      { wrapper },
    );

    expect(result.current).toBe(true);
  });
});

describe("useCanAll", () => {
  it("should return true when has all permissions", () => {
    const config = { permissions: ["read", "write"] };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useCanAll<TestRole, TestPermission>(["read", "write"]),
      {
        wrapper,
      },
    );

    expect(result.current).toBe(true);
  });

  it("should return false when missing one permission", () => {
    const config = { permissions: ["read"] };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useCanAll<TestRole, TestPermission>(["read", "write"]),
      {
        wrapper,
      },
    );

    expect(result.current).toBe(false);
  });

  it("should return null when not initialized", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useCanAny<TestRole, TestPermission>(["read", "write"]),
      {
        wrapper,
      },
    );

    expect(result.current).toBeNull();
  });

  it("should work with role-based permissions", () => {
    const config = {
      roles: ["editor"],
      roleDefinitions: {
        editor: ["read", "write"],
      },
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useCanAll<TestRole, TestPermission>(["read", "write"]),
      {
        wrapper,
      },
    );

    expect(result.current).toBe(true);
  });

  it("should combine direct and role permissions", () => {
    const config = {
      permissions: ["delete"],
      roles: ["editor"],
      roleDefinitions: {
        editor: ["read", "write"],
      },
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useCanAll<TestRole, TestPermission>(["read", "write", "delete"]),
      { wrapper },
    );

    expect(result.current).toBe(true);
  });
});

describe("useIsRestricted", () => {
  it("should return true for restricted permission", () => {
    const config = {
      permissions: ["delete"],
      restrictions: ["delete"],
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useIsRestricted<TestRole, TestPermission>("delete"),
      {
        wrapper,
      },
    );

    expect(result.current).toBe(true);
  });

  it("should return false for non-restricted permission", () => {
    const config = { permissions: ["read"] };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useIsRestricted<TestRole, TestPermission>("read"),
      { wrapper },
    );

    expect(result.current).toBe(false);
  });

  it("should return false when not initialized", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => useIsRestricted<TestRole, TestPermission>("read"),
      { wrapper },
    );

    expect(result.current).toBe(false);
  });

  it("should detect sector restrictions", () => {
    const config = {
      permissions: ["delete"],
      sector: "finance" as any,
      sectorRestrictions: {
        finance: ["delete"],
      },
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(() => useIsRestricted("delete"), { wrapper });

    expect(result.current).toBe(true);
  });

  it("should not detect restrictions from other sectors", () => {
    const config = {
      permissions: ["delete"],
      sector: "hr" as any,
      sectorRestrictions: {
        finance: ["delete"],
      },
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(() => useIsRestricted("delete"), { wrapper });

    expect(result.current).toBe(false);
  });

  it("should memoize result", () => {
    const config = {
      permissions: ["read"],
      restrictions: ["delete"],
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result, rerender } = renderHook(
      () => useIsRestricted<TestRole, TestPermission>("read"),
      {
        wrapper,
      },
    );

    const firstResult = result.current;
    rerender();
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });
});

describe("Integration Tests", () => {
  it("should work with all hooks together", () => {
    const config = {
      permissions: ["read", "write"],
      roles: ["editor"],
      roleDefinitions: {
        editor: ["delete"],
      },
      restrictions: ["admin"],
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );

    const { result: permResult } = renderHook(
      () =>
        usePermission<TestRole, TestPermission>(["read", "write"], {
          checkType: "EVERY",
        }),
      { wrapper },
    );
    const { result: hasResult } = renderHook(
      () => useHasPermission<TestRole, TestPermission>("delete"),
      {
        wrapper,
      },
    );
    const { result: canAnyResult } = renderHook(
      () => useCanAny<TestRole, TestPermission>(["read", "admin"]),
      { wrapper },
    );
    const { result: canAllResult } = renderHook(
      () => useCanAll<TestRole, TestPermission>(["read", "write", "delete"]),
      { wrapper },
    );
    const { result: restrictedResult } = renderHook(
      () => useIsRestricted<TestRole, TestPermission>("delete"),
      { wrapper },
    );

    expect(permResult.current.hasPermission).toBe(true);
    expect(hasResult.current).toBe(true);
    expect(canAnyResult.current).toBe(true);
    expect(canAllResult.current).toBe(true);
    expect(restrictedResult.current).toBe(false);
  });

  it("should work with dynamic RBAC instance updates", () => {
    const config = { permissions: ["read"] };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RBACProvider config={config}>{children}</RBACProvider>
    );
    const { result } = renderHook(
      () => usePermission<TestRole, TestPermission>("read"),
      { wrapper },
    );

    expect(result.current.hasPermission).toBe(true);
  });
});
