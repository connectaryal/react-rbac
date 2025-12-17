// examples/restrictions.ts
//
// Comprehensive examples demonstrating permission restrictions and sector-based access control

import { RoleBasedAccessControl } from "../src/core/rbac";

// Define application types
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

console.log("=".repeat(80));
console.log("PERMISSION RESTRICTIONS & SECTOR-BASED ACCESS CONTROL EXAMPLES");
console.log("=".repeat(80));
console.log();

// ============================================================================
// Example 1: Direct Restrictions (Deny List)
// ============================================================================
console.log("=== Example 1: Direct Restrictions (Deny List) ===");
console.log("Use Case: Admin has all permissions, but 'delete' is explicitly restricted");
console.log();

const example1 = new RoleBasedAccessControl<AppRoles, AppPermissions, AppSectors>({
  roles: ["admin"],
  roleDefinitions: {
    admin: ["read", "write", "delete", "update", "admin", "export", "approve"],
    editor: ["read", "write", "update"],
    viewer: ["read"],
    manager: ["read", "write", "approve"],
    hr: ["read", "write", "view_salary"],
  },
  restrictions: ["delete"], // Explicitly deny delete permission
});

console.log("Admin role permissions:", example1.getRolePermissions("admin"));
console.log("Active restrictions:", Array.from(example1.getRestrictions()));
console.log();
console.log("Can read?", example1.can("read")); // true
console.log("Can write?", example1.can("write")); // true
console.log("Can delete?", example1.can("delete")); // false (restricted!)
console.log("Can admin?", example1.can("admin")); // true
console.log();
console.log("All effective permissions:", Array.from(example1.getAllPermissions()));
console.log("→ Notice 'delete' is missing due to restriction");
console.log();

// ============================================================================
// Example 2: Sector-Based Restrictions
// ============================================================================
console.log("=== Example 2: Sector-Based Restrictions ===");
console.log("Use Case: Same admin role, but different permissions in different sectors");
console.log();

const example2 = new RoleBasedAccessControl<AppRoles, AppPermissions, AppSectors>({
  roles: ["admin"],
  sector: "finance", // User is in finance sector
  roleDefinitions: {
    admin: ["read", "write", "delete", "update", "admin", "transfer_funds", "export"],
    editor: ["read", "write", "update"],
    viewer: ["read"],
    manager: ["read", "write", "approve"],
    hr: ["read", "write", "view_salary"],
  },
  sectorRestrictions: {
    finance: ["delete", "transfer_funds"], // Restricted in finance
    hr: ["export", "delete"], // Restricted in HR
    sales: ["admin"], // Restricted in sales
    it: [], // No restrictions in IT
    marketing: ["delete", "admin"], // Restricted in marketing
  },
});

console.log("Current sector:", example2.getSector());
console.log("Sector restrictions for finance:", example2.getSectorRestrictedPermissions("finance"));
console.log();
console.log("In FINANCE sector:");
console.log("  Can read?", example2.can("read")); // true
console.log("  Can write?", example2.can("write")); // true
console.log("  Can delete?", example2.can("delete")); // false (restricted in finance)
console.log("  Can transfer_funds?", example2.can("transfer_funds")); // false (restricted in finance)
console.log("  Can admin?", example2.can("admin")); // true
console.log();

// Change sector to IT
example2.setSector("it");
console.log("Switching to IT sector...");
console.log("Current sector:", example2.getSector());
console.log("Sector restrictions for IT:", example2.getSectorRestrictedPermissions("it"));
console.log();
console.log("In IT sector:");
console.log("  Can delete?", example2.can("delete")); // true (no restrictions in IT)
console.log("  Can transfer_funds?", example2.can("transfer_funds")); // true
console.log("  Can admin?", example2.can("admin")); // true
console.log();

// Change sector to HR
example2.setSector("hr");
console.log("Switching to HR sector...");
console.log("Current sector:", example2.getSector());
console.log();
console.log("In HR sector:");
console.log("  Can delete?", example2.can("delete")); // false (restricted in HR)
console.log("  Can export?", example2.can("export")); // false (restricted in HR)
console.log("  Can admin?", example2.can("admin")); // true
console.log();

