export const queryKeys = {
  auth: {
    currentUser: () => ["current-user"] as const,
  },

  roles: {
    all: () => ["roles"] as const,
    list: <T extends object>(params?: T) => ["roles", "list", params] as const,
    detail: (id: string) => ["roles", "detail", id] as const,
    pageRights: (roleId: string) => ["roles", "page-rights", roleId] as const,
  },

  users: {
    all: () => ["users"] as const,
    list: <T extends object>(params?: T) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },

  tenants: {
    all: () => ["tenants"] as const,
    list: <T extends object>(params?: T) => ["tenants", "list", params] as const,
    detail: (id: string) => ["tenants", "detail", id] as const,
  },
  branches: {
    all: () => ["branches"] as const,
    list: <T extends object>(params?: T) => ["branches", "list", params] as const,
    detail: (id: string) => ["branches", "detail", id] as const,
  },

  warehouses: {
    all: () => ["warehouses"] as const,
    list: <T extends object>(params?: T) => ["warehouses", "list", params] as const,
    detail: (id: string) => ["warehouses", "detail", id] as const,
  },

  regions: {
    all: () => ["regions"] as const,
    countries: () => ["regions", "countries"] as const,
    states: (countryId?: number) => ["regions", "states", { countryId }] as const,
    cities: (stateId?: number) => ["regions", "cities", { stateId }] as const,
  },
};
