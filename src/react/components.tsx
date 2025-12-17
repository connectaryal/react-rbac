import { ReactNode, ReactElement } from "react";
import {
  usePermission,
  useHasPermission,
  PermissionCheckType,
} from "./usePermission";
import { TPermission, TRole, TSector } from "../types/permission.types";

/**
 * Props for PermissionGate component
 */
export interface PermissionGateProps<
  _TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  _TSectorName extends TSector = TSector,
> {
  /**
   * Permission(s) required to render children
   */
  permissions: TPerm | TPerm[];

  /**
   * Check type: 'SOME' (at least one) or 'EVERY' (all)
   * @default 'SOME'
   */
  checkType?: PermissionCheckType;

  /**
   * Content to render when user has permission
   */
  children: ReactNode;

  /**
   * Optional fallback content when permission is denied
   */
  fallback?: ReactNode;

  /**
   * Optional loading content when RBAC is initializing
   */
  loading?: ReactNode;

  /**
   * If true, renders nothing when permission denied (instead of fallback)
   * @default false
   */
  hideOnDenied?: boolean;
}

/**
 * PermissionGate Component
 *
 * Conditionally renders children based on user permissions.
 * Shows fallback or hides content when permission is denied.
 *
 * @example
 * ```tsx
 * <PermissionGate permissions="edit">
 *   <EditButton />
 * </PermissionGate>
 *
 * <PermissionGate
 *   permissions={['create', 'update']}
 *   checkType="EVERY"
 *   fallback={<AccessDenied />}
 * >
 *   <AdminPanel />
 * </PermissionGate>
 * ```
 */
export function PermissionGate<
  _TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  _TSectorName extends TSector = TSector,
>({
  permissions,
  checkType = "SOME",
  children,
  fallback = null,
  loading = null,
  hideOnDenied = false,
}: PermissionGateProps<_TRoleName, TPerm, _TSectorName>): ReactElement | null {
  const { hasPermission, isInitialized } = usePermission<
    _TRoleName,
    TPerm,
    _TSectorName
  >(permissions, { checkType });

  // Show loading state if provided
  if (!isInitialized && loading) {
    return <>{loading}</>;
  }

  // If permission check is still loading (null), show nothing or loading
  if (hasPermission === null) {
    return loading ? <>{loading}</> : null;
  }

  // User has permission - render children
  if (hasPermission) {
    return <>{children}</>;
  }

  // User doesn't have permission
  if (hideOnDenied) {
    return null;
  }

  return <>{fallback}</>;
}

/**
 * Props for RestrictedContent component
 */
export interface RestrictedContentProps<
  _TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  _TSectorName extends TSector = TSector,
> {
  /**
   * Permission(s) that should be DENIED
   */
  restrictedPermissions: TPerm | TPerm[];

  /**
   * Content to render when permission is NOT restricted
   */
  children: ReactNode;

  /**
   * Optional fallback content when permission is restricted
   */
  fallback?: ReactNode;

  /**
   * Custom message to show when restricted
   */
  restrictedMessage?: string;
}

/**
 * RestrictedContent Component
 *
 * Opposite of PermissionGate - renders children when permission is NOT present.
 * Useful for showing content only when certain permissions are denied.
 *
 * @example
 * ```tsx
 * <RestrictedContent restrictedPermissions="admin">
 *   <UpgradePrompt />
 * </RestrictedContent>
 * ```
 */
export function RestrictedContent<
  _TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  _TSectorName extends TSector = TSector,
>({
  restrictedPermissions,
  children,
  fallback = null,
  restrictedMessage,
}: RestrictedContentProps<
  _TRoleName,
  TPerm,
  _TSectorName
>): ReactElement | null {
  const hasPermission = useHasPermission<_TRoleName, TPerm, _TSectorName>(
    restrictedPermissions,
    "SOME",
  );

  // Still loading
  if (hasPermission === null) {
    return null;
  }

  // User DOES have the permission - show fallback or message
  if (hasPermission) {
    if (restrictedMessage) {
      return <div>{restrictedMessage}</div>;
    }
    return <>{fallback}</>;
  }

  // User doesn't have permission - render children
  return <>{children}</>;
}