// ============================================================================
// Example 3: Combined Restrictions (Direct + Sector)
// ============================================================================
console.log("=== Example 3: Combined Restrictions (Direct + Sector) ===");
console.log("Use Case: Both direct restrictions AND sector-based restrictions apply");
console.log();

const example3 = new RoleBasedAccessControl<AppRoles, AppPermissions, AppSectors>({
  roles: ["admin"],
  restrictions: ["admin"], // Direct restriction: no admin permission
  sector: "finance",
  roleDefinitions: {
    admin: ["read", "write", "delete", "update", "admin", "transfer_funds", "export"],
    editor: ["read", "write", "update"],
    viewer: ["read"],
    manager: ["read", "write", "approve"],
    hr: ["read", "write", "view_salary"],
  },
  sectorRestrictions: {
    finance: ["delete", "transfer_funds"], // Finance restrictions
    hr: ["export", "delete"],
    sales: [],
    it: [],
    marketing: ["delete"],
  },
});

console.log("Direct restrictions:", Array.from(example3.getRestrictions()));
console.log("Sector restrictions (finance):", example3.getSectorRestrictedPermissions("finance"));
console.log("All effective restrictions:", Array.from(example3.getAllRestrictions()));
console.log();
console.log("Can read?", example3.can("read")); // true
console.log("Can write?", example3.can("write")); // true
console.log("Can delete?", example3.can("delete")); // false (restricted by sector)
console.log("Can transfer_funds?", example3.can("transfer_funds")); // false (restricted by sector)
console.log("Can admin?", example3.can("admin")); // false (restricted directly)
console.log();
console.log("All effective permissions:", Array.from(example3.getAllPermissions()));
console.log("→ 'admin', 'delete', and 'transfer_funds' are all restricted");
console.log();

// ============================================================================
// Example 4: Dynamic Restriction Management
// ============================================================================
console.log("=== Example 4: Dynamic Restriction Management ===");
console.log("Use Case: Add and remove restrictions at runtime");
console.log();

const example4 = new RoleBasedAccessControl<AppRoles, AppPermissions, AppSectors>({
  roles: ["editor"],
  roleDefinitions: {
    admin: ["read", "write", "delete", "update", "admin"],
    editor: ["read", "write", "update", "delete"],
    viewer: ["read"],
    manager: ["read", "write", "approve"],
    hr: ["read", "write", "view_salary"],
  },
});

console.log("Initial state:");
console.log("  Can delete?", example4.can("delete")); // true
console.log("  Can update?", example4.can("update")); // true
console.log();

// Add restrictions
example4.addRestrictions(["delete"]);
console.log("After adding 'delete' restriction:");
console.log("  Can delete?", example4.can("delete")); // false
console.log("  Can update?", example4.can("update")); // true
console.log("  Restrictions:", Array.from(example4.getRestrictions()));
console.log();

// Add more restrictions
example4.addRestrictions(["update", "write"]);
console.log("After adding 'update' and 'write' restrictions:");
console.log("  Can write?", example4.can("write")); // false
console.log("  Can update?", example4.can("update")); // false
console.log("  Can read?", example4.can("read")); // true
console.log("  Restrictions:", Array.from(example4.getRestrictions()));
console.log();

// Remove some restrictions
example4.removeRestrictions(["write"]);
console.log("After removing 'write' restriction:");
console.log("  Can write?", example4.can("write")); // true
console.log("  Can update?", example4.can("update")); // false (still restricted)
console.log("  Restrictions:", Array.from(example4.getRestrictions()));
console.log();

// Clear all restrictions
example4.clearRestrictions();
console.log("After clearing all restrictions:");
console.log("  Can delete?", example4.can("delete")); // true
console.log("  Can update?", example4.can("update")); // true
console.log("  Restrictions:", Array.from(example4.getRestrictions()));
console.log();

