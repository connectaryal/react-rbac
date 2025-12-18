import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { RoleBasedAccessControl } from '../core/rbac';
import { TConfig, TPermission, TRole, TSector } from '../types/permission.types';

/**
 * RBAC Context value type
 */
interface RBACContextValue<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
> {
  rbac: RoleBasedAccessControl<TRoleName, TPerm, TSectorName> | null;
  isInitialized: boolean;
}

/**
 * RBAC Provider props
 */
interface RBACProviderProps<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
> {
  children: ReactNode;
  config?: TConfig<TRoleName, TPerm, TSectorName>;
  rbacInstance?: RoleBasedAccessControl<TRoleName, TPerm, TSectorName>;
}

/**
 * Create RBAC Context
 */
const RBACContext = createContext<RBACContextValue | null>(null);

/**
 * RBACProvider Component
 *
 * Provides RBAC instance to child components via React Context.
 * Can be initialized with either a config object or an existing RBAC instance.
 *
 * @example
 * ```tsx
 * // Option 1: Initialize with config
 * <RBACProvider config={{
 *   roles: ['editor'],
 *   roleDefinitions: {
 *     editor: ['read', 'write']
 *   }
 * }}>
 *   <App />
 * </RBACProvider>
 *
 * // Option 2: Pass existing instance
 * const rbac = new RoleBasedAccessControl({...});
 * <RBACProvider rbacInstance={rbac}>
 *   <App />
 * </RBACProvider>
 * ```
 */
export function RBACProvider<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
>({
  children,
  config,
  rbacInstance,
}: RBACProviderProps<TRoleName, TPerm, TSectorName>) {
  const value = useMemo<RBACContextValue<TRoleName, TPerm, TSectorName>>(() => {
    // If instance is provided, use it
    if (rbacInstance) {
      return {
        rbac: rbacInstance,
        isInitialized: true,
      };
    }

    // If config is provided, create new instance
    if (config) {
      const rbac = new RoleBasedAccessControl<TRoleName, TPerm, TSectorName>(
        config,
      );
      return {
        rbac,
        isInitialized: true,
      };
    }

    // No config or instance provided
    return {
      rbac: null,
      isInitialized: false,
    };
  }, [config, rbacInstance]);

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}

/**
 * Hook to access RBAC context
 *
 * @throws Error if used outside RBACProvider
 *
 * @example
 * ```tsx
 * const { rbac, isInitialized } = useRBACContext();
 *
 * if (!isInitialized) {
 *   return <Loading />;
 * }
 *
 * const canEdit = rbac.can('edit');
 * ```
 */
export function useRBACContext<
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
>(): RBACContextValue<TRoleName, TPerm, TSectorName> {
  const context = useContext(RBACContext);

  if (!context) {
    throw new Error("useRBACContext must be used within an RBACProvider");
  }

  return context as RBACContextValue<TRoleName, TPerm, TSectorName>;
}

/**
 * HOC to wrap component with RBACProvider
 *
 * @example
 * ```tsx
 * const MyComponent = () => <div>Content</div>;
 *
 * export default withRBAC(MyComponent, {
 *   roles: ['editor'],
 *   roleDefinitions: {
 *     editor: ['read', 'write']
 *   }
 * });
 * ```
 */
export function withRBAC<
  P extends object,
  TRoleName extends TRole = TRole,
  TPerm extends TPermission = TPermission,
  TSectorName extends TSector = TSector,
>(
  Component: React.ComponentType<P>,
  config?: TConfig<TRoleName, TPerm, TSectorName>,
) {
  return function WrappedComponent(props: P) {
    return (
      <RBACProvider config={config}>
        <Component {...props} />
      </RBACProvider>
    );
  };
}
