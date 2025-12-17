// examples/basic-usage.ts
//
// Basic usage examples of the RoleBasedAccessControl library

import { RoleBasedAccessControl } from "../src/core/rbac";
import { TConfig } from "../src/types/permission.types";

// Define your application's permission types
export type AppPermissions = "read" | "write" | "delete" | "update" | "admin";

// Define your application's role types
export type AppRoles = "viewer" | "editor" | "admin" | "guest";

console.log("=".repeat(80));
console.log("BASIC RBAC USAGE EXAMPLES");
console.log("=".repeat(80));
console.log();

// ============================================================================
// Example 1: Direct Permissions Only
// ============================================================================
console.log("=== Example 1: Direct Permissions ===");
const basicConfig: TConfig<AppRoles, AppPermissions> = {
  permissions: ["read", "update"],
};

const basicRbac = new RoleBasedAccessControl<AppRoles, AppPermissions>(
  basicConfig,
);

console.log("Can read?", basicRbac.can("read")); // true
console.log("Can delete?", basicRbac.can("delete")); // false
console.log("Can read AND update?", basicRbac.can(["read", "update"], true)); // true
console.log("Can read OR delete?", basicRbac.can(["read", "delete"], false)); // true
console.log();

// ============================================================================
// Example 2: Role-Based Permissions
// ============================================================================
console.log("=== Example 2: Role-Based Permissions ===");
const roleConfig: TConfig<AppRoles, AppPermissions> = {
  roles: ["editor"],
  roleDefinitions: {
    viewer: ["read"],
    editor: ["read", "write", "update"],
    admin: ["read", "write", "update", "delete", "admin"],
    guest: [],
  },
};

const roleRbac = new RoleBasedAccessControl<AppRoles, AppPermissions>(
  roleConfig,
);

console.log("Has 'editor' role?", roleRbac.hasRole("editor")); // true
console.log("Can write?", roleRbac.can("write")); // true (from editor role)
console.log("Can delete?", roleRbac.can("delete")); // false (not in editor role)
console.log("All permissions:", Array.from(roleRbac.getAllPermissions())); // ['read', 'write', 'update']
console.log();

// ============================================================================
// Example 3: Combining Direct Permissions and Roles
// ============================================================================
console.log("=== Example 3: Direct Permissions + Roles ===");
const combinedConfig: TConfig<AppRoles, AppPermissions> = {
  permissions: ["admin"], // Direct admin permission
  roles: ["viewer"], // Also has viewer role
  roleDefinitions: {
    viewer: ["read"],
    editor: ["read", "write", "update"],
    admin: ["read", "write", "update", "delete", "admin"],
    guest: [],
  },
};

const combinedRbac = new RoleBasedAccessControl<AppRoles, AppPermissions>(
  combinedConfig,
);

console.log("Can read?", combinedRbac.can("read")); // true (from viewer role)
console.log("Can admin?", combinedRbac.can("admin")); // true (direct permission)
console.log("All permissions:", Array.from(combinedRbac.getAllPermissions())); // ['admin', 'read']
console.log();

// ============================================================================
// Example 4: Dynamic Role Management
// ============================================================================
console.log("=== Example 4: Dynamic Role Management ===");
const dynamicRbac = new RoleBasedAccessControl<AppRoles, AppPermissions>({
  roleDefinitions: {
    viewer: ["read"],
    editor: ["read", "write", "update"],
    admin: ["read", "write", "update", "delete", "admin"],
    guest: [],
  },
});

console.log("Initial - Can write?", dynamicRbac.can("write")); // false

dynamicRbac.addRoles(["editor"]);
console.log("After adding 'editor' - Can write?", dynamicRbac.can("write")); // true

dynamicRbac.addRoles(["admin"]);
console.log("After adding 'admin' - Can delete?", dynamicRbac.can("delete")); // true
console.log(
  "Has both editor and admin?",
  dynamicRbac.hasRoles(["editor", "admin"], true),
); // true

dynamicRbac.removeRoles(["editor"]);
console.log(
  "After removing 'editor' - Still can write?",
  dynamicRbac.can("write"),
); // true (from admin role)
console.log();

// ============================================================================
// Example 5: Dynamic Permission Management
// ============================================================================
console.log("=== Example 5: Dynamic Permission Management ===");
const permRbac = new RoleBasedAccessControl<AppRoles, AppPermissions>();

permRbac.addPermissions(["read", "write"]);
console.log("After adding - Can read?", permRbac.can("read")); // true

permRbac.removePermissions(["write"]);
console.log("After removing write - Can write?", permRbac.can("write")); // false
console.log();

// ============================================================================
// Example 6: Dynamic Role Definition
// ============================================================================
console.log("=== Example 6: Dynamic Role Definition ===");
const flexibleRbac = new RoleBasedAccessControl<AppRoles, AppPermissions>();