// ============================================================================
// Example 5: Sector Switching with Dynamic Restrictions
// ============================================================================
console.log("=== Example 5: Sector Switching Scenario ===");
console.log("Use Case: User moves between departments with different restrictions");
console.log();

const example5 = new RoleBasedAccessControl<AppRoles, AppPermissions, AppSectors>({
  roles: ["manager"],
  roleDefinitions: {
    admin: ["read", "write", "delete", "update", "admin"],
    editor: ["read", "write", "update"],
    viewer: ["read"],
    manager: ["read", "write", "update", "delete", "approve", "export"],
    hr: ["read", "write", "view_salary"],
  },
  sectorRestrictions: {
    finance: ["delete", "export"],
    hr: ["export", "delete", "approve"],
    sales: ["delete"],
    it: [],
    marketing: ["delete", "approve"],
  },
});

const testInSector = (sector: AppSectors) => {
  example5.setSector(sector);
  console.log(`In ${sector.toUpperCase()} department:`);
  console.log(`  Current sector: ${example5.getSector()}`);
  console.log(`  Sector restrictions:`, example5.getSectorRestrictedPermissions(sector));
  console.log(`  Can delete?`, example5.can("delete"));
  console.log(`  Can approve?`, example5.can("approve"));
  console.log(`  Can export?`, example5.can("export"));
  console.log(`  Effective permissions:`, Array.from(example5.getAllPermissions()));
  console.log();
};

testInSector("finance");
testInSector("hr");
testInSector("sales");
testInSector("it");

// ============================================================================
// Example 6: Real-World Scenario - Multi-Tenant Application
// ============================================================================
console.log("=== Example 6: Real-World Multi-Tenant Scenario ===");
console.log("Use Case: SaaS app with different feature access per tenant/plan");
console.log();

type TenantPlan = "free" | "basic" | "premium" | "enterprise";
type Features =
  | "view_data"
  | "create_records"
  | "delete_records"
  | "export_data"
  | "api_access"
  | "advanced_analytics"
  | "custom_branding"
  | "sso";

const multiTenant = new RoleBasedAccessControl<AppRoles, Features, TenantPlan>({
  roles: ["admin"],
  sector: "basic", // User is on basic plan
  roleDefinitions: {
    admin: [
      "view_data",
      "create_records",
      "delete_records",
      "export_data",
      "api_access",
      "advanced_analytics",
      "custom_branding",
      "sso",
    ],
    editor: ["view_data", "create_records", "delete_records"],
    viewer: ["view_data"],
    manager: ["view_data", "create_records", "delete_records", "export_data"],
    hr: ["view_data", "create_records"],
  },
  sectorRestrictions: {
    free: [
      "delete_records",
      "export_data",
      "api_access",
      "advanced_analytics",
      "custom_branding",
      "sso",
    ],
    basic: ["api_access", "advanced_analytics", "custom_branding", "sso"],
    premium: ["sso", "custom_branding"],
    enterprise: [], // All features available
  },
});

const checkPlanFeatures = (plan: TenantPlan) => {
  multiTenant.setSector(plan);
  console.log(`${plan.toUpperCase()} Plan:`);
  console.log(`  Restricted features:`, multiTenant.getSectorRestrictedPermissions(plan));
  console.log(`  Can view_data?`, multiTenant.can("view_data"));
  console.log(`  Can export_data?`, multiTenant.can("export_data"));
  console.log(`  Can use api_access?`, multiTenant.can("api_access"));
  console.log(`  Can use advanced_analytics?`, multiTenant.can("advanced_analytics"));
  console.log(`  Can use sso?`, multiTenant.can("sso"));
  console.log(`  Available features:`, Array.from(multiTenant.getAllPermissions()));
  console.log();
};

checkPlanFeatures("free");
checkPlanFeatures("basic");
checkPlanFeatures("premium");
checkPlanFeatures("enterprise");

// ============================================================================
// Example 7: Permission Summary for Debugging
// ============================================================================
console.log("=== Example 7: Permission Summary (Debugging) ===");
console.log("Use Case: Get complete overview of permission state");
console.log();

