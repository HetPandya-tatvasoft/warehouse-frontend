export const MESSAGES = {
  COMMON: {
    UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
    SOMETHING_WENT_WRONG: "Something went wrong, please try again",
  },
  AUTH: {
    SIGNIN_FAILED: "Failed to sign in",
  },
  TENANTS: {
    ONBOARD_FAILED: "Failed to onboard tenant",
    PASSWORD_COPIED: "Password copied to clipboard!",
    PASSWORD_COPY_FAILED: "Failed to copy password",
    LOAD_FAILED: "Failed to fetch tenants list",
    LOAD_UNEXPECTED: "An unexpected error occurred while loading tenants",
  },
  USERS: {
    LOAD_FAILED: "Failed to fetch users",
    LOAD_UNEXPECTED: "An unexpected error occurred while loading users",
    CREATE_SUCCESS: "User created successfully! Login credentials have been sent to their email.",
    UPDATE_SUCCESS: "User updated successfully",
    UPDATE_FAILED: "Failed to update user",
    CREATE_FAILED: "Failed to create user",
    STATUS_UPDATE_FAILED: "Failed to update user status",
    STATUS_ACTIVATED: "User account activated successfully",
    STATUS_DEACTIVATED: "User account deactivated successfully",
  },
  ROLES: {
    LOAD_FAILED: "Failed to fetch roles",
    LOAD_UNEXPECTED: "An unexpected error occurred while loading roles",
    DELETE_FAILED: "Failed to delete role",
    DELETE_FAILED_UNEXPECTED: "Something went wrong, failed to delete role",
    PERMISSIONS_UPDATE_SUCCESS: "Role permissions updated successfully",
    PERMISSIONS_UPDATE_FAILED: "Failed to update role permissions",
    CREATE_SUCCESS: "Role created successfully",
    UPDATE_SUCCESS: "Role updated successfully",
    CREATE_FAILED: "Failed to create role",
    UPDATE_FAILED: "Failed to update role",
  },
} as const;
