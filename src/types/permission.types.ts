/**
 * Represents a single permission.
 * By default, it's a string, but it can be a union of literal strings
 * for stricter type safety and IDE autocomplete.
 */
export type TPermission = string;

/**
 * Represents a single role name.
 * Can be a string or a union of literal strings for type safety.
 */
export type TRole = string;

/**
 * Represents a sector/context name.
 * Can be a string or a union of literal strings for type safety.
 * Used to apply contextual permission restrictions.
 */
export type TSector = string;

/**
 * Represents a set of permissions.
 * Internally used by RBAC to efficiently manage permission checks.
 *
 * @template TPerm - Type of permission strings.
 */
export type TPermissionSet<TPerm extends string = string> = Set<TPerm>;

/**
 * Represents a set of roles.
 * Internally used by RBAC to efficiently manage role assignments.
 *
 * @template TRoleName - Type of role name strings.
 */
export type TRoleSet<TRoleName extends string = string> = Set<TRoleName>;

/**
 * Defines the permissions associated with each role.
 *
 * @template TRoleName - Type of role name strings.
 * @template TPerm - Type of permission strings.
 */
export type TRoleDefinitions<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
> = Record<TRoleName, TPerm[]>;

/**
 * Defines permission restrictions for different sectors/contexts.
 * Maps sector names to arrays of restricted permissions.
 *
 * @template TSectorName - Type of sector name strings.
 * @template TPerm - Type of permission strings.
 */
export type TSectorRestrictions<
  TSectorName extends TSector = TSector,
  TPerm extends TPermission = TPermission,
> = Record<TSectorName, TPerm[]>;

/**
 * Configuration object for initializing the Role-Based Access Control (RBAC) system.
 *
 * @template TRoleName - Type of role name strings.
 * @template TPerm - Type of allowed permission strings.
 * @template TSectorName - Type of sector name strings.
 */
export interface TConfig<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
> {
  /**
   * List of permissions directly assigned.
   * These permissions are always available regardless of roles.
   * @optional
   */
  permissions?: TPerm[];

  /**
   * List of roles assigned to the user.
   * Permissions are resolved from role definitions.
   * @optional
   */
  roles?: TRoleName[];

  /**
   * Defines which permissions each role has.
   * Maps role names to arrays of permissions.
   * @optional
   */
  roleDefinitions?: TRoleDefinitions<TRoleName, TPerm>;

  /**
   * List of explicitly restricted/denied permissions.
   * These permissions are denied regardless of roles or direct permissions.
   * Restrictions take the highest priority in permission resolution.
   * @optional
   */
  restrictions?: TPerm[];

  /**
   * The current sector/context/department for the user.
   * Used in combination with sectorRestrictions to apply contextual restrictions.
   * @optional
   */
  sector?: TSectorName;

  /**
   * Defines which permissions are restricted for each sector/context.
   * When a sector is active, its restricted permissions are denied.
   * @optional
   */
  sectorRestrictions?: TSectorRestrictions<TSectorName, TPerm>;
}
