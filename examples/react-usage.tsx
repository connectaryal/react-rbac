// examples/react-usage.tsx
//
// Comprehensive React integration examples for @connectaryal/rbac

import React, { useState } from "react";
import {
  RBACProvider,
  usePermission,
  useHasPermission,
  useCanAny,
  useCanAll,
  PermissionGate,
  Can,
  Cannot,
  PermissionSwitch,
  PermissionBoundary,
  PermissionDebug,
  RoleBasedAccessControl,
} from "../src";

// =============================================================================
// Type Definitions
// =============================================================================

type AppPermissions =
  | "read"
  | "write"
  | "delete"
  | "update"
  | "admin"
  | "export"
  | "approve"
  | "transfer_funds"
  | "view_salary";

type AppRoles = "admin" | "editor" | "viewer" | "manager" | "hr";

type AppSectors = "finance" | "hr" | "sales" | "it" | "marketing";

// =============================================================================
// Example 1: Basic Setup with Provider
// =============================================================================

export function Example1_BasicSetup() {
  return (
    <RBACProvider<AppRoles, AppPermissions>
      config={{
        roles: ["editor"],
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write", "update"],
          admin: ["read", "write", "update", "delete", "admin"],
          manager: ["read", "write", "approve"],
          hr: ["read", "write", "view_salary"],
        },
      }}
    >
      <div>
        <h2>Example 1: Basic Setup</h2>
        <UserDashboard />
      </div>
    </RBACProvider>
  );
}

function UserDashboard() {
  const { hasPermission, allPermissions } = usePermission<
    AppRoles,
    AppPermissions
  >("write");

  return (
    <div>
      <p>Can write: {hasPermission ? "✅" : "❌"}</p>
      <p>All permissions: {Array.from(allPermissions).join(", ")}</p>
    </div>
  );
}

// =============================================================================
// Example 2: Using PermissionGate Component
// =============================================================================

export function Example2_PermissionGate() {
  return (
    <RBACProvider<AppRoles, AppPermissions>
      config={{
        roles: ["editor"],
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write", "update"],
          admin: ["read", "write", "update", "delete", "admin"],
          manager: ["read", "write", "approve"],
          hr: ["read", "write", "view_salary"],
        },
      }}
    >
      <div>
        <h2>Example 2: Permission Gate</h2>

        {/* Simple gate */}
        <PermissionGate permissions="write">
          <button>Edit</button>
        </PermissionGate>

        {/* Gate with fallback */}
        <PermissionGate permissions="delete" fallback={<p>No delete access</p>}>
          <button>Delete</button>
        </PermissionGate>

        {/* Gate with multiple permissions (ANY) */}
        <PermissionGate permissions={["admin", "manager"]} checkType="SOME">
          <button>Approve</button>
        </PermissionGate>

        {/* Gate with multiple permissions (ALL) */}
        <PermissionGate
          permissions={["read", "write", "delete"]}
          checkType="EVERY"
          fallback={<p>Need all permissions</p>}
        >
          <button>Full Access</button>
        </PermissionGate>
      </div>
    </RBACProvider>
  );
}

// =============================================================================
// Example 3: Can / Cannot Components
// =============================================================================

export function Example3_CanCannot() {
  return (
    <RBACProvider<AppRoles, AppPermissions>
      config={{
        roles: ["viewer"],
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write", "update"],
          admin: ["read", "write", "update", "delete", "admin"],
          manager: ["read", "write", "approve"],
          hr: ["read", "write", "view_salary"],
        },
      }}
    >
      <div>
        <h2>Example 3: Can / Cannot</h2>

        {/* Natural language API */}
        <Can permissions="write">
          <button>Edit Article</button>
        </Can>

        <Cannot permissions="admin">
          <div className="banner">
            <p>⭐ Upgrade to Premium for admin features!</p>
          </div>
        </Cannot>

        <Can
          permissions={["delete", "admin"]}
          checkType="EVERY"
          fallback={<p>Admin only</p>}
        >
          <button>Admin Panel</button>
        </Can>
      </div>
    </RBACProvider>
  );
}

// =============================================================================
// Example 4: PermissionSwitch Component
// =============================================================================