const example7 = new RoleBasedAccessControl<AppRoles, AppPermissions, AppSectors>({
  permissions: ["admin"],
  roles: ["editor", "viewer"],
  restrictions: ["delete"],
  sector: "finance",
  roleDefinitions: {
    admin: ["read", "write", "delete", "update", "admin"],
    editor: ["read", "write", "update"],
    viewer: ["read"],
    manager: ["read", "write", "approve"],
    hr: ["read", "write", "view_salary"],
  },
  sectorRestrictions: {
    finance: ["transfer_funds", "export"],
    hr: ["export"],
    sales: [],
    it: [],
    marketing: [],
  },
});

const summary = example7.getPermissionSummary();
console.log("Complete Permission Summary:");
console.log(JSON.stringify(summary, null, 2));
console.log();

// ============================================================================
// Example 8: Priority Demonstration
// ============================================================================
console.log("=== Example 8: Permission Resolution Priority ===");
console.log("Priority: Restrictions > Direct Permissions > Role Permissions");
console.log();

const example8 = new RoleBasedAccessControl<AppRoles, AppPermissions, AppSectors>({
  permissions: ["delete"], // Direct permission grants delete
  roles: ["admin"],
  restrictions: ["delete"], // But restriction denies it
  roleDefinitions: {
    admin: ["read", "write", "delete", "update", "admin"],
    editor: ["read", "write", "update"],
    viewer: ["read"],
    manager: ["read", "write", "approve"],
    hr: ["read", "write", "view_salary"],
  },
});

console.log("Configuration:");
console.log("  Direct permissions:", Array.from(example8.getPermissions()));
console.log("  Roles:", Array.from(example8.getRoles()));
console.log("  Role permissions (admin):", example8.getRolePermissions("admin"));
console.log("  Restrictions:", Array.from(example8.getRestrictions()));
console.log();
console.log("Result:");
console.log("  Can delete?", example8.can("delete")); // false
console.log("  → Even though 'delete' is granted both directly and by role,");
console.log("    the restriction takes precedence and denies access");
console.log();
console.log("  Can read?", example8.can("read")); // true
console.log("  Can admin?", example8.can("admin")); // true
console.log();

// ============================================================================
// Example 9: Practical Use Case - Temporary Access Control
// ============================================================================
console.log("=== Example 9: Temporary Access Control ===");
console.log("Use Case: Grant temporary elevated access, then revoke");
console.log();

const example9 = new RoleBasedAccessControl<AppRoles, AppPermissions, AppSectors>({
  roles: ["editor"],
  roleDefinitions: {
    admin: ["read", "write", "delete", "update", "admin"],
    editor: ["read", "write", "update"],
    viewer: ["read"],
    manager: ["read", "write", "approve"],
    hr: ["read", "write", "view_salary"],
  },
});

console.log("Initial state (Editor):");
console.log("  Can delete?", example9.can("delete")); // false
console.log("  Roles:", Array.from(example9.getRoles()));
console.log();

// Grant temporary admin access
console.log("Granting temporary admin role...");
example9.addRoles(["admin"]);
console.log("  Can delete?", example9.can("delete")); // true
console.log("  Roles:", Array.from(example9.getRoles()));
console.log();

// After some time, restrict the dangerous permission instead of removing role
console.log("Restricting 'delete' permission for safety...");
example9.addRestrictions(["delete"]);
console.log("  Can delete?", example9.can("delete")); // false
console.log("  Can admin?", example9.can("admin")); // true (other admin permissions still work)
console.log("  Restrictions:", Array.from(example9.getRestrictions()));
console.log();

// Later, completely revoke admin access
console.log("Revoking admin role...");
example9.removeRoles(["admin"]);
example9.clearRestrictions();
console.log("  Can delete?", example9.can("delete")); // false
console.log("  Can write?", example9.can("write")); // true (back to editor permissions)
console.log("  Roles:", Array.from(example9.getRoles()));
console.log();

console.log("=".repeat(80));
console.log("END OF EXAMPLES");
console.log("=".repeat(80));
