export const queryKeys = {
  auth: {
    currentUser: () => ["current-user"] as const,
  },

  roles: {
    all: () => ["roles"] as const,
    list: <T extends object>(params?: T) => ["roles", "list", params] as const,
    detail: (id: string) => ["roles", "detail", id] as const,
  },

  users: {
    all: () => ["users"] as const,
    list: <T extends object>(params?: T) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
};
