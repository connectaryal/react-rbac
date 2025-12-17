import { RoleBasedAccessControl } from "../../src/core/rbac";

describe("RoleBasedAccessControl", () => {
  describe("Constructor and Initialization", () => {
    it("should initialize with empty config", () => {
      const rbac = new RoleBasedAccessControl();

      expect(rbac.getPermissions().size).toBe(0);
      expect(rbac.getRoles().size).toBe(0);
      expect(rbac.getRestrictions().size).toBe(0);
      expect(rbac.getSector()).toBeNull();
    });

    it("should initialize with permissions", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "write"],
      });

      expect(rbac.getPermissions().size).toBe(2);
      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("write")).toBe(true);
    });

    it("should initialize with roles", () => {
      const rbac = new RoleBasedAccessControl({
        roles: ["admin", "editor"],
      });

      expect(rbac.getRoles().size).toBe(2);
      expect(rbac.hasRole("admin")).toBe(true);
      expect(rbac.hasRole("editor")).toBe(true);
    });

    it("should initialize with role definitions", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roles: ["editor"],
        roleDefinitions: {
          editor: ["read", "write"],
          admin: ["read", "write", "delete"],
        },
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("write")).toBe(true);
      expect(rbac.hasPermission("delete")).toBe(false);
    });

    it("should initialize with restrictions", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "write", "delete"],
        restrictions: ["delete"],
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("delete")).toBe(false);
    });

    it("should initialize with sector", () => {
      const rbac = new RoleBasedAccessControl({
        sector: "finance",
      });

      expect(rbac.getSector()).toBe("finance");
    });

    it("should initialize with sector restrictions", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "write", "delete"],
        sector: "finance",
        sectorRestrictions: {
          finance: ["delete"],
        },
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("delete")).toBe(false);
    });

    it("should initialize with full config", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read"],
        roles: ["editor"],
        roleDefinitions: {
          editor: ["write", "update"],
        },
        restrictions: ["delete"],
        sector: "finance",
        sectorRestrictions: {
          finance: ["admin"],
        },
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("write")).toBe(true);
      expect(rbac.hasPermission("delete")).toBe(false);
      expect(rbac.hasRole("editor")).toBe(true);
    });
  });

  describe("Permission Management", () => {
    it("should get permissions", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "write"],
      });

      const perms = rbac.getPermissions();
      expect(perms.size).toBe(2);
      expect(perms.has("read")).toBe(true);
      expect(perms.has("write")).toBe(true);
    });

    it("should set permissions", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        permissions: ["read", "write"],
      });

      rbac.setPermissions(["delete", "update"] as any);

      expect(rbac.hasPermission("read")).toBe(false);
      expect(rbac.hasPermission("delete" as any)).toBe(true);
      expect(rbac.hasPermission("update" as any)).toBe(true);
    });

    it("should add permissions", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        permissions: ["read"],
      });

      const result = rbac.addPermissions(["write", "delete"] as any);

      expect(result.size).toBe(3);
      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("write" as any)).toBe(true);
      expect(rbac.hasPermission("delete" as any)).toBe(true);
    });

    it("should add duplicate permissions without error", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        permissions: ["read"],
      });

      rbac.addPermissions(["read", "write"] as any);

      expect(rbac.getPermissions().size).toBe(2);
    });

    it("should remove permissions", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "write", "delete"],
      });

      const result = rbac.removePermissions(["write", "delete"]);

      expect(result.size).toBe(1);
      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("write")).toBe(false);
    });

    it("should get all permissions including role-based ones", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read"],
        roles: ["editor"],
        roleDefinitions: {
          editor: ["write", "update"],
        },
      });

      const allPerms = rbac.getAllPermissions();

      expect(allPerms.size).toBe(3);
      expect(allPerms.has("read")).toBe(true);
      expect(allPerms.has("write")).toBe(true);
      expect(allPerms.has("update")).toBe(true);
    });

    it("should exclude restricted permissions from getAllPermissions", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "write", "delete"],
        restrictions: ["delete"],
      });

      const allPerms = rbac.getAllPermissions();

      expect(allPerms.size).toBe(2);
      expect(allPerms.has("delete")).toBe(false);
    });

    it("should exclude sector-restricted permissions from getAllPermissions", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "write", "delete"],
        sector: "finance",
        sectorRestrictions: {
          finance: ["delete"],
        },
      });

      const allPerms = rbac.getAllPermissions();

      expect(allPerms.size).toBe(2);
      expect(allPerms.has("delete")).toBe(false);
    });
  });

  describe("Role Management", () => {
    it("should get roles", () => {
      const rbac = new RoleBasedAccessControl({
        roles: ["admin", "editor"],
      });

      const roles = rbac.getRoles();
      expect(roles.size).toBe(2);
      expect(roles.has("admin")).toBe(true);
      expect(roles.has("editor")).toBe(true);
    });

    it("should set roles", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roles: ["admin", "editor"],
      });

      rbac.setRoles(["viewer"] as any);

      expect(rbac.hasRole("admin" as any)).toBe(false);
      expect(rbac.hasRole("viewer" as any)).toBe(true);
    });

    it("should add roles", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roles: ["viewer"],
      });

      const result = rbac.addRoles(["editor", "admin"] as any);

      expect(result.size).toBe(3);
      expect(rbac.hasRole("viewer")).toBe(true);
      expect(rbac.hasRole("editor" as any)).toBe(true);
      expect(rbac.hasRole("admin" as any)).toBe(true);
    });

    it("should remove roles", () => {
      const rbac = new RoleBasedAccessControl({
        roles: ["admin", "editor", "viewer"],
      });

      const result = rbac.removeRoles(["admin", "viewer"]);

      expect(result.size).toBe(1);
      expect(rbac.hasRole("editor")).toBe(true);
      expect(rbac.hasRole("admin")).toBe(false);
    });

    it("should check if has specific role", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roles: ["editor"],
      });

      expect(rbac.hasRole("editor")).toBe(true);
      expect(rbac.hasRole("admin" as any)).toBe(false);
    });
  });

  describe("Role Definitions", () => {
    it("should get role definitions", () => {
      const definitions = {
        editor: ["read", "write"],
        admin: ["read", "write", "delete"],
      };

      const rbac = new RoleBasedAccessControl<string, string, string>({
        roleDefinitions: definitions,
      });

      const result = rbac.getRoleDefinitions();
      expect(result).toEqual(definitions);
    });

    it("should set role definitions", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>();

      rbac.setRoleDefinitions({
        editor: ["read", "write"],
        admin: ["read", "write", "delete"],
      } as any);

      expect(rbac.getRolePermissions("editor" as any)).toEqual([
        "read",
        "write",
      ]);
      expect(rbac.getRolePermissions("admin" as any)).toEqual([
        "read",
        "write",
        "delete",
      ]);
    });

    it("should define a single role", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>();

      rbac.defineRole("editor" as any, ["read", "write"] as any);

      expect(rbac.getRolePermissions("editor" as any)).toEqual([
        "read",
        "write",
      ]);
    });

    it("should update existing role definition", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roleDefinitions: {
          editor: ["read"],
        },
      });

      rbac.defineRole("editor" as any, ["read", "write", "update"] as any);

      expect(rbac.getRolePermissions("editor" as any)).toEqual([
        "read",
        "write",
        "update",
      ]);
    });

    it("should remove role definition", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roleDefinitions: {
          editor: ["read", "write"],
          admin: ["read", "write", "delete"],
        },
      });

      rbac.removeRoleDefinition("editor" as any);

      expect(rbac.getRolePermissions("editor" as any)).toEqual([]);
      expect(rbac.getRolePermissions("admin" as any)).toEqual([
        "read",
        "write",
        "delete",
      ]);
    });

    it("should get role permissions", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roleDefinitions: {
          editor: ["read", "write"],
        },
      });

      expect(rbac.getRolePermissions("editor" as any)).toEqual([
        "read",
        "write",
      ]);
    });

    it("should return empty array for undefined role", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>();

      expect(rbac.getRolePermissions("nonexistent" as any)).toEqual([]);
    });
  });

  describe("Restrictions", () => {
    it("should get restrictions", () => {
      const rbac = new RoleBasedAccessControl({
        restrictions: ["delete", "admin"],
      });

      const restrictions = rbac.getRestrictions();
      expect(restrictions.size).toBe(2);
      expect(restrictions.has("delete")).toBe(true);
      expect(restrictions.has("admin")).toBe(true);
    });

    it("should set restrictions", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        restrictions: ["delete"],
      });

      rbac.setRestrictions(["admin", "superuser"] as any);

      expect(rbac.getRestrictions().size).toBe(2);
      expect(rbac.getRestrictions().has("delete")).toBe(false);
      expect(rbac.getRestrictions().has("admin" as any)).toBe(true);
    });

    it("should add restrictions", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        restrictions: ["delete"],
      });

      const result = rbac.addRestrictions(["admin", "superuser"] as any);

      expect(result.size).toBe(3);
      expect(rbac.getRestrictions().has("delete")).toBe(true);
      expect(rbac.getRestrictions().has("admin" as any)).toBe(true);
    });

    it("should remove restrictions", () => {
      const rbac = new RoleBasedAccessControl({
        restrictions: ["delete", "admin", "superuser"],
      });

      const result = rbac.removeRestrictions(["admin", "superuser"]);

      expect(result.size).toBe(1);
      expect(rbac.getRestrictions().has("delete")).toBe(true);
      expect(rbac.getRestrictions().has("admin")).toBe(false);
    });

    it("should clear all restrictions", () => {
      const rbac = new RoleBasedAccessControl({
        restrictions: ["delete", "admin", "superuser"],
      });

      rbac.clearRestrictions();

      expect(rbac.getRestrictions().size).toBe(0);
    });

    it("should get all restrictions including sector ones", () => {
      const rbac = new RoleBasedAccessControl({
        restrictions: ["delete"],
        sector: "finance",
        sectorRestrictions: {
          finance: ["admin", "superuser"],
        },
      });

      const allRestrictions = rbac.getAllRestrictions();

      expect(allRestrictions.size).toBe(3);
      expect(allRestrictions.has("delete")).toBe(true);
      expect(allRestrictions.has("admin")).toBe(true);
      expect(allRestrictions.has("superuser")).toBe(true);
    });

    it("should check if permission is restricted", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "delete"],
        restrictions: ["delete"],
      });

      expect(rbac.isPermissionRestricted("delete")).toBe(true);
      expect(rbac.isPermissionRestricted("read")).toBe(false);
    });
  });

  describe("Sector Management", () => {
    it("should get sector", () => {
      const rbac = new RoleBasedAccessControl({
        sector: "finance",
      });

      expect(rbac.getSector()).toBe("finance");
    });

    it("should set sector", () => {
      const rbac = new RoleBasedAccessControl();

      rbac.setSector("finance");

      expect(rbac.getSector()).toBe("finance");
    });

    it("should clear sector", () => {
      const rbac = new RoleBasedAccessControl({
        sector: "finance",
      });

      rbac.setSector(null);

      expect(rbac.getSector()).toBeNull();
    });

    it("should get sector restrictions", () => {
      const restrictions = {
        finance: ["delete", "admin"],
        hr: ["finance"],
      };

      const rbac = new RoleBasedAccessControl({
        sectorRestrictions: restrictions,
      });

      expect(rbac.getSectorRestrictions()).toEqual(restrictions);
    });

    it("should set sector restrictions", () => {
      const rbac = new RoleBasedAccessControl();

      rbac.setSectorRestrictions({
        finance: ["delete"],
        hr: ["salary"],
      });

      expect(rbac.getSectorRestrictedPermissions("finance")).toEqual([
        "delete",
      ]);
      expect(rbac.getSectorRestrictedPermissions("hr")).toEqual(["salary"]);
    });

    it("should define sector restrictions", () => {
      const rbac = new RoleBasedAccessControl();

      rbac.defineSectorRestrictions("finance", ["delete", "admin"]);

      expect(rbac.getSectorRestrictedPermissions("finance")).toEqual([
        "delete",
        "admin",
      ]);
    });

    it("should remove sector restrictions", () => {
      const rbac = new RoleBasedAccessControl({
        sectorRestrictions: {
          finance: ["delete"],
          hr: ["salary"],
        },
      });

      rbac.removeSectorRestrictions("finance");

      expect(rbac.getSectorRestrictedPermissions("finance")).toEqual([]);
      expect(rbac.getSectorRestrictedPermissions("hr")).toEqual(["salary"]);
    });

    it("should get sector restricted permissions", () => {
      const rbac = new RoleBasedAccessControl({
        sectorRestrictions: {
          finance: ["delete", "admin"],
        },
      });

      expect(rbac.getSectorRestrictedPermissions("finance")).toEqual([
        "delete",
        "admin",
      ]);
    });

    it("should return empty array for undefined sector", () => {
      const rbac = new RoleBasedAccessControl();

      expect(rbac.getSectorRestrictedPermissions("nonexistent" as any)).toEqual(
        [],
      );
    });
  });

  describe("Permission Checking", () => {
    it("should check direct permission", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "write"],
        roleDefinitions: {
          admin: ["read", "write", "delete"],
        },
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("delete")).toBe(false);
    });

    it("should check role-based permission", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roles: ["editor"],
        roleDefinitions: {
          editor: ["read", "write"],
        },
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("write")).toBe(true);
      expect(rbac.hasPermission("delete" as any)).toBe(false);
    });

    it("should deny restricted permission", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "write", "delete"],
        restrictions: ["delete"],
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("delete")).toBe(false);
    });

    it("should deny sector-restricted permission", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        permissions: ["read", "write", "delete"],
        sector: "finance",
        sectorRestrictions: {
          finance: ["delete"],
        },
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("delete" as any)).toBe(false);
    });

    it("should allow permission when sector is different", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        permissions: ["read", "write", "delete"],
        sector: "hr",
        sectorRestrictions: {
          finance: ["delete"],
        } as any,
      });

      expect(rbac.hasPermission("delete")).toBe(true);
    });

    it("should prioritize restrictions over permissions", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["delete"],
        roles: ["admin"],
        roleDefinitions: {
          admin: ["delete"],
        },
        restrictions: ["delete"],
      });

      expect(rbac.hasPermission("delete")).toBe(false);
    });

    it("should check permission from multiple roles", () => {
      const rbac = new RoleBasedAccessControl({
        roles: ["viewer", "editor"],
        roleDefinitions: {
          viewer: ["read"],
          editor: ["write", "update"],
        },
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("write")).toBe(true);
      expect(rbac.hasPermission("update")).toBe(true);
    });
  });

  describe("can() method", () => {
    it("should check single permission", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        permissions: ["read"],
      });

      expect(rbac.can("read")).toBe(true);
      expect(rbac.can("write" as any)).toBe(false);
    });

    it("should check multiple permissions with SOME logic (default)", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        permissions: ["read", "write"],
      });

      expect(rbac.can(["read", "write"] as any)).toBe(true);
      expect(rbac.can(["delete", "admin"] as any)).toBe(false);
    });

    it("should check multiple permissions with EVERY logic", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        permissions: ["read", "write"],
      });

      expect(rbac.can(["read", "write"], true)).toBe(true);
      expect(rbac.can(["read", "delete"] as any, true)).toBe(false);
    });

    it("should check empty array with SOME logic", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read"],
      });

      expect(rbac.can([], false)).toBe(false);
    });

    it("should check empty array with EVERY logic", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read"],
      });

      expect(rbac.can([], true)).toBe(true);
    });

    it("should respect restrictions in can()", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "write", "delete"],
        restrictions: ["delete"],
      });

      expect(rbac.can(["read", "delete"], false)).toBe(true);
      expect(rbac.can(["read", "delete"], true)).toBe(false);
      expect(rbac.can("delete")).toBe(false);
    });
  });

  describe("hasRoles() method", () => {
    it("should check single role", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roles: ["editor"],
      });

      expect(rbac.hasRoles("editor")).toBe(true);
      expect(rbac.hasRoles("admin" as any)).toBe(false);
    });

    it("should check multiple roles with SOME logic (default)", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roles: ["editor", "viewer"],
      });

      expect(rbac.hasRoles(["editor", "admin"] as any)).toBe(true);
      expect(rbac.hasRoles(["admin", "superuser"] as any)).toBe(false);
    });

    it("should check multiple roles with EVERY logic", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roles: ["editor", "viewer"],
      });

      expect(rbac.hasRoles(["editor", "viewer"], true)).toBe(true);
      expect(rbac.hasRoles(["editor", "admin"] as any, true)).toBe(false);
    });

    it("should check empty array with SOME logic", () => {
      const rbac = new RoleBasedAccessControl({
        roles: ["editor"],
      });

      expect(rbac.hasRoles([], false)).toBe(false);
    });

    it("should check empty array with EVERY logic", () => {
      const rbac = new RoleBasedAccessControl({
        roles: ["editor"],
      });

      expect(rbac.hasRoles([], true)).toBe(true);
    });
  });

  describe("getPermissionSummary()", () => {
    it("should return comprehensive permission summary", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read"],
        roles: ["editor"],
        roleDefinitions: {
          editor: ["write", "update"],
        },
        restrictions: ["delete"],
        sector: "finance",
        sectorRestrictions: {
          finance: ["admin"],
        },
      });

      const summary = rbac.getPermissionSummary();

      expect(summary.directPermissions).toEqual(["read"]);
      expect(summary.roles).toEqual(["editor"]);
      expect(summary.directRestrictions).toEqual(["delete"]);
      expect(summary.sector).toBe("finance");
      expect(summary.sectorRestrictions).toEqual(["admin"]);
      expect(summary.allEffectivePermissions).toContain("read");
      expect(summary.allEffectivePermissions).toContain("write");
      expect(summary.allEffectivePermissions).toContain("update");
      expect(summary.allEffectiveRestrictions).toContain("delete");
      expect(summary.allEffectiveRestrictions).toContain("admin");
      expect(summary.roleDefinitions).toEqual({
        editor: ["write", "update"],
      });
    });

    it("should return summary with no sector", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read"],
      });

      const summary = rbac.getPermissionSummary();

      expect(summary.sector).toBeNull();
      expect(summary.sectorRestrictions).toEqual([]);
    });

    it("should return summary with no roles", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read"],
      });

      const summary = rbac.getPermissionSummary();

      expect(summary.roles).toEqual([]);
      expect(summary.allEffectivePermissions).toEqual(["read"]);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle combination of direct and role permissions", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read"],
        roles: ["editor"],
        roleDefinitions: {
          editor: ["write"],
        },
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("write")).toBe(true);
    });

    it("should handle restrictions overriding role permissions", () => {
      const rbac = new RoleBasedAccessControl({
        roles: ["admin"],
        roleDefinitions: {
          admin: ["read", "write", "delete"],
        },
        restrictions: ["delete"],
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("write")).toBe(true);
      expect(rbac.hasPermission("delete")).toBe(false);
    });

    it("should handle sector restrictions overriding permissions", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        permissions: ["read", "write", "delete"],
        sector: "finance",
        sectorRestrictions: {
          finance: ["delete"],
          hr: ["write"],
        } as any,
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("write")).toBe(true);
      expect(rbac.hasPermission("delete")).toBe(false);

      rbac.setSector("hr" as any);

      expect(rbac.hasPermission("write")).toBe(false);
      expect(rbac.hasPermission("delete")).toBe(true);
    });

    it("should handle both direct and sector restrictions", () => {
      const rbac = new RoleBasedAccessControl({
        permissions: ["read", "write", "delete", "admin"],
        restrictions: ["admin"],
        sector: "finance",
        sectorRestrictions: {
          finance: ["delete"],
        },
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasPermission("delete")).toBe(false);
      expect(rbac.hasPermission("admin")).toBe(false);
    });

    it("should handle dynamic role changes", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        roles: ["viewer"],
        roleDefinitions: {
          viewer: ["read"],
          editor: ["read", "write"],
        } as any,
      });

      expect(rbac.hasPermission("write")).toBe(false);

      rbac.addRoles(["editor"] as any);

      expect(rbac.hasPermission("write")).toBe(true);

      rbac.removeRoles(["editor"] as any);

      expect(rbac.hasPermission("write")).toBe(false);
    });

    it("should handle role without definition", () => {
      const rbac = new RoleBasedAccessControl({
        roles: ["editor"],
      });

      expect(rbac.hasPermission("read")).toBe(false);
    });

    it("should return new Set instances to prevent mutation", () => {
      const rbac = new RoleBasedAccessControl<string, string, string>({
        permissions: ["read"],
      });

      const perms1 = rbac.getPermissions();
      perms1.add("write" as any);

      const perms2 = rbac.getPermissions();
      expect(perms2.has("write" as any)).toBe(false);
    });
  });

  describe("Type Safety", () => {
    it("should work with typed permissions and roles", () => {
      type MyPermissions = "read" | "write" | "delete";
      type MyRoles = "admin" | "editor" | "viewer";
      type MySectors = "finance" | "hr";

      const rbac = new RoleBasedAccessControl<
        MyRoles,
        MyPermissions,
        MySectors
      >({
        permissions: ["read"],
        roles: ["editor"],
        roleDefinitions: {
          admin: ["read", "write", "delete"],
          editor: ["read", "write"],
          viewer: ["read"],
        },
        sector: "finance",
        sectorRestrictions: {
          finance: ["delete"],
          hr: ["write"],
        },
      });

      expect(rbac.hasPermission("read")).toBe(true);
      expect(rbac.hasRole("editor")).toBe(true);
      expect(rbac.getSector()).toBe("finance");
    });
  });
});
