import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  PermissionGate,
  RestrictedContent,
  PermissionSwitch,
  Can,
  Cannot,
  PermissionBoundary,
  PermissionDebug,
} from '../../src/react/components';
import { RBACProvider } from '../../src/react/RBACProvider';

describe('PermissionGate', () => {
  describe('Basic Rendering', () => {
    it('should render children when permission is granted', () => {
      render(
        <RBACProvider config={{ permissions: ['read'] }}>
          <PermissionGate permissions="read">
            <div>Authorized Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.getByText('Authorized Content')).toBeInTheDocument();
    });

    it('should not render children when permission is denied', () => {
      render(
        <RBACProvider config={{ permissions: ['read'] }}>
          <PermissionGate permissions="write">
            <div>Authorized Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.queryByText('Authorized Content')).not.toBeInTheDocument();
    });

    it('should render fallback when permission is denied', () => {
      render(
        <RBACProvider config={{ permissions: ['read'] }}>
          <PermissionGate permissions="write" fallback={<div>Access Denied</div>}>
            <div>Authorized Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Authorized Content')).not.toBeInTheDocument();
    });

    it('should render loading when not initialized', () => {
      render(
        <RBACProvider>
          <PermissionGate permissions="read" loading={<div>Loading...</div>}>
            <div>Authorized Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should hide content when hideOnDenied is true', () => {
      render(
        <RBACProvider config={{ permissions: ['read'] }}>
          <PermissionGate
            permissions="write"
            fallback={<div>Fallback</div>}
            hideOnDenied
          >
            <div>Authorized Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.queryByText('Authorized Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Fallback')).not.toBeInTheDocument();
    });
  });

  describe('Check Types', () => {
    it('should use SOME check type by default', () => {
      render(
        <RBACProvider config={{ permissions: ['read'] }}>
          <PermissionGate permissions={['read', 'write']}>
            <div>Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should use SOME check type explicitly', () => {
      render(
        <RBACProvider config={{ permissions: ['write'] }}>
          <PermissionGate permissions={['read', 'write']} checkType="SOME">
            <div>Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should use EVERY check type', () => {
      render(
        <RBACProvider config={{ permissions: ['read', 'write'] }}>
          <PermissionGate permissions={['read', 'write']} checkType="EVERY">
            <div>Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should fail EVERY check when missing permission', () => {
      render(
        <RBACProvider config={{ permissions: ['read'] }}>
          <PermissionGate permissions={['read', 'write']} checkType="EVERY">
            <div>Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Permissions', () => {
    it('should work with role-based permissions', () => {
      render(
        <RBACProvider
          config={{
            roles: ['editor'],
            roleDefinitions: {
              editor: ['read', 'write'],
            },
          }}
        >
          <PermissionGate permissions="write">
            <div>Editor Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.getByText('Editor Content')).toBeInTheDocument();
    });
  });

  describe('Restrictions', () => {
    it('should deny restricted permissions', () => {
      render(
        <RBACProvider
          config={{
            permissions: ['read', 'delete'],
            restrictions: ['delete'],
          }}
        >
          <PermissionGate permissions="delete">
            <div>Delete Button</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.queryByText('Delete Button')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should render null when not initialized and no loading prop', () => {
      const { container } = render(
        <RBACProvider>
          <PermissionGate permissions="read">
            <div>Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(container.querySelector('div')).toBeNull();
    });

    it('should render loading when initialized but permission check is loading', () => {
      render(
        <RBACProvider>
          <PermissionGate permissions="read" loading={<div>Loading...</div>}>
            <div>Content</div>
          </PermissionGate>
        </RBACProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});

describe('RestrictedContent', () => {
  it('should render children when permission is NOT present', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <RestrictedContent restrictedPermissions="admin">
          <div>Upgrade Banner</div>
        </RestrictedContent>
      </RBACProvider>
    );

    expect(screen.getByText('Upgrade Banner')).toBeInTheDocument();
  });

  it('should not render children when permission IS present', () => {
    render(
      <RBACProvider config={{ permissions: ['admin'] }}>
        <RestrictedContent restrictedPermissions="admin">
          <div>Upgrade Banner</div>
        </RestrictedContent>
      </RBACProvider>
    );

    expect(screen.queryByText('Upgrade Banner')).not.toBeInTheDocument();
  });

  it('should render fallback when permission is present', () => {
    render(
      <RBACProvider config={{ permissions: ['admin'] }}>
        <RestrictedContent
          restrictedPermissions="admin"
          fallback={<div>Already Admin</div>}
        >
          <div>Upgrade Banner</div>
        </RestrictedContent>
      </RBACProvider>
    );

    expect(screen.getByText('Already Admin')).toBeInTheDocument();
    expect(screen.queryByText('Upgrade Banner')).not.toBeInTheDocument();
  });

  it('should render restrictedMessage when permission is present', () => {
    render(
      <RBACProvider config={{ permissions: ['admin'] }}>
        <RestrictedContent
          restrictedPermissions="admin"
          restrictedMessage="You already have admin access"
        >
          <div>Upgrade Banner</div>
        </RestrictedContent>
      </RBACProvider>
    );

    expect(screen.getByText('You already have admin access')).toBeInTheDocument();
    expect(screen.queryByText('Upgrade Banner')).not.toBeInTheDocument();
  });

  it('should prioritize restrictedMessage over fallback', () => {
    render(
      <RBACProvider config={{ permissions: ['admin'] }}>
        <RestrictedContent
          restrictedPermissions="admin"
          restrictedMessage="Message"
          fallback={<div>Fallback</div>}
        >
          <div>Upgrade Banner</div>
        </RestrictedContent>
      </RBACProvider>
    );

    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.queryByText('Fallback')).not.toBeInTheDocument();
  });

  it('should render null when not initialized', () => {
    const { container } = render(
      <RBACProvider>
        <RestrictedContent restrictedPermissions="admin">
          <div>Upgrade Banner</div>
        </RestrictedContent>
      </RBACProvider>
    );

    expect(container.querySelector('div')).toBeNull();
  });

  it('should work with multiple permissions (SOME logic)', () => {
    render(
      <RBACProvider config={{ permissions: ['admin'] }}>
        <RestrictedContent restrictedPermissions={['admin', 'superuser']}>
          <div>Upgrade Banner</div>
        </RestrictedContent>
      </RBACProvider>
    );

    expect(screen.queryByText('Upgrade Banner')).not.toBeInTheDocument();
  });

  it('should show content when none of the permissions match', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <RestrictedContent restrictedPermissions={['admin', 'superuser']}>
          <div>Upgrade Banner</div>
        </RestrictedContent>
      </RBACProvider>
    );

    expect(screen.getByText('Upgrade Banner')).toBeInTheDocument();
  });
});

describe('PermissionSwitch', () => {
  it('should render granted content when permission exists', () => {
    render(
      <RBACProvider config={{ permissions: ['edit'] }}>
        <PermissionSwitch
          permissions="edit"
          granted={<div>Edit Mode</div>}
          denied={<div>View Only</div>}
        />
      </RBACProvider>
    );

    expect(screen.getByText('Edit Mode')).toBeInTheDocument();
    expect(screen.queryByText('View Only')).not.toBeInTheDocument();
  });

  it('should render denied content when permission is missing', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <PermissionSwitch
          permissions="edit"
          granted={<div>Edit Mode</div>}
          denied={<div>View Only</div>}
        />
      </RBACProvider>
    );

    expect(screen.getByText('View Only')).toBeInTheDocument();
    expect(screen.queryByText('Edit Mode')).not.toBeInTheDocument();
  });

  it('should render loading when not initialized', () => {
    render(
      <RBACProvider>
        <PermissionSwitch
          permissions="edit"
          granted={<div>Edit Mode</div>}
          denied={<div>View Only</div>}
          loading={<div>Loading...</div>}
        />
      </RBACProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should use SOME check type by default', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <PermissionSwitch
          permissions={['read', 'write']}
          granted={<div>Granted</div>}
          denied={<div>Denied</div>}
        />
      </RBACProvider>
    );

    expect(screen.getByText('Granted')).toBeInTheDocument();
  });

  it('should use EVERY check type', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <PermissionSwitch
          permissions={['read', 'write']}
          checkType="EVERY"
          granted={<div>Granted</div>}
          denied={<div>Denied</div>}
        />
      </RBACProvider>
    );

    expect(screen.getByText('Denied')).toBeInTheDocument();
  });

  it('should render null loading by default when not initialized', () => {
    const { container } = render(
      <RBACProvider>
        <PermissionSwitch
          permissions="edit"
          granted={<div>Edit Mode</div>}
          denied={<div>View Only</div>}
        />
      </RBACProvider>
    );

    expect(container.querySelector('div')).toBeNull();
  });
});

describe('Can', () => {
  it('should be an alias for PermissionGate', () => {
    render(
      <RBACProvider config={{ permissions: ['edit'] }}>
        <Can permissions="edit">
          <div>Can Edit</div>
        </Can>
      </RBACProvider>
    );

    expect(screen.getByText('Can Edit')).toBeInTheDocument();
  });

  it('should support all PermissionGate props', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <Can
          permissions="write"
          fallback={<div>Cannot Write</div>}
          hideOnDenied={false}
        >
          <div>Can Write</div>
        </Can>
      </RBACProvider>
    );

    expect(screen.getByText('Cannot Write')).toBeInTheDocument();
  });

  it('should work with checkType', () => {
    render(
      <RBACProvider config={{ permissions: ['read', 'write'] }}>
        <Can permissions={['read', 'write']} checkType="EVERY">
          <div>All Permissions</div>
        </Can>
      </RBACProvider>
    );

    expect(screen.getByText('All Permissions')).toBeInTheDocument();
  });
});

describe('Cannot', () => {
  it('should render children when permission is NOT present', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <Cannot permissions="admin">
          <div>Not Admin</div>
        </Cannot>
      </RBACProvider>
    );

    expect(screen.getByText('Not Admin')).toBeInTheDocument();
  });

  it('should not render children when permission IS present', () => {
    render(
      <RBACProvider config={{ permissions: ['admin'] }}>
        <Cannot permissions="admin">
          <div>Not Admin</div>
        </Cannot>
      </RBACProvider>
    );

    expect(screen.queryByText('Not Admin')).not.toBeInTheDocument();
  });

  it('should support fallback', () => {
    render(
      <RBACProvider config={{ permissions: ['admin'] }}>
        <Cannot permissions="admin" fallback={<div>Is Admin</div>}>
          <div>Not Admin</div>
        </Cannot>
      </RBACProvider>
    );

    expect(screen.getByText('Is Admin')).toBeInTheDocument();
  });

  it('should support restrictedMessage', () => {
    render(
      <RBACProvider config={{ permissions: ['admin'] }}>
        <Cannot permissions="admin" restrictedMessage="You are admin">
          <div>Not Admin</div>
        </Cannot>
      </RBACProvider>
    );

    expect(screen.getByText('You are admin')).toBeInTheDocument();
  });

  it('should work with multiple permissions', () => {
    render(
      <RBACProvider config={{ permissions: ['admin'] }}>
        <Cannot permissions={['admin', 'superuser']}>
          <div>Regular User</div>
        </Cannot>
      </RBACProvider>
    );

    expect(screen.queryByText('Regular User')).not.toBeInTheDocument();
  });
});

describe('PermissionBoundary', () => {
  it('should render children when permission is granted', () => {
    render(
      <RBACProvider config={{ permissions: ['delete'] }}>
        <PermissionBoundary permissions="delete">
          <div>Delete Button</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(screen.getByText('Delete Button')).toBeInTheDocument();
  });

  it('should render onDenied when permission is missing', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <PermissionBoundary
          permissions="delete"
          onDenied={<div>Access Denied</div>}
        >
          <div>Delete Button</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Delete Button')).not.toBeInTheDocument();
  });

  it('should render onRestricted when permission is restricted', () => {
    render(
      <RBACProvider
        config={{
          permissions: ['delete'],
          restrictions: ['delete'],
        }}
      >
        <PermissionBoundary
          permissions="delete"
          onDenied={<div>Access Denied</div>}
          onRestricted={<div>Policy Restricted</div>}
        >
          <div>Delete Button</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(screen.getByText('Policy Restricted')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('should fallback to onDenied when no onRestricted provided', () => {
    render(
      <RBACProvider
        config={{
          permissions: ['delete'],
          restrictions: ['delete'],
        }}
      >
        <PermissionBoundary permissions="delete" onDenied={<div>Denied</div>}>
          <div>Delete Button</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(screen.getByText('Denied')).toBeInTheDocument();
  });

  it('should render onLoading when not initialized', () => {
    render(
      <RBACProvider>
        <PermissionBoundary permissions="delete" onLoading={<div>Loading...</div>}>
          <div>Delete Button</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should call onDeniedCallback when permission is denied', () => {
    const callback = jest.fn();

    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <PermissionBoundary permissions="delete" onDeniedCallback={callback}>
          <div>Delete Button</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(callback).toHaveBeenCalled();
  });

  it('should call onRestrictedCallback when permission is restricted', () => {
    const callback = jest.fn();

    render(
      <RBACProvider
        config={{
          permissions: ['delete'],
          restrictions: ['delete'],
        }}
      >
        <PermissionBoundary permissions="delete" onRestrictedCallback={callback}>
          <div>Delete Button</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(callback).toHaveBeenCalledWith('direct');
  });

  it('should call onRestrictedCallback with sector reason', () => {
    const callback = jest.fn();

    render(
      <RBACProvider
        config={{
          permissions: ['delete'],
          sector: 'finance',
          sectorRestrictions: {
            finance: ['delete'],
          },
        }}
      >
        <PermissionBoundary permissions="delete" onRestrictedCallback={callback}>
          <div>Delete Button</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(callback).toHaveBeenCalledWith('sector');
  });

  it('should not call callbacks when permission is granted', () => {
    const deniedCallback = jest.fn();
    const restrictedCallback = jest.fn();

    render(
      <RBACProvider config={{ permissions: ['delete'] }}>
        <PermissionBoundary
          permissions="delete"
          onDeniedCallback={deniedCallback}
          onRestrictedCallback={restrictedCallback}
        >
          <div>Delete Button</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(deniedCallback).not.toHaveBeenCalled();
    expect(restrictedCallback).not.toHaveBeenCalled();
  });

  it('should use SOME check type by default', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <PermissionBoundary permissions={['read', 'write']}>
          <div>Content</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should use EVERY check type', () => {
    render(
      <RBACProvider config={{ permissions: ['read', 'write'] }}>
        <PermissionBoundary permissions={['read', 'write']} checkType="EVERY">
          <div>Content</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('PermissionDebug', () => {
  it('should render debug information', () => {
    render(
      <RBACProvider
        config={{
          permissions: ['read', 'write'],
          sector: 'finance',
          restrictions: ['delete'],
        }}
      >
        <PermissionDebug />
      </RBACProvider>
    );

    expect(screen.getByText('RBAC Debug Info')).toBeInTheDocument();
    expect(screen.getByText('read')).toBeInTheDocument();
    expect(screen.getByText('write')).toBeInTheDocument();
    expect(screen.getByText('delete')).toBeInTheDocument();
  });

  it('should show custom title', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <PermissionDebug title="My Debug Panel" />
      </RBACProvider>
    );

    expect(screen.getByText('My Debug Panel')).toBeInTheDocument();
  });

  it('should render as JSON when json prop is true', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <PermissionDebug json />
      </RBACProvider>
    );

    const preElement = screen.getByText(/"permissions":/);
    expect(preElement.tagName).toBe('PRE');
  });

  it('should not render when showSummary is false', () => {
    const { container } = render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <PermissionDebug showSummary={false} />
      </RBACProvider>
    );

    expect(container.querySelector('div')).toBeNull();
  });

  it('should show initialization status', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <PermissionDebug />
      </RBACProvider>
    );

    expect(screen.getByText(/Initialized:/)).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('should show not initialized status', () => {
    render(
      <RBACProvider>
        <PermissionDebug />
      </RBACProvider>
    );

    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('should show sector information', () => {
    render(
      <RBACProvider
        config={{
          permissions: ['read'],
          sector: 'finance',
        }}
      >
        <PermissionDebug />
      </RBACProvider>
    );

    expect(screen.getByText(/Sector:/)).toBeInTheDocument();
    expect(screen.getByText('finance')).toBeInTheDocument();
  });

  it('should show "None" when no sector', () => {
    render(
      <RBACProvider config={{ permissions: ['read'] }}>
        <PermissionDebug />
      </RBACProvider>
    );

    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('should show permissions count', () => {
    render(
      <RBACProvider config={{ permissions: ['read', 'write', 'delete'] }}>
        <PermissionDebug />
      </RBACProvider>
    );

    expect(screen.getByText(/Permissions \(3\):/)).toBeInTheDocument();
  });

  it('should show restrictions count', () => {
    render(
      <RBACProvider
        config={{
          permissions: ['read'],
          restrictions: ['delete', 'admin'],
        }}
      >
        <PermissionDebug />
      </RBACProvider>
    );

    expect(screen.getByText(/Restrictions \(2\):/)).toBeInTheDocument();
  });

  it('should render JSON with correct structure', () => {
    render(
      <RBACProvider
        config={{
          permissions: ['read'],
          sector: 'finance',
          restrictions: ['delete'],
        }}
      >
        <PermissionDebug json />
      </RBACProvider>
    );

    const debugInfo = JSON.parse(screen.getByText(/"isInitialized"/).textContent || '{}');
    expect(debugInfo).toHaveProperty('isInitialized');
    expect(debugInfo).toHaveProperty('permissions');
    expect(debugInfo).toHaveProperty('sector');
    expect(debugInfo).toHaveProperty('restrictions');
  });
});

describe('Complex Integration Scenarios', () => {
  it('should handle nested permission components', () => {
    render(
      <RBACProvider
        config={{
          permissions: ['read', 'write'],
        }}
      >
        <Can permissions="read">
          <div>
            <span>Can Read</span>
            <Can permissions="write">
              <span>Can Write</span>
            </Can>
            <Can permissions="delete">
              <span>Can Delete</span>
            </Can>
          </div>
        </Can>
      </RBACProvider>
    );

    expect(screen.getByText('Can Read')).toBeInTheDocument();
    expect(screen.getByText('Can Write')).toBeInTheDocument();
    expect(screen.queryByText('Can Delete')).not.toBeInTheDocument();
  });

  it('should work with mixed component types', () => {
    render(
      <RBACProvider
        config={{
          permissions: ['read', 'write'],
        }}
      >
        <Can permissions="read">
          <div>Read Access</div>
        </Can>
        <Cannot permissions="admin">
          <div>Not Admin</div>
        </Cannot>
        <PermissionSwitch
          permissions="write"
          granted={<div>Can Write</div>}
          denied={<div>Cannot Write</div>}
        />
      </RBACProvider>
    );

    expect(screen.getByText('Read Access')).toBeInTheDocument();
    expect(screen.getByText('Not Admin')).toBeInTheDocument();
    expect(screen.getByText('Can Write')).toBeInTheDocument();
  });

  it('should handle role-based permissions across components', () => {
    render(
      <RBACProvider
        config={{
          roles: ['editor'],
          roleDefinitions: {
            editor: ['read', 'write', 'update'],
          },
        }}
      >
        <Can permissions="read">
          <div>Editor: Read</div>
        </Can>
        <Can permissions="write">
          <div>Editor: Write</div>
        </Can>
        <Can permissions="delete">
          <div>Editor: Delete</div>
        </Can>
      </RBACProvider>
    );

    expect(screen.getByText('Editor: Read')).toBeInTheDocument();
    expect(screen.getByText('Editor: Write')).toBeInTheDocument();
    expect(screen.queryByText('Editor: Delete')).not.toBeInTheDocument();
  });

  it('should handle restrictions across components', () => {
    render(
      <RBACProvider
        config={{
          permissions: ['read', 'write', 'delete'],
          restrictions: ['delete'],
        }}
      >
        <Can permissions="read">
          <div>Can Read</div>
        </Can>
        <Can permissions="delete">
          <div>Can Delete</div>
        </Can>
        <PermissionBoundary
          permissions="delete"
          onRestricted={<div>Delete Restricted</div>}
        >
          <div>Delete Button</div>
        </PermissionBoundary>
      </RBACProvider>
    );

    expect(screen.getByText('Can Read')).toBeInTheDocument();
    expect(screen.queryByText('Can Delete')).not.toBeInTheDocument();
    expect(screen.getByText('Delete Restricted')).toBeInTheDocument();
  });
});