/**
 * Props for PermissionSwitch component
 */
export interface PermissionSwitchProps<
  _TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  _TSectorName extends TSector = TSector,
> {
  /**
   * Permission(s) to check
   */
  permissions: TPerm | TPerm[];

  /**
   * Check type: 'SOME' or 'EVERY'
   * @default 'SOME'
   */
  checkType?: PermissionCheckType;

  /**
   * Content to render when user HAS permission
   */
  granted: ReactNode;

  /**
   * Content to render when user DOESN'T have permission
   */
  denied: ReactNode;

  /**
   * Optional loading content
   */
  loading?: ReactNode;
}

/**
 * PermissionSwitch Component
 *
 * Renders different content based on permission check result.
 * More explicit than PermissionGate for showing both states.
 *
 * @example
 * ```tsx
 * <PermissionSwitch
 *   permissions="edit"
 *   granted={<EditMode />}
 *   denied={<ViewOnlyMode />}
 * />
 * ```
 */
export function PermissionSwitch<
  _TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  _TSectorName extends TSector = TSector,
>({
  permissions,
  checkType = "SOME",
  granted,
  denied,
  loading = null,
}: PermissionSwitchProps<
  _TRoleName,
  TPerm,
  _TSectorName
>): ReactElement | null {
  const { hasPermission, isInitialized } = usePermission<
    _TRoleName,
    TPerm,
    _TSectorName
  >(permissions, { checkType });

  if (!isInitialized || hasPermission === null) {
    return <>{loading}</>;
  }

  return <>{hasPermission ? granted : denied}</>;
}

/**
 * Props for Can component (alias for PermissionGate)
 */
export type CanProps<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
> = PermissionGateProps<TRoleName, TPerm, TSectorName>;

/**
 * Can Component
 *
 * Shorter alias for PermissionGate.
 * More natural-language API for permission checks.
 *
 * @example
 * ```tsx
 * <Can permissions="edit">
 *   <EditButton />
 * </Can>
 *
 * <Can permissions={['create', 'delete']} checkType="EVERY">
 *   <AdminPanel />
 * </Can>
 * ```
 */
export function Can<
  _TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  _TSectorName extends TSector = TSector,
>(props: CanProps<_TRoleName, TPerm, _TSectorName>): ReactElement | null {
  return <PermissionGate {...props} />;
}

/**
 * Props for Cannot component
 */
export type CannotProps<
  _TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  _TSectorName extends TSector = TSector,
> = Omit<
  RestrictedContentProps<_TRoleName, TPerm, _TSectorName>,
  "restrictedPermissions"
> & {
  permissions: TPerm | TPerm[];
};

/**
 * Cannot Component
 *
 * Renders children when user does NOT have the specified permission.
 * Natural-language opposite of Can component.
 *
 * @example
 * ```tsx
 * <Cannot permissions="admin">
 *   <UpgradeBanner />
 * </Cannot>
 * ```
 */
export function Cannot<
  _TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  _TSectorName extends TSector = TSector,
>({
  permissions,
  children,
  fallback,
  restrictedMessage,
}: CannotProps<_TRoleName, TPerm, _TSectorName>): ReactElement | null {
  return (
    <RestrictedContent
      restrictedPermissions={permissions}
      fallback={fallback}
      restrictedMessage={restrictedMessage}
    >
      {children}
    </RestrictedContent>
  );
}

/**
 * Props for PermissionBoundary component
 */
export interface PermissionBoundaryProps<
  _TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  _TSectorName extends TSector = TSector,
> {
  /**
   * Minimum required permission(s)
   */
  permissions: TPerm | TPerm[];

  /**
   * Check type
   * @default 'SOME'
   */
  checkType?: PermissionCheckType;

  /**
   * Content to render when user has permission
   */
  children: ReactNode;

  /**
   * Content to render when permission denied
   */
  onDenied?: ReactNode;

  /**
   * Content to render when restricted by sector/policy
   */
  onRestricted?: ReactNode;

  /**
   * Content to render during initialization
   */
  onLoading?: ReactNode;

  /**
   * Callback when permission is denied
   */
  onDeniedCallback?: () => void;

  /**
   * Callback when permission is restricted
   */
  onRestrictedCallback?: (reason: "direct" | "sector") => void;
}

