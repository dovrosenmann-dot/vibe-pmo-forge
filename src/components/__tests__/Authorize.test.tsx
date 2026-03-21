import { render, screen } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import { Authorize } from '../Authorize';
import * as usePermissionsModule from '@/hooks/usePermissions';
import React from 'react';

// Mock the hook
vi.mock('@/hooks/usePermissions');

test('Authorize renders children when user is Admin', () => {
  vi.spyOn(usePermissionsModule, 'usePermissions').mockReturnValue({
    isLoading: false,
    roles: ['admin'],
    isAdmin: true,
    canManageSuppliers: true,
    canManageFinancials: true,
    canEditProjects: true,
    canManageRoles: true,
    isReadOnly: false,
    hasRole: () => true,
  });

  render(
    <Authorize roles={['project_manager']}>
      <div data-testid="protected-content">Secret Content</div>
    </Authorize>
  );

  expect(screen.getByTestId('protected-content')).toBeInTheDocument();
});

test('Authorize blocks children and shows fallback when user lacks roles', () => {
  vi.spyOn(usePermissionsModule, 'usePermissions').mockReturnValue({
    isLoading: false,
    roles: ['viewer'],
    isAdmin: false,
    canManageSuppliers: false,
    canManageFinancials: false,
    canEditProjects: false,
    canManageRoles: false,
    isReadOnly: true,
    hasRole: () => false,
  });

  render(
    <Authorize roles={['pmo']} fallback={<div data-testid="fallback">Access Denied</div>}>
      <div data-testid="protected-content">Secret Content</div>
    </Authorize>
  );

  expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  expect(screen.getByTestId('fallback')).toBeInTheDocument();
});