export function Example4_PermissionSwitch() {
  return (
    <RBACProvider<AppRoles, AppPermissions>
      config={{
        roles: ["editor"],
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write", "update"],
          admin: ["read", "write", "update", "delete", "admin"],
          manager: ["read", "write", "approve"],
          hr: ["read", "write", "view_salary"],
        },
      }}
    >
      <div>
        <h2>Example 4: Permission Switch</h2>

        <PermissionSwitch
          permissions="write"
          granted={<EditMode />}
          denied={<ViewOnlyMode />}
        />

        <PermissionSwitch
          permissions={["admin", "delete"]}
          checkType="EVERY"
          granted={<AdminDashboard />}
          denied={<LimitedDashboard />}
          loading={<div>Loading...</div>}
        />
      </div>
    </RBACProvider>
  );
}

function EditMode() {
  return <div>✏️ Edit Mode Active</div>;
}

function ViewOnlyMode() {
  return <div>👁️ View Only Mode</div>;
}

function AdminDashboard() {
  return <div>🔐 Admin Dashboard</div>;
}

function LimitedDashboard() {
  return <div>📊 Limited Dashboard</div>;
}

// =============================================================================
// Example 5: Sector-Based Restrictions
// =============================================================================

export function Example5_SectorRestrictions() {
  const [sector, setSector] = useState<AppSectors>("finance");

  // Create RBAC instance that we can update
  const [rbac] = useState(
    () =>
      new RoleBasedAccessControl<AppRoles, AppPermissions, AppSectors>({
        roles: ["admin"],
        sector: "finance",
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write", "update"],
          admin: [
            "read",
            "write",
            "update",
            "delete",
            "admin",
            "transfer_funds",
            "export",
          ],
          manager: ["read", "write", "approve"],
          hr: ["read", "write", "view_salary"],
        },
        sectorRestrictions: {
          finance: ["delete", "transfer_funds"],
          hr: ["export", "delete"],
          sales: ["admin"],
          it: [],
          marketing: ["delete", "admin"],
        },
      }),
  );

  const handleSectorChange = (newSector: AppSectors) => {
    setSector(newSector);
    rbac.setSector(newSector);
  };

  return (
    <RBACProvider rbacInstance={rbac}>
      <div>
        <h2>Example 5: Sector-Based Restrictions</h2>

        <div>
          <label>Select Sector: </label>
          <select
            value={sector}
            onChange={(e) => handleSectorChange(e.target.value as AppSectors)}
          >
            <option value="finance">Finance</option>
            <option value="hr">HR</option>
            <option value="sales">Sales</option>
            <option value="it">IT</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>

        <SectorPermissionDisplay sector={sector} />
      </div>
    </RBACProvider>
  );
}

function SectorPermissionDisplay({ sector }: { sector: AppSectors }) {
  const { hasPermission: canDelete } = usePermission<
    AppRoles,
    AppPermissions,
    AppSectors
  >("delete");
  const { hasPermission: canTransferFunds } = usePermission<
    AppRoles,
    AppPermissions,
    AppSectors
  >("transfer_funds");
  const { hasPermission: canExport } = usePermission<
    AppRoles,
    AppPermissions,
    AppSectors
  >("export");
  const { hasPermission: canAdmin } = usePermission<
    AppRoles,
    AppPermissions,
    AppSectors
  >("admin");

  return (
    <div>
      <h3>Permissions in {sector} sector:</h3>
      <ul>
        <li>Can delete: {canDelete ? "✅" : "❌ (restricted)"}</li>
        <li>
          Can transfer funds: {canTransferFunds ? "✅" : "❌ (restricted)"}
        </li>
        <li>Can export: {canExport ? "✅" : "❌ (restricted)"}</li>
        <li>Can admin: {canAdmin ? "✅" : "❌ (restricted)"}</li>
      </ul>

      <Can permissions="delete">
        <button>Delete</button>
      </Can>

      <Cannot permissions="delete">
        <p style={{ color: "red" }}>
          ⚠️ Delete is restricted in {sector} sector
        </p>
      </Cannot>
    </div>
  );
}

// =============================================================================
// Example 6: Direct Restrictions
// =============================================================================

