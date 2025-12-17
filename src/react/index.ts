// src/react/index.ts
//
// React integration barrel export for @connectaryal/rbac

// Export provider and context
export { RBACProvider, useRBACContext, withRBAC } from "./RBACProvider";

// Export hooks
export {
  usePermission,
  useHasPermission,
  useCanAny,
  useCanAll,
  useIsRestricted,
} from "./usePermission";

// Export hook types
export type {
  PermissionCheckType,
  UsePermissionOptions,
  UsePermissionResult,
} from "./usePermission";

// Export components
export {
  PermissionGate,
  RestrictedContent,
  PermissionSwitch,
  Can,
  Cannot,
  PermissionBoundary,
  PermissionDebug,
} from "./components";

// Export component prop types
export type {
  PermissionGateProps,
  RestrictedContentProps,
  PermissionSwitchProps,
  CanProps,
  CannotProps,
  PermissionBoundaryProps,
  PermissionDebugProps,
} from "./components";
