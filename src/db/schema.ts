import * as authSchema from "./auth.schema";

// Export all auth schema tables
export const schema = {
    ...authSchema,
} as const;