export function Example6_DirectRestrictions() {
  const [rbac] = useState(
    () =>
      new RoleBasedAccessControl<AppRoles, AppPermissions, AppSectors>({
        roles: ["admin"],
        restrictions: ["delete"], // Direct restriction
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write", "update"],
          admin: ["read", "write", "update", "delete", "admin"],
          manager: ["read", "write", "approve"],
          hr: ["read", "write", "view_salary"],
        },
      }),
  );

  const handleToggleRestriction = () => {
    if (rbac.isPermissionRestricted("delete")) {
      rbac.removeRestrictions(["delete"]);
    } else {
      rbac.addRestrictions(["delete"]);
    }
    // Force re-render (in real app, use state management)
    window.location.reload();
  };

  return (
    <RBACProvider rbacInstance={rbac}>
      <div>
        <h2>Example 6: Direct Restrictions</h2>
        <p>Admin role has delete permission, but it's explicitly restricted.</p>

        <DirectRestrictionDisplay />

        <button onClick={handleToggleRestriction}>
          Toggle Delete Restriction
        </button>
      </div>
    </RBACProvider>
  );
}

function DirectRestrictionDisplay() {
  const {
    hasPermission: canDelete,
    isRestricted,
    restrictionReason,
    allPermissions,
    allRestrictions,
  } = usePermission<AppRoles, AppPermissions, AppSectors>("delete", {
    includeDetails: true,
  });

  return (
    <div>
      <p>Can delete: {canDelete ? "✅" : "❌"}</p>
      <p>Is restricted: {isRestricted ? "✅" : "❌"}</p>
      {restrictionReason && <p>Restriction reason: {restrictionReason}</p>}
      <p>All permissions: {Array.from(allPermissions).join(", ")}</p>
      <p>All restrictions: {Array.from(allRestrictions).join(", ")}</p>
    </div>
  );
}

// =============================================================================
// Example 7: PermissionBoundary with Callbacks
// =============================================================================

export function Example7_PermissionBoundary() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  return (
    <RBACProvider<AppRoles, AppPermissions>
      config={{
        roles: ["viewer"],
        restrictions: ["admin"],
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write", "update"],
          admin: ["read", "write", "update", "delete", "admin"],
          manager: ["read", "write", "approve"],
          hr: ["read", "write", "view_salary"],
        },
      }}
    >
      <div>
        <h2>Example 7: Permission Boundary with Callbacks</h2>

        <PermissionBoundary
          permissions="write"
          onDenied={
            <div style={{ background: "#ffe0e0", padding: "1rem" }}>
              ❌ Access Denied - You don't have write permission
            </div>
          }
          onLoading={<div>Loading permissions...</div>}
          onDeniedCallback={() => addLog("User tried to access write feature")}
        >
          <button>Edit Content</button>
        </PermissionBoundary>

        <PermissionBoundary
          permissions="admin"
          onRestricted={
            <div style={{ background: "#fff3cd", padding: "1rem" }}>
              ⚠️ Restricted - Admin features are restricted by policy
            </div>
          }
          onDenied={
            <div style={{ background: "#ffe0e0", padding: "1rem" }}>
              ❌ Access Denied - You don't have admin permission
            </div>
          }
          onRestrictedCallback={(reason) =>
            addLog(`Admin access restricted due to ${reason} restriction`)
          }
          onDeniedCallback={() => addLog("User tried to access admin feature")}
        >
          <button>Admin Panel</button>
        </PermissionBoundary>

        <div style={{ marginTop: "2rem" }}>
          <h3>Access Logs:</h3>
          <ul>
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      </div>
    </RBACProvider>
  );
}

// =============================================================================
// Example 8: Multiple Hooks Usage
// =============================================================================

export function Example8_MultipleHooks() {
  return (
    <RBACProvider<AppRoles, AppPermissions>
      config={{
        roles: ["editor"],
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write", "update"],
          admin: ["read", "write", "update", "delete", "admin"],
          manager: ["read", "write", "approve"],
          hr: ["read", "write", "view_salary"],
        },
      }}
    >
      <div>
        <h2>Example 8: Multiple Hooks</h2>
        <HooksDemo />
      </div>
    </RBACProvider>
  );
}

