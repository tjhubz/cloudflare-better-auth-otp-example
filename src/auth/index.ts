import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, emailOTP } from "better-auth/plugins";
import { getDb, schema } from "../db";

// Define an asynchronous function to build your auth configuration
async function authBuilder() {
    const dbInstance = await getDb();
    return betterAuth(
        withCloudflare(
            {
                autoDetectIpAddress: true,
                geolocationTracking: true,
                cf: getCloudflareContext().cf,
                postgres: {
                    db: dbInstance,
                },
            },
            // Your core Better Auth configuration (see Better Auth docs for all options)
            {
                database: drizzleAdapter(dbInstance, {
                    provider: "pg",
                    schema,
                }),
                trustedOrigins: [
                    "http://localhost:*", // Allow all localhost ports
                    "https://localhost:*", // Allow HTTPS localhost
                ],
                rateLimit: {
                    enabled: true,
                    // ... other rate limiting options
                },
                plugins: [
                    openAPI(), 
                    emailOTP({
                        async sendVerificationOTP({ email, otp, type }) {
                            // In development, log the OTP to console
                            console.log(`Email OTP for ${email}: ${otp} (type: ${type})`);
                            // In production, you would send an actual email here
                            // using a service like SendGrid, Resend, etc.
                        },
                    })
                ],
                // ... other Better Auth options
            }
        )
    );
}

// Singleton pattern to ensure a single auth instance
let authInstance: Awaited<ReturnType<typeof authBuilder>> | null = null;

// Asynchronously initializes and retrieves the shared auth instance
export async function initAuth() {
    if (!authInstance) {
        authInstance = await authBuilder();
    }
    return authInstance;
}

/* ======================================================================= */
/* Configuration for Schema Generation                                     */
/* ======================================================================= */

// This simplified configuration is used by the Better Auth CLI for schema generation.
// It includes only the options that affect the database schema.
// It's necessary because the main `authBuilder` performs operations (like `getDb()`)
// which use `getCloudflareContext` (not available in a CLI context only on Cloudflare).
// For more details, see: https://www.answeroverflow.com/m/1362463260636479488
export const auth = betterAuth({
    ...withCloudflare(
        {
            autoDetectIpAddress: true,
            geolocationTracking: true,
            cf: {},
            // No actual database or KV instance is needed here, only schema-affecting options
        },
        {
            // Include only configurations that influence the Drizzle schema,
            // e.g., if certain features add tables or columns.
            // socialProviders: { /* ... */ } // If they add specific tables/columns
            trustedOrigins: [
                "http://localhost:*", // Allow all localhost ports
                "https://localhost:*", // Allow HTTPS localhost
            ],
            plugins: [
                openAPI(), 
                emailOTP({
                    async sendVerificationOTP({ email, otp, type }) {
                        // CLI context - email sending not available
                        console.log(`Email OTP: ${otp}`);
                    },
                })
            ],
        }
    ),

    // Used by the Better Auth CLI for schema generation.
    database: drizzleAdapter({} as any, {
        provider: "pg",
        usePlural: false,
        debugLogs: true,
    }),
});
