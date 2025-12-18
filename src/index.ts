// src/index.ts
//
// Main barrel export file for @connectaryal/rbac

// Export the main RBAC class
export { RoleBasedAccessControl } from "./core/rbac";

// Export all type definitions
export type {
  TPermission,
  TRole,
  TSector,
  TPermissionSet,
  TRoleSet,
  TRoleDefinitions,
  TSectorRestrictions,
  TConfig,
  TConfigWithRoleDefinitions,
  TConfigWithoutRoleDefinitions,
} from "./types/permission.types";

// Export React integration (hooks, components, provider)
export {
  // Provider and context
  RBACProvider,
  useRBACContext,
  withRBAC,

  // Hooks
  usePermission,
  useHasPermission,
  useCanAny,
  useCanAll,
  useIsRestricted,

  // Components
  PermissionGate,
  RestrictedContent,
  PermissionSwitch,
  Can,
  Cannot,
  PermissionBoundary,
  PermissionDebug,
} from "./react";

// Export React types
export type {
  PermissionCheckType,
  UsePermissionOptions,
  UsePermissionResult,
  PermissionGateProps,
  RestrictedContentProps,
  PermissionSwitchProps,
  CanProps,
  CannotProps,
  PermissionBoundaryProps,
  PermissionDebugProps,
} from "./react";