function HooksDemo() {
  // Different hook variations
  const canWrite = useHasPermission<AppRoles, AppPermissions>("write");
  const canReadOrWrite = useCanAny<AppRoles, AppPermissions>(["read", "write"]);
  const canFullAccess = useCanAll<AppRoles, AppPermissions>([
    "read",
    "write",
    "delete",
  ]);

  // Full hook with details
  const { hasPermission, allPermissions, can } = usePermission<
    AppRoles,
    AppPermissions
  >(["read", "write"], { checkType: "EVERY" });

  return (
    <div>
      <h3>Hook Results:</h3>
      <ul>
        <li>useHasPermission('write'): {canWrite ? "✅" : "❌"}</li>
        <li>useCanAny(['read', 'write']): {canReadOrWrite ? "✅" : "❌"}</li>
        <li>
          useCanAll(['read', 'write', 'delete']): {canFullAccess ? "✅" : "❌"}
        </li>
        <li>
          usePermission(['read', 'write'], EVERY): {hasPermission ? "✅" : "❌"}
        </li>
      </ul>

      <h3>All Permissions:</h3>
      <p>{Array.from(allPermissions).join(", ")}</p>

      <h3>Dynamic Checks:</h3>
      <button disabled={!can("update")}>
        Update {can("update") ? "✅" : "❌"}
      </button>
      <button disabled={!can("delete")}>
        Delete {can("delete") ? "✅" : "❌"}
      </button>
    </div>
  );
}

// =============================================================================
// Example 9: Debug Component
// =============================================================================

export function Example9_Debug() {
  return (
    <RBACProvider<AppRoles, AppPermissions, AppSectors>
      config={{
        roles: ["editor", "viewer"],
        permissions: ["admin"],
        restrictions: ["delete"],
        sector: "finance",
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write", "update"],
          admin: ["read", "write", "update", "delete", "admin"],
          manager: ["read", "write", "approve"],
          hr: ["read", "write", "view_salary"],
        },
        sectorRestrictions: {
          finance: ["transfer_funds"],
          hr: ["export"],
          sales: [],
          it: [],
          marketing: [],
        },
      }}
    >
      <div>
        <h2>Example 9: Debug Component</h2>
        <p>Use in development to see permission state:</p>

        {/* Show debug info */}
        <PermissionDebug />

        {/* JSON format */}
        <PermissionDebug json title="JSON Debug" />
      </div>
    </RBACProvider>
  );
}

// =============================================================================
// Example 10: Real-World E-Commerce Dashboard
// =============================================================================

export function Example10_RealWorld() {
  return (
    <RBACProvider<AppRoles, AppPermissions>
      config={{
        roles: ["manager"],
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write", "update"],
          admin: [
            "read",
            "write",
            "update",
            "delete",
            "admin",
            "export",
            "approve",
          ],
          manager: ["read", "write", "approve", "export"],
          hr: ["read", "write", "view_salary"],
        },
      }}
    >
      <div>
        <h2>Example 10: E-Commerce Dashboard</h2>
        <ECommerceDashboard />
      </div>
    </RBACProvider>
  );
}

