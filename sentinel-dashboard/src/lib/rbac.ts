/**
 * Role-Based Access Control (RBAC) System
 * Defines permissions and authorization checks
 */

import type { Role } from "@prisma/client"
import { logger } from "./logger"

export type Permission =
  | "read:logs"
  | "write:logs"
  | "delete:logs"
  | "read:users"
  | "write:users"
  | "delete:users"
  | "admin:all"
  | "moderate:content"

// Role to Permissions mapping
const rolePermissions: Record<Role, Permission[]> = {
  VIEWER: ["read:logs"],
  USER: ["read:logs", "write:logs"],
  MODERATOR: ["read:logs", "write:logs", "delete:logs", "moderate:content"],
  ADMIN: [
    "read:logs",
    "write:logs",
    "delete:logs",
    "read:users",
    "write:users",
    "delete:users",
    "admin:all",
    "moderate:content",
  ],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissions[role] || []
  return permissions.includes(permission) || permissions.includes("admin:all")
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || []
}

/**
 * Require permission - throws if user doesn't have permission
 */
export function requirePermission(role: Role, permission: Permission, userId?: string): void {
  if (!hasPermission(role, permission)) {
    logger.warn("Permission denied", {
      userId,
      role,
      permission,
      action: "requirePermission",
    })
    throw new Error(`Insufficient permissions. Required: ${permission}`)
  }
}

/**
 * Require any of the permissions
 */
export function requireAnyPermission(role: Role, permissions: Permission[], userId?: string): void {
  if (!hasAnyPermission(role, permissions)) {
    logger.warn("Permission denied", {
      userId,
      role,
      permissions,
      action: "requireAnyPermission",
    })
    throw new Error(`Insufficient permissions. Required one of: ${permissions.join(", ")}`)
  }
}

/**
 * Require all permissions
 */
export function requireAllPermissions(role: Role, permissions: Permission[], userId?: string): void {
  if (!hasAllPermissions(role, permissions)) {
    logger.warn("Permission denied", {
      userId,
      role,
      permissions,
      action: "requireAllPermissions",
    })
    throw new Error(`Insufficient permissions. Required all: ${permissions.join(", ")}`)
  }
}

/**
 * Check if role is at least a certain level
 */
export function isRoleAtLeast(userRole: Role, minimumRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    VIEWER: 1,
    USER: 2,
    MODERATOR: 3,
    ADMIN: 4,
  }

  return roleHierarchy[userRole] >= roleHierarchy[minimumRole]
}
