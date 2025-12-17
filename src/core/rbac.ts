import {
  TConfig,
  TPermission,
  TPermissionSet,
  TRole,
  TRoleSet,
  TRoleDefinitions,
  TSector,
  TSectorRestrictions,
} from "../types/permission.types";

/**
 * RoleBasedAccessControl (RBAC) class
 *
 * A generic, type-safe utility to manage permissions, roles, and restrictions for a user.
 * Supports checking, adding, and validating permissions with contextual restrictions.
 *
 * Permission Resolution Priority:
 * 1. Restrictions (highest priority - denies access)
 * 2. Sector Restrictions (denies access based on context)
 * 3. Direct Permissions (grants access)
 * 4. Role-based Permissions (grants access)
 *
 * @template TRoleName - A string literal union type representing allowed role names.
 * @template TPerm - A string literal union type representing allowed permissions.
 * @template TSectorName - A string literal union type representing allowed sector names.
 */
export class RoleBasedAccessControl<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
> {
  /** Internal set of direct permissions */
  private permissions: TPermissionSet<TPerm>;

  /** Internal set of assigned roles */
  private roles: TRoleSet<TRoleName>;

  /** Role definitions mapping roles to their permissions */
  private roleDefinitions: TRoleDefinitions<TRoleName, TPerm>;

  /** Internal set of explicitly restricted/denied permissions */
  private restrictions: TPermissionSet<TPerm>;

  /** Current sector/context for the user */
  private sector: TSectorName | null;

  /** Sector-based permission restrictions */
  private sectorRestrictions: TSectorRestrictions<TSectorName, TPerm>;

  /**
   * Initialize the RBAC system with permissions, roles, restrictions, and sectors.
   * @param config Configuration object containing initial permissions, roles, restrictions, and sector settings.
   */
  constructor(config: TConfig<TRoleName, TPerm, TSectorName> = {}) {
    this.permissions = new Set(config.permissions ?? []);
    this.roles = new Set(config.roles ?? []);
    this.roleDefinitions = (config.roleDefinitions ?? {}) as TRoleDefinitions<
      TRoleName,
      TPerm
    >;
    this.restrictions = new Set(config.restrictions ?? []);
    this.sector = config.sector ?? null;
    this.sectorRestrictions = (config.sectorRestrictions ??
      {}) as TSectorRestrictions<TSectorName, TPerm>;
  }

  /**
   * Check if a permission is restricted (either directly or by sector).
   * @param perm The permission to check.
   * @returns True if the permission is restricted, false otherwise.
   */
  private isRestricted(perm: TPerm): boolean {
    // Check direct restrictions first
    if (this.restrictions.has(perm)) {
      return true;
    }

    // Check sector-based restrictions
    if (this.sector) {
      const sectorRestrictedPerms = this.sectorRestrictions[this.sector] ?? [];
      if (sectorRestrictedPerms.includes(perm)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all currently assigned direct permissions (excluding role-based permissions).
   * @returns A Set of direct permissions.
   */
  getPermissions(): TPermissionSet<TPerm> {
    return new Set(this.permissions);
  }

  /**
   * Get all permissions including both direct permissions and those inherited from roles,
   * excluding any restricted permissions.
   * @returns A Set of all effective permissions (after applying restrictions).
   */
  getAllPermissions(): TPermissionSet<TPerm> {
    const allPerms = new Set(this.permissions);

    // Add permissions from all assigned roles
    this.roles.forEach((role) => {
      const rolePerms = this.roleDefinitions[role] ?? [];
      rolePerms.forEach((perm) => allPerms.add(perm));
    });

    // Remove restricted permissions
    const effectivePerms = new Set<TPerm>();
    allPerms.forEach((perm) => {
      if (!this.isRestricted(perm)) {
        effectivePerms.add(perm);
      }
    });

    return effectivePerms;
  }

  /**
   * Replace the current direct permissions with a new set.
   * @param permissions Array of permissions to set.
   */
  setPermissions(permissions: TPerm[]): void {
    this.permissions = new Set(permissions);
  }

  /**
   * Add one or more direct permissions to the current set.
   * Duplicate permissions are automatically ignored.
   * @param perms Array of permissions to add.
   * @returns Updated Set of direct permissions.
   */
  addPermissions(perms: TPerm[]): TPermissionSet<TPerm> {
    perms.forEach((p) => this.permissions.add(p));
    return new Set(this.permissions);
  }

  /**
   * Remove one or more direct permissions from the current set.
   * @param perms Array of permissions to remove.
   * @returns Updated Set of direct permissions.
   */
  removePermissions(perms: TPerm[]): TPermissionSet<TPerm> {
    perms.forEach((p) => this.permissions.delete(p));
    return new Set(this.permissions);
  }

  /**
   * Get all currently assigned roles.
   * @returns A Set of role names.
   */
  getRoles(): TRoleSet<TRoleName> {
    return new Set(this.roles);
  }

  /**
   * Replace the current roles with a new set.
   * @param roles Array of role names to set.
   */
  setRoles(roles: TRoleName[]): void {
    this.roles = new Set(roles);
  }

  /**
   * Add one or more roles to the current set.
   * Duplicate roles are automatically ignored.
   * @param roles Array of role names to add.
   * @returns Updated Set of roles.
   */
  addRoles(roles: TRoleName[]): TRoleSet<TRoleName> {
    roles.forEach((role) => this.roles.add(role));
    return new Set(this.roles);
  }

  /**
   * Remove one or more roles from the current set.
   * @param roles Array of role names to remove.
   * @returns Updated Set of roles.
   */
  removeRoles(roles: TRoleName[]): TRoleSet<TRoleName> {
    roles.forEach((role) => this.roles.delete(role));
    return new Set(this.roles);
  }

  /**
   * Check if a specific role is assigned.
   * @param role The role name to check.
   * @returns True if the role is assigned, false otherwise.
   */
  hasRole(role: TRoleName): boolean {
    return this.roles.has(role);
  }

  /**
   * Get the role definitions (mapping of roles to permissions).
   * @returns The role definitions object.
   */
  getRoleDefinitions(): TRoleDefinitions<TRoleName, TPerm> {
    return { ...this.roleDefinitions };
  }

  /**
   * Set or update the role definitions.
   * @param definitions Object mapping role names to arrays of permissions.
   */
  setRoleDefinitions(definitions: TRoleDefinitions<TRoleName, TPerm>): void {
    this.roleDefinitions = definitions;
  }

  /**
   * Add or update a single role definition.
   * @param role The role name.
   * @param permissions Array of permissions for this role.
   */
  defineRole(role: TRoleName, permissions: TPerm[]): void {
    this.roleDefinitions[role] = permissions;
  }

  /**
   * Remove a role definition.
   * @param role The role name to remove from definitions.
   */
  removeRoleDefinition(role: TRoleName): void {
    delete this.roleDefinitions[role];
  }

  /**
   * Get permissions for a specific role from role definitions.
   * @param role The role name.
   * @returns Array of permissions for the role, or empty array if role not defined.
   */
  getRolePermissions(role: TRoleName): TPerm[] {
    return this.roleDefinitions[role] ?? [];
  }

  /**
   * Get all currently restricted permissions.
   * @returns A Set of restricted permissions.
   */
  getRestrictions(): TPermissionSet<TPerm> {
    return new Set(this.restrictions);
  }

  /**
   * Get all effective restrictions (direct restrictions + sector restrictions).
   * @returns A Set of all restricted permissions.
   */
  getAllRestrictions(): TPermissionSet<TPerm> {
    const allRestrictions = new Set(this.restrictions);

    // Add sector-based restrictions if a sector is set
    if (this.sector) {
      const sectorRestrictedPerms = this.sectorRestrictions[this.sector] ?? [];
      sectorRestrictedPerms.forEach((perm) => allRestrictions.add(perm));
    }

    return allRestrictions;
  }

  /**
   * Replace the current restrictions with a new set.
   * @param restrictions Array of permissions to restrict.
   */
  setRestrictions(restrictions: TPerm[]): void {
    this.restrictions = new Set(restrictions);
  }

  /**
   * Add one or more restrictions to the current set.
   * These permissions will be explicitly denied.
   * @param perms Array of permissions to restrict.
   * @returns Updated Set of restrictions.
   */
  addRestrictions(perms: TPerm[]): TPermissionSet<TPerm> {
    perms.forEach((p) => this.restrictions.add(p));
    return new Set(this.restrictions);
  }

  /**
   * Remove one or more restrictions from the current set.
   * @param perms Array of permissions to unrestrict.
   * @returns Updated Set of restrictions.
   */
  removeRestrictions(perms: TPerm[]): TPermissionSet<TPerm> {
    perms.forEach((p) => this.restrictions.delete(p));
    return new Set(this.restrictions);
  }

  /**
   * Clear all restrictions.
   */
  clearRestrictions(): void {
    this.restrictions.clear();
  }

  /**
   * Get the current sector/context.
   * @returns The current sector name, or null if not set.
   */
  getSector(): TSectorName | null {
    return this.sector;
  }

  /**
   * Set the current sector/context.
   * This will apply sector-specific permission restrictions.
   * @param sector The sector name, or null to clear.
   */
  setSector(sector: TSectorName | null): void {
    this.sector = sector;
  }

  /**
   * Get the sector restrictions configuration.
   * @returns The sector restrictions object.
   */
  getSectorRestrictions(): TSectorRestrictions<TSectorName, TPerm> {
    return { ...this.sectorRestrictions };
  }

  /**
   * Set or update the sector restrictions configuration.
   * @param restrictions Object mapping sector names to arrays of restricted permissions.
   */
  setSectorRestrictions(
    restrictions: TSectorRestrictions<TSectorName, TPerm>,
  ): void {
    this.sectorRestrictions = restrictions;
  }

  /**
   * Add or update restrictions for a specific sector.
   * @param sector The sector name.
   * @param permissions Array of permissions to restrict in this sector.
   */
  defineSectorRestrictions(sector: TSectorName, permissions: TPerm[]): void {
    this.sectorRestrictions[sector] = permissions;
  }

  /**
   * Remove restrictions for a specific sector.
   * @param sector The sector name.
   */
  removeSectorRestrictions(sector: TSectorName): void {
    delete this.sectorRestrictions[sector];
  }

  /**
   * Get restricted permissions for a specific sector.
   * @param sector The sector name.
   * @returns Array of restricted permissions for the sector, or empty array if not defined.
   */
  getSectorRestrictedPermissions(sector: TSectorName): TPerm[] {
    return this.sectorRestrictions[sector] ?? [];
  }

  /**
   * Check if a specific permission exists and is not restricted.
   * Takes into account direct permissions, role-based permissions, and all restrictions.
   * @param perm The permission to check.
   * @returns True if the permission exists and is not restricted, false otherwise.
   */
  hasPermission(perm: TPerm): boolean {
    // Check restrictions first (highest priority)
    if (this.isRestricted(perm)) {
      return false;
    }

    // Check direct permissions
    if (this.permissions.has(perm)) {
      return true;
    }

    // Check permissions from assigned roles
    for (const role of this.roles) {
      const rolePerms = this.roleDefinitions[role] ?? [];
      if (rolePerms.includes(perm)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate if the current permissions (direct + role-based, minus restrictions) satisfy a given set of permissions.
   *
   * Supports checking a single permission or multiple permissions with an `every` flag:
   * - `every = true`  → all permissions must exist (default behavior)
   * - `every = false` → at least one permission must exist
   *
   * @param perms A single permission or an array of permissions to validate.
   * @param every Boolean flag to control validation behavior (default: true).
   * @returns True if validation passes, false otherwise.
   *
   * @example
   * const rbac = new RoleBasedAccessControl({
   *   permissions: ['read'],
   *   roles: ['editor'],
   *   restrictions: ['delete'],
   *   roleDefinitions: { editor: ['write', 'update', 'delete'] }
   * });
   * rbac.can('read'); // true (direct permission)
   * rbac.can('write'); // true (from 'editor' role)
   * rbac.can('delete'); // false (restricted)
   * rbac.can(['read', 'write'], true); // true (both exist and not restricted)
   * rbac.can(['read', 'delete'], true); // false (delete is restricted)
   * rbac.can(['read', 'delete'], false); // true (at least read exists)
   */
  can(perms: TPerm | TPerm[], every: boolean = true): boolean {
    if (!Array.isArray(perms)) {
      return this.hasPermission(perms);
    }

    return every
      ? perms.every((perm) => this.hasPermission(perm)) // All permissions must exist
      : perms.some((perm) => this.hasPermission(perm)); // At least one permission exists
  }

  /**
   * Check if the user has any of the specified roles.
   * @param roles A single role or an array of role names to check.
   * @param every If true, all roles must be assigned. If false, at least one role must be assigned (default: false).
   * @returns True if the role check passes, false otherwise.
   */
  hasRoles(roles: TRoleName | TRoleName[], every: boolean = false): boolean {
    if (!Array.isArray(roles)) {
      return this.hasRole(roles);
    }

    return every
      ? roles.every((role) => this.hasRole(role)) // All roles must be assigned
      : roles.some((role) => this.hasRole(role)); // At least one role is assigned
  }

  /**
   * Check if a specific permission is restricted (either directly or by current sector).
   * @param perm The permission to check.
   * @returns True if the permission is restricted, false otherwise.
   */
  isPermissionRestricted(perm: TPerm): boolean {
    return this.isRestricted(perm);
  }

  /**
   * Get a summary of the current permission state.
   * Useful for debugging and understanding the permission resolution.
   * @returns An object containing all permission-related information.
   */
  getPermissionSummary() {
    return {
      directPermissions: Array.from(this.permissions),
      roles: Array.from(this.roles),
      directRestrictions: Array.from(this.restrictions),
      sector: this.sector,
      sectorRestrictions: this.sector
        ? this.getSectorRestrictedPermissions(this.sector)
        : [],
      allEffectivePermissions: Array.from(this.getAllPermissions()),
      allEffectiveRestrictions: Array.from(this.getAllRestrictions()),
      roleDefinitions: this.getRoleDefinitions(),
    };
  }
}
