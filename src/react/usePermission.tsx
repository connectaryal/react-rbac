import { useMemo } from "react";
import { useRBACContext } from "./RBACProvider";
import { TPermission, TRole, TSector } from "../types/permission.types";

/**
 * Permission check type
 */
export type PermissionCheckType = "SOME" | "EVERY";

/**
 * usePermission hook options
 */
export interface UsePermissionOptions {
  /**
   * Check type: 'SOME' (at least one) or 'EVERY' (all)
   * @default 'SOME'
   */
  checkType?: PermissionCheckType;

  /**
   * If true, returns null when RBAC is not initialized instead of false
   * Useful for showing loading states
   * @default true
   */
  returnNullWhenUninitialized?: boolean;

  /**
   * If true, provides detailed information about why permission was denied
   * @default false
   */
  includeDetails?: boolean;
}

/**
 * Result from usePermission hook
 */
export interface UsePermissionResult<
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
> {
  /**
   * Whether the user has the requested permission(s)
   * - true: User has permission
   * - false: User does not have permission
   * - null: RBAC not initialized (loading state)
   */
  hasPermission: boolean | null;

  /**
   * Whether the RBAC system is initialized
   */
  isInitialized: boolean;

  /**
   * Whether the permission is restricted
   */
  isRestricted: boolean;

  /**
   * Reason for restriction (if restricted)
   */
  restrictionReason?: "direct" | "sector";

  /**
   * All effective permissions the user has
   */
  allPermissions: Set<TPerm>;

  /**
   * Current sector/context
   */
  currentSector: TSectorName | null;

  /**
   * All active restrictions
   */
  allRestrictions: Set<TPerm>;

  /**
   * Check a different permission dynamically
   */
  can: (
    permission: TPerm | TPerm[],
    checkType?: PermissionCheckType,
  ) => boolean;
}

/**
 * usePermission Hook
 *
 * React hook for checking user permissions with support for roles, restrictions, and sectors.
 *
 * @template TRoleName - Role name type
 * @template TPerm - Permission type
 * @template TSectorName - Sector name type
 *
 * @param permissionNames - Permission(s) to check
 * @param options - Hook options
 *
 * @returns Permission check result with detailed information
 *
 * @example
 * // Single permission check
 * const { hasPermission } = usePermission('read');
 *
 * @example
 * // Multiple permissions (at least one required)
 * const { hasPermission } = usePermission(['read', 'write'], { checkType: 'SOME' });
 *
 * @example
 * // Multiple permissions (all required)
 * const { hasPermission } = usePermission(['read', 'write'], { checkType: 'EVERY' });
 *
 * @example
 * // With detailed information
 * const { hasPermission, isRestricted, restrictionReason } = usePermission(
 *   'delete',
 *   { includeDetails: true }
 * );
 *
 * @example
 * // Dynamic permission checking
 * const { can } = usePermission([]);
 * const canRead = can('read');
 * const canWrite = can('write');
 */
