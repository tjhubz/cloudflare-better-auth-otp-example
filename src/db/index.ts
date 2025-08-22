import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./schema";

export async function getDb() {
    // Retrieves Cloudflare-specific context, including environment variables and bindings
    const { env } = await getCloudflareContext({ async: true });

    // Initialize Drizzle with your Hyperdrive binding for PostgreSQL
    return drizzle(postgres(env.HYPERDRIVE.connectionString), {
        // Ensure "HYPERDRIVE" matches your Hyperdrive binding name in wrangler.toml
        schema,
        logger: true, // Optional
    });
}

// Re-export the drizzle-orm types and utilities from here for convenience
export * from "drizzle-orm";

// Re-export the feature schemas for use in other files
export * from "@/db/auth.schema";
export * from "./schema";
