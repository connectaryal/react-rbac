import { render, screen } from "@testing-library/react";
import {
  RBACProvider,
  useRBACContext,
  withRBAC,
} from "../../src/react/RBACProvider";
import { RoleBasedAccessControl } from "../../src/core/rbac";

describe("RBACProvider", () => {
  describe("Basic Rendering", () => {
    it("should render children", () => {
      render(
        <RBACProvider>
          <div>Test Content</div>
        </RBACProvider>,
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should render with config", () => {
      render(
        <RBACProvider config={{ permissions: ["read"] }}>
          <div>Test Content</div>
        </RBACProvider>,
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should render with rbacInstance", () => {
      const rbac = new RoleBasedAccessControl({ permissions: ["read"] });

      render(
        <RBACProvider rbacInstance={rbac}>
          <div>Test Content</div>
        </RBACProvider>,
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });
  });

  describe("Context Value", () => {
    it("should provide null rbac when no config or instance", () => {
      const TestComponent = () => {
        const { rbac, isInitialized } = useRBACContext();
        return (
          <div>
            <span data-testid="initialized">{String(isInitialized)}</span>
            <span data-testid="rbac">{rbac ? "exists" : "null"}</span>
          </div>
        );
      };

      render(
        <RBACProvider>
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("initialized").textContent).toBe("false");
      expect(screen.getByTestId("rbac").textContent).toBe("null");
    });

    it("should provide rbac instance when config is provided", () => {
      const TestComponent = () => {
        const { rbac, isInitialized } = useRBACContext();
        return (
          <div>
            <span data-testid="initialized">{String(isInitialized)}</span>
            <span data-testid="has-read">
              {rbac?.hasPermission("read") ? "yes" : "no"}
            </span>
          </div>
        );
      };

      render(
        <RBACProvider config={{ permissions: ["read"] }}>
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("initialized").textContent).toBe("true");
      expect(screen.getByTestId("has-read").textContent).toBe("yes");
    });

    it("should provide rbac instance when rbacInstance is provided", () => {
      const rbac = new RoleBasedAccessControl({ permissions: ["write"] });

      const TestComponent = () => {
        const { rbac: contextRbac, isInitialized } = useRBACContext();
        return (
          <div>
            <span data-testid="initialized">{String(isInitialized)}</span>
            <span data-testid="has-write">
              {contextRbac?.hasPermission("write") ? "yes" : "no"}
            </span>
          </div>
        );
      };

      render(
        <RBACProvider rbacInstance={rbac}>
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("initialized").textContent).toBe("true");
      expect(screen.getByTestId("has-write").textContent).toBe("yes");
    });

    it("should prioritize rbacInstance over config", () => {
      const rbac = new RoleBasedAccessControl({ permissions: ["write"] });

      const TestComponent = () => {
        const { rbac: contextRbac } = useRBACContext();
        return (
          <div>
            <span data-testid="has-read">
              {contextRbac?.hasPermission("read") ? "yes" : "no"}
            </span>
            <span data-testid="has-write">
              {contextRbac?.hasPermission("write") ? "yes" : "no"}
            </span>
          </div>
        );
      };

      render(
        <RBACProvider config={{ permissions: ["read"] }} rbacInstance={rbac}>
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("has-read").textContent).toBe("no");
      expect(screen.getByTestId("has-write").textContent).toBe("yes");
    });
  });

  describe("Context with Roles and Permissions", () => {
    it("should provide role-based permissions", () => {
      const TestComponent = () => {
        const { rbac } = useRBACContext();
        return (
          <div>
            <span data-testid="has-read">
              {rbac?.hasPermission("read") ? "yes" : "no"}
            </span>
            <span data-testid="has-write">
              {rbac?.hasPermission("write") ? "yes" : "no"}
            </span>
            <span data-testid="has-role">
              {rbac?.hasRole("editor") ? "yes" : "no"}
            </span>
          </div>
        );
      };

      render(
        <RBACProvider
          config={{
            roles: ["editor"],
            roleDefinitions: {
              editor: ["read", "write"],
            },
          }}
        >
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("has-read").textContent).toBe("yes");
      expect(screen.getByTestId("has-write").textContent).toBe("yes");
      expect(screen.getByTestId("has-role").textContent).toBe("yes");
    });

    it("should provide restrictions", () => {
      const TestComponent = () => {
        const { rbac } = useRBACContext();
        return (
          <div>
            <span data-testid="has-read">
              {rbac?.hasPermission("read") ? "yes" : "no"}
            </span>
            <span data-testid="has-delete">
              {rbac?.hasPermission("delete") ? "yes" : "no"}
            </span>
          </div>
        );
      };

      render(
        <RBACProvider
          config={{
            permissions: ["read", "delete"],
            restrictions: ["delete"],
          }}
        >
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("has-read").textContent).toBe("yes");
      expect(screen.getByTestId("has-delete").textContent).toBe("no");
    });

    it("should provide sector-based restrictions", () => {
      const TestComponent = () => {
        const { rbac } = useRBACContext();
        return (
          <div>
            <span data-testid="has-read">
              {rbac?.hasPermission("read") ? "yes" : "no"}
            </span>
            <span data-testid="has-delete">
              {rbac?.hasPermission("delete") ? "yes" : "no"}
            </span>
            <span data-testid="sector">{rbac?.getSector() || "none"}</span>
          </div>
        );
      };

      render(
        <RBACProvider
          config={{
            permissions: ["read", "delete"],
            sector: "finance",
            sectorRestrictions: {
              finance: ["delete"],
            },
          }}
        >
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("has-read").textContent).toBe("yes");
      expect(screen.getByTestId("has-delete").textContent).toBe("no");
      expect(screen.getByTestId("sector").textContent).toBe("finance");
    });
  });

  describe("Memoization", () => {
    it("should memoize context value with same config", () => {
      let renderCount = 0;

      const TestComponent = () => {
        const context = useRBACContext();
        renderCount++;
        return <div data-testid="render-count">{renderCount}</div>;
      };

      const config = { permissions: ["read"] };

      const { rerender } = render(
        <RBACProvider config={config}>
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("render-count").textContent).toBe("1");

      // Rerender with same config reference
      rerender(
        <RBACProvider config={config}>
          <TestComponent />
        </RBACProvider>,
      );

      // Component will re-render once due to parent rerender, but context value should be memoized
      expect(screen.getByTestId("render-count").textContent).toBe("2");
    });

    it("should update context value when config changes", () => {
      const TestComponent = () => {
        const { rbac } = useRBACContext();
        return (
          <div data-testid="has-read">
            {rbac?.hasPermission("read") ? "yes" : "no"}
          </div>
        );
      };

      const { rerender } = render(
        <RBACProvider config={{ permissions: [] }}>
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("has-read").textContent).toBe("no");

      rerender(
        <RBACProvider config={{ permissions: ["read"] }}>
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("has-read").textContent).toBe("yes");
    });

    it("should update context value when rbacInstance changes", () => {
      const rbac1 = new RoleBasedAccessControl({ permissions: ["read"] });
      const rbac2 = new RoleBasedAccessControl({ permissions: ["write"] });

      const TestComponent = () => {
        const { rbac } = useRBACContext();
        return (
          <div>
            <span data-testid="has-read">
              {rbac?.hasPermission("read") ? "yes" : "no"}
            </span>
            <span data-testid="has-write">
              {rbac?.hasPermission("write") ? "yes" : "no"}
            </span>
          </div>
        );
      };

      const { rerender } = render(
        <RBACProvider rbacInstance={rbac1}>
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("has-read").textContent).toBe("yes");
      expect(screen.getByTestId("has-write").textContent).toBe("no");

      rerender(
        <RBACProvider rbacInstance={rbac2}>
          <TestComponent />
        </RBACProvider>,
      );

      expect(screen.getByTestId("has-read").textContent).toBe("no");
      expect(screen.getByTestId("has-write").textContent).toBe("yes");
    });
  });
});

describe("useRBACContext", () => {
  it("should throw error when used outside provider", () => {
    const TestComponent = () => {
      useRBACContext();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useRBACContext must be used within an RBACProvider");

    console.error = originalError;
  });

  it("should return context when used inside provider", () => {
    const TestComponent = () => {
      const context = useRBACContext();
      expect(context).toBeDefined();
      expect(context.rbac).toBeNull();
      expect(context.isInitialized).toBe(false);
      return <div>Test</div>;
    };

    render(
      <RBACProvider>
        <TestComponent />
      </RBACProvider>,
    );
  });

  it("should work with typed permissions and roles", () => {
    type MyPermissions = "read" | "write";
    type MyRoles = "admin" | "editor";
    type MySectors = "finance" | "hr";

    const TestComponent = () => {
      const { rbac } = useRBACContext<MyRoles, MyPermissions, MySectors>();
      return (
        <div data-testid="has-read">
          {rbac?.hasPermission("read") ? "yes" : "no"}
        </div>
      );
    };

    render(
      <RBACProvider<MyRoles, MyPermissions, MySectors>
        config={{
          permissions: ["read"],
          roles: ["editor"],
          roleDefinitions: {
            admin: ["read", "write"],
            editor: ["read"],
          },
        }}
      >
        <TestComponent />
      </RBACProvider>,
    );

    expect(screen.getByTestId("has-read").textContent).toBe("yes");
  });
});

describe("withRBAC", () => {
  it("should wrap component with RBACProvider", () => {
    const InnerComponent = () => {
      const { isInitialized } = useRBACContext();
      return <div data-testid="initialized">{String(isInitialized)}</div>;
    };

    const WrappedComponent = withRBAC(InnerComponent, {
      permissions: ["read"],
    });

    render(<WrappedComponent />);

    expect(screen.getByTestId("initialized").textContent).toBe("true");
  });

  it("should pass props to wrapped component", () => {
    interface ComponentProps {
      title: string;
      count: number;
    }

    const InnerComponent = ({ title, count }: ComponentProps) => {
      return (
        <div>
          <span data-testid="title">{title}</span>
          <span data-testid="count">{count}</span>
        </div>
      );
    };

    const WrappedComponent = withRBAC(InnerComponent);

    render(<WrappedComponent title="Test" count={42} />);

    expect(screen.getByTestId("title").textContent).toBe("Test");
    expect(screen.getByTestId("count").textContent).toBe("42");
  });

  it("should work without config", () => {
    const InnerComponent = () => {
      const { isInitialized } = useRBACContext();
      return <div data-testid="initialized">{String(isInitialized)}</div>;
    };

    const WrappedComponent = withRBAC(InnerComponent);

    render(<WrappedComponent />);

    expect(screen.getByTestId("initialized").textContent).toBe("false");
  });

  it("should provide RBAC functionality to wrapped component", () => {
    const InnerComponent = () => {
      const { rbac } = useRBACContext();
      return (
        <div>
          <span data-testid="has-read">
            {rbac?.hasPermission("read") ? "yes" : "no"}
          </span>
          <span data-testid="has-write">
            {rbac?.hasPermission("write") ? "yes" : "no"}
          </span>
        </div>
      );
    };

    const WrappedComponent = withRBAC(InnerComponent, {
      roles: ["editor"],
      roleDefinitions: {
        editor: ["read", "write"],
      },
    });

    render(<WrappedComponent />);

    expect(screen.getByTestId("has-read").textContent).toBe("yes");
    expect(screen.getByTestId("has-write").textContent).toBe("yes");
  });

  it("should work with typed permissions", () => {
    type MyPermissions = "read" | "write";
    type MyRoles = "admin" | "editor";

    const InnerComponent = () => {
      const { rbac } = useRBACContext<MyRoles, MyPermissions>();
      return (
        <div data-testid="has-read">
          {rbac?.hasPermission("read") ? "yes" : "no"}
        </div>
      );
    };

    const WrappedComponent = withRBAC(InnerComponent, {
      permissions: ["read"],
    });

    render(<WrappedComponent />);

    expect(screen.getByTestId("has-read").textContent).toBe("yes");
  });
});

describe("Multiple Providers", () => {
  it("should support nested providers", () => {
    const InnerComponent = () => {
      const { rbac } = useRBACContext();
      return (
        <div>
          <span data-testid="has-read">
            {rbac?.hasPermission("read") ? "yes" : "no"}
          </span>
          <span data-testid="has-write">
            {rbac?.hasPermission("write") ? "yes" : "no"}
          </span>
        </div>
      );
    };

    render(
      <RBACProvider config={{ permissions: ["read"] }}>
        <RBACProvider config={{ permissions: ["write"] }}>
          <InnerComponent />
        </RBACProvider>
      </RBACProvider>,
    );

    // Inner provider should override
    expect(screen.getByTestId("has-read").textContent).toBe("no");
    expect(screen.getByTestId("has-write").textContent).toBe("yes");
  });

  it("should allow sibling providers with different configs", () => {
    const Component1 = () => {
      const { rbac } = useRBACContext();
      return (
        <div data-testid="comp1">
          {rbac?.hasPermission("read") ? "yes" : "no"}
        </div>
      );
    };

    const Component2 = () => {
      const { rbac } = useRBACContext();
      return (
        <div data-testid="comp2">
          {rbac?.hasPermission("write") ? "yes" : "no"}
        </div>
      );
    };

    render(
      <div>
        <RBACProvider config={{ permissions: ["read"] }}>
          <Component1 />
        </RBACProvider>
        <RBACProvider config={{ permissions: ["write"] }}>
          <Component2 />
        </RBACProvider>
      </div>,
    );

    expect(screen.getByTestId("comp1").textContent).toBe("yes");
    expect(screen.getByTestId("comp2").textContent).toBe("yes");
  });
});