flexibleRbac.defineRole("editor", ["read", "write", "update"]);
flexibleRbac.addRoles(["editor"]);

console.log("Can update?", flexibleRbac.can("update")); // true
console.log("Editor permissions:", flexibleRbac.getRolePermissions("editor")); // ['read', 'write', 'update']
console.log();

// ============================================================================
// Example 7: Complex Permission Checks
// ============================================================================
console.log("=== Example 7: Complex Permission Checks ===");
const complexRbac = new RoleBasedAccessControl<AppRoles, AppPermissions>({
  permissions: ["admin"],
  roles: ["editor", "viewer"],
  roleDefinitions: {
    viewer: ["read"],
    editor: ["read", "write", "update"],
    admin: ["read", "write", "update", "delete", "admin"],
    guest: [],
  },
});

console.log(
  "Can perform all CRUD?",
  complexRbac.can(["read", "write", "update", "delete"], true),
); // false
console.log(
  "Can perform any CRUD?",
  complexRbac.can(["read", "write", "update", "delete"], false),
); // true
console.log(
  "Has any admin role?",
  complexRbac.hasRoles(["admin", "editor"], false),
); // true
console.log(
  "Direct permissions only:",
  Array.from(complexRbac.getPermissions()),
); // ['admin']
console.log(
  "All effective permissions:",
  Array.from(complexRbac.getAllPermissions()),
); // ['admin', 'read', 'write', 'update']
console.log("Current roles:", Array.from(complexRbac.getRoles())); // ['editor', 'viewer']
console.log();

// ============================================================================
// Example 8: Multi-Role User
// ============================================================================
console.log("=== Example 8: Multi-Role User ===");
type DevPermissions = "read_docs" | "write_code" | "review_code" | "deploy";
type DevRoles = "developer" | "reviewer" | "deployer";

const multiRoleRbac = new RoleBasedAccessControl<DevRoles, DevPermissions>({
  roles: ["developer", "reviewer"], // User has multiple roles
  roleDefinitions: {
    developer: ["read_docs", "write_code"],
    reviewer: ["read_docs", "review_code"],
    deployer: ["deploy"],
  },
});

console.log("Can write_code?", multiRoleRbac.can("write_code")); // true (from developer)
console.log("Can review_code?", multiRoleRbac.can("review_code")); // true (from reviewer)
console.log("Can deploy?", multiRoleRbac.can("deploy")); // false (not a deployer)
console.log(
  "Has both developer and reviewer roles?",
  multiRoleRbac.hasRoles(["developer", "reviewer"], true),
); // true
console.log();

// ============================================================================
// Example 9: Checking Multiple Permissions
// ============================================================================
console.log("=== Example 9: Permission Check Patterns ===");
const checkRbac = new RoleBasedAccessControl<AppRoles, AppPermissions>({
  roles: ["editor"],
  roleDefinitions: {
    viewer: ["read"],
    editor: ["read", "write", "update"],
    admin: ["read", "write", "update", "delete", "admin"],
    guest: [],
  },
});

// Single permission check
console.log("Can read?", checkRbac.can("read")); // true

// All permissions must exist (AND logic)
console.log(
  "Can read AND write AND update?",
  checkRbac.can(["read", "write", "update"], true),
); // true
console.log(
  "Can read AND write AND delete?",
  checkRbac.can(["read", "write", "delete"], true),
); // false

// At least one permission must exist (OR logic)
console.log(
  "Can read OR delete?",
  checkRbac.can(["read", "delete"], false),
); // true
console.log(
  "Can delete OR admin?",
  checkRbac.can(["delete", "admin"], false),
); // false
console.log();

// ============================================================================
// Example 10: Getting Permission Information
// ============================================================================
console.log("=== Example 10: Inspecting Permissions ===");
const inspectRbac = new RoleBasedAccessControl<AppRoles, AppPermissions>({
  permissions: ["admin"],
  roles: ["editor", "viewer"],
  roleDefinitions: {
    viewer: ["read"],
    editor: ["read", "write", "update"],
    admin: ["read", "write", "update", "delete", "admin"],
    guest: [],
  },
});

console.log("Direct permissions:", Array.from(inspectRbac.getPermissions()));
console.log("Assigned roles:", Array.from(inspectRbac.getRoles()));
console.log("Viewer role permissions:", inspectRbac.getRolePermissions("viewer"));
console.log("Editor role permissions:", inspectRbac.getRolePermissions("editor"));
console.log("All effective permissions:", Array.from(inspectRbac.getAllPermissions()));
console.log("All role definitions:", inspectRbac.getRoleDefinitions());
console.log();

console.log("=".repeat(80));
console.log("END OF BASIC EXAMPLES");
console.log("=".repeat(80));