function ECommerceDashboard() {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
        <h1>Dashboard</h1>
        <Can permissions="admin">
          <button>⚙️ Admin Settings</button>
        </Can>
      </header>

      {/* Main content */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        {/* Orders section */}
        <section style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <h2>Orders</h2>
          <Can permissions="read">
            <ul>
              <li>Order #1234</li>
              <li>Order #1235</li>
              <li>Order #1236</li>
            </ul>
          </Can>

          <PermissionSwitch
            permissions="write"
            granted={<button>Create Order</button>}
            denied={<p style={{ color: "#999" }}>Read-only access</p>}
          />

          <Can permissions="approve">
            <button>Approve Orders</button>
          </Can>
        </section>

        {/* Products section */}
        <section style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <h2>Products</h2>
          <Can permissions="read">
            <ul>
              <li>Product A</li>
              <li>Product B</li>
              <li>Product C</li>
            </ul>
          </Can>

          <PermissionGate
            permissions={["write", "update"]}
            checkType="EVERY"
            fallback={
              <p style={{ color: "#999" }}>Need write & update access</p>
            }
          >
            <button>Edit Product</button>
          </PermissionGate>

          <Can permissions="delete">
            <button style={{ background: "#ff4444", color: "white" }}>
              Delete Product
            </button>
          </Can>
        </section>

        {/* Reports section */}
        <section style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <h2>Reports</h2>
          <Can permissions="read">
            <p>Sales Report: $10,000</p>
            <p>Orders Today: 45</p>
          </Can>

          <PermissionBoundary
            permissions="export"
            onDenied={
              <div style={{ background: "#f0f0f0", padding: "0.5rem" }}>
                💼 Upgrade to Manager to export reports
              </div>
            }
          >
            <button>📊 Export Report</button>
          </PermissionBoundary>
        </section>

        {/* Settings section */}
        <section style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <h2>Settings</h2>
          <Can permissions="admin">
            <button>Configure Payment Gateway</button>
            <button>Manage Users</button>
            <button>System Settings</button>
          </Can>

          <Cannot permissions="admin">
            <p style={{ color: "#999" }}>Admin access required</p>
          </Cannot>
        </section>
      </div>

      {/* Debug panel (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <PermissionDebug showSummary={true} />
      )}
    </div>
  );
}

// =============================================================================
// Example 11: Dynamic Permission Updates
// =============================================================================

export function Example11_DynamicUpdates() {
  const [rbac] = useState(
    () =>
      new RoleBasedAccessControl<AppRoles, AppPermissions>({
        roles: ["viewer"],
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write", "update"],
          admin: ["read", "write", "update", "delete", "admin"],
          manager: ["read", "write", "approve"],
          hr: ["read", "write", "view_salary"],
        },
      }),
  );

  const [, forceUpdate] = useState({});

  const handleUpgradeToEditor = () => {
    rbac.addRoles(["editor"]);
    forceUpdate({});
  };

  const handleUpgradeToAdmin = () => {
    rbac.setRoles(["admin"]);
    forceUpdate({});
  };

  const handleDowngrade = () => {
    rbac.setRoles(["viewer"]);
    forceUpdate({});
  };

  return (
    <RBACProvider rbacInstance={rbac}>
      <div>
        <h2>Example 11: Dynamic Permission Updates</h2>

        <div style={{ marginBottom: "1rem" }}>
          <button onClick={handleUpgradeToEditor}>Upgrade to Editor</button>
          <button onClick={handleUpgradeToAdmin}>Upgrade to Admin</button>
          <button onClick={handleDowngrade}>Downgrade to Viewer</button>
        </div>

        <DynamicPermissionDisplay />
      </div>
    </RBACProvider>
  );
}

function DynamicPermissionDisplay() {
  const { allPermissions, can } = usePermission<AppRoles, AppPermissions>([]);

  return (
    <div>
      <h3>Current Permissions:</h3>
      <p>{Array.from(allPermissions).join(", ")}</p>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <Can permissions="read">
          <button>👁️ Read</button>
        </Can>
        <Can permissions="write">
          <button>✏️ Write</button>
        </Can>
        <Can permissions="update">
          <button>🔄 Update</button>
        </Can>
        <Can permissions="delete">
          <button>🗑️ Delete</button>
        </Can>
        <Can permissions="admin">
          <button>⚙️ Admin</button>
        </Can>
      </div>
    </div>
  );
}

// =============================================================================
// Export all examples
// =============================================================================

export const ReactExamples = {
  Example1_BasicSetup,
  Example2_PermissionGate,
  Example3_CanCannot,
  Example4_PermissionSwitch,
  Example5_SectorRestrictions,
  Example6_DirectRestrictions,
  Example7_PermissionBoundary,
  Example8_MultipleHooks,
  Example9_Debug,
  Example10_RealWorld,
  Example11_DynamicUpdates,
};

// =============================================================================
// Main App (Run all examples)
// =============================================================================

export default function App() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>React RBAC Examples</h1>

      <div style={{ display: "grid", gap: "3rem" }}>
        <Example1_BasicSetup />
        <hr />
        <Example2_PermissionGate />
        <hr />
        <Example3_CanCannot />
        <hr />
        <Example4_PermissionSwitch />
        <hr />
        <Example5_SectorRestrictions />
        <hr />
        <Example6_DirectRestrictions />
        <hr />
        <Example7_PermissionBoundary />
        <hr />
        <Example8_MultipleHooks />
        <hr />
        <Example9_Debug />
        <hr />
        <Example10_RealWorld />
        <hr />
        <Example11_DynamicUpdates />
      </div>
    </div>
  );
}