export function usePermission<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
>(
  permissionNames: TPerm | TPerm[],
  options: UsePermissionOptions = {},
): UsePermissionResult<TPerm, TSectorName> {
  const {
    checkType = "SOME",
    returnNullWhenUninitialized = true,
    includeDetails = false,
  } = options;

  const { rbac, isInitialized } = useRBACContext<
    TRoleName,
    TPerm,
    TSectorName
  >();

  // Normalize permission names to array
  const normalizedPermissionNames = useMemo(
    () =>
      Array.isArray(permissionNames) ? permissionNames : [permissionNames],
    [permissionNames],
  );

  // Calculate permission check result
  const result = useMemo(() => {
    // If no permissions required, always return true
    if (
      !permissionNames ||
      (Array.isArray(permissionNames) && permissionNames.length === 0)
    ) {
      return {
        hasPermission: true,
        isRestricted: false,
        restrictionReason: undefined,
      };
    }

    // If RBAC not initialized
    if (!rbac) {
      return {
        hasPermission: returnNullWhenUninitialized ? null : false,
        isRestricted: false,
        restrictionReason: undefined,
      };
    }

    // Check if permission is restricted (only if details requested)
    let isRestricted = false;
    let restrictionReason: "direct" | "sector" | undefined;

    if (includeDetails && normalizedPermissionNames.length > 0) {
      const firstPerm = normalizedPermissionNames[0];
      if (firstPerm !== undefined) {
        isRestricted = rbac.isPermissionRestricted(firstPerm);

        if (isRestricted) {
          const directRestrictions = rbac.getRestrictions();
          restrictionReason = directRestrictions.has(firstPerm)
            ? "direct"
            : "sector";
        }
      }
    }

    // Check permission
    const every = checkType === "EVERY";
    const hasPermission = rbac.can(normalizedPermissionNames, every);

    return {
      hasPermission,
      isRestricted,
      restrictionReason,
    };
  }, [
    rbac,
    normalizedPermissionNames,
    checkType,
    permissionNames,
    returnNullWhenUninitialized,
    includeDetails,
  ]);

  // Get additional information
  const allPermissions = useMemo(() => {
    return rbac ? rbac.getAllPermissions() : new Set<TPerm>();
  }, [rbac]);

  const currentSector = useMemo(() => {
    return rbac ? rbac.getSector() : null;
  }, [rbac]);

  const allRestrictions = useMemo(() => {
    return rbac ? rbac.getAllRestrictions() : new Set<TPerm>();
  }, [rbac]);

  // Dynamic permission checker
  const can = useMemo(
    () =>
      (permission: TPerm | TPerm[], dynamicCheckType?: PermissionCheckType) => {
        if (!rbac) return false;
        const every = (dynamicCheckType || checkType) === "EVERY";
        return rbac.can(permission, every);
      },
    [rbac, checkType],
  );

  return {
    hasPermission: result.hasPermission,
    isInitialized,
    isRestricted: result.isRestricted,
    restrictionReason: result.restrictionReason,
    allPermissions,
    currentSector,
    allRestrictions,
    can,
  };
}

/**
 * useHasPermission Hook
 *
 * Simplified version of usePermission that only returns boolean.
 * Useful when you only need to know if user has permission.
 *
 * @param permissionNames - Permission(s) to check
 * @param checkType - Check type: 'SOME' or 'EVERY'
 *
 * @returns boolean or null if not initialized
 *
 * @example
 * const canEdit = useHasPermission('edit');
 * const canManage = useHasPermission(['create', 'update', 'delete'], 'EVERY');
 */
export function useHasPermission<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
>(
  permissionNames: TPerm | TPerm[],
  checkType: PermissionCheckType = "SOME",
): boolean | null {
  const { hasPermission } = usePermission<TRoleName, TPerm, TSectorName>(
    permissionNames,
    { checkType, returnNullWhenUninitialized: true, includeDetails: false },
  );

  return hasPermission;
}

/**
 * useCanAny Hook
 *
 * Check if user has at least one of the specified permissions.
 *
 * @param permissionNames - Permissions to check
 *
 * @returns boolean or null if not initialized
 *
 * @example
 * const canReadOrWrite = useCanAny(['read', 'write']);
 */
export function useCanAny<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
>(permissionNames: TPerm[]): boolean | null {
  return useHasPermission<TRoleName, TPerm, TSectorName>(
    permissionNames,
    "SOME",
  );
}

/**
 * useCanAll Hook
 *
 * Check if user has all of the specified permissions.
 *
 * @param permissionNames - Permissions to check
 *
 * @returns boolean or null if not initialized
 *
 * @example
 * const canFullAccess = useCanAll(['read', 'write', 'delete']);
 */
export function useCanAll<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
>(permissionNames: TPerm[]): boolean | null {
  return useHasPermission<TRoleName, TPerm, TSectorName>(
    permissionNames,
    "EVERY",
  );
}

/**
 * useIsRestricted Hook
 *
 * Check if a specific permission is restricted.
 *
 * @param permission - Permission to check
 *
 * @returns boolean
 *
 * @example
 * const isDeleteRestricted = useIsRestricted('delete');
 */
export function useIsRestricted<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
>(permission: TPerm): boolean {
  const { rbac } = useRBACContext<TRoleName, TPerm, TSectorName>();

  return useMemo(() => {
    return rbac ? rbac.isPermissionRestricted(permission) : false;
  }, [rbac, permission]);
}