/**
 * PermissionBoundary Component
 *
 * Advanced permission gate with support for restriction detection
 * and different fallbacks for denied vs restricted states.
 *
 * @example
 * ```tsx
 * <PermissionBoundary
 *   permissions="delete"
 *   onDenied={<AccessDenied />}
 *   onRestricted={<PolicyRestricted />}
 *   onDeniedCallback={() => trackEvent('access_denied')}
 * >
 *   <DeleteButton />
 * </PermissionBoundary>
 * ```
 */
export function PermissionBoundary<
  _TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  _TSectorName extends TSector = TSector,
>({
  permissions,
  checkType = "SOME",
  children,
  onDenied = null,
  onRestricted = null,
  onLoading = null,
  onDeniedCallback,
  onRestrictedCallback,
}: PermissionBoundaryProps<
  _TRoleName,
  TPerm,
  _TSectorName
>): ReactElement | null {
  const { hasPermission, isInitialized, isRestricted, restrictionReason } =
    usePermission<_TRoleName, TPerm, _TSectorName>(permissions, {
      checkType,
      includeDetails: true,
    });

  // Loading state
  if (!isInitialized || hasPermission === null) {
    return <>{onLoading}</>;
  }

  // Permission granted
  if (hasPermission) {
    return <>{children}</>;
  }

  // Permission restricted
  if (isRestricted && restrictionReason) {
    if (onRestrictedCallback) {
      onRestrictedCallback(restrictionReason);
    }
    return <>{onRestricted || onDenied}</>;
  }

  // Permission denied
  if (onDeniedCallback) {
    onDeniedCallback();
  }
  return <>{onDenied}</>;
}

/**
 * Props for PermissionDebug component
 */
export interface PermissionDebugProps {
  /**
   * If true, shows permission summary
   * @default true
   */
  showSummary?: boolean;

  /**
   * If true, shows as JSON
   * @default false
   */
  json?: boolean;

  /**
   * Title for the debug panel
   * @default "RBAC Debug Info"
   */
  title?: string;
}

/**
 * PermissionDebug Component
 *
 * Development tool to display current permission state.
 * Shows all permissions, roles, restrictions, and sectors.
 *
 * @example
 * ```tsx
 * {process.env.NODE_ENV === 'development' && <PermissionDebug />}
 * ```
 */
export function PermissionDebug({
  showSummary = true,
  json = false,
  title = "RBAC Debug Info",
}: PermissionDebugProps): ReactElement | null {
  const { allPermissions, currentSector, allRestrictions, isInitialized } =
    usePermission([]);

  if (!showSummary) {
    return null;
  }

  const debugInfo = {
    isInitialized,
    permissions: Array.from(allPermissions),
    sector: currentSector,
    restrictions: Array.from(allRestrictions),
  };

  if (json) {
    return (
      <pre
        style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}
      >
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    );
  }

  return (
    <div
      style={{
        border: "2px solid #ff6b6b",
        borderRadius: "8px",
        padding: "1rem",
        margin: "1rem 0",
        background: "#fff5f5",
        fontFamily: "monospace",
      }}
    >
      <h3 style={{ margin: "0 0 1rem 0", color: "#ff6b6b" }}>{title}</h3>
      <div>
        <strong>Initialized:</strong> {isInitialized ? "✅" : "❌"}
      </div>
      <div>
        <strong>Sector:</strong> {currentSector || "None"}
      </div>
      <div>
        <strong>Permissions ({allPermissions.size}):</strong>
        <ul style={{ margin: "0.5rem 0" }}>
          {Array.from(allPermissions).map((perm) => (
            <li key={String(perm)}>{String(perm)}</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Restrictions ({allRestrictions.size}):</strong>
        <ul style={{ margin: "0.5rem 0" }}>
          {Array.from(allRestrictions).map((restriction) => (
            <li key={String(restriction)} style={{ color: "#ff6b6b" }}>
              {String(restriction)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
