export interface CloudflareBindings {
    HYPERDRIVE: any;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends CloudflareBindings {
            // Additional environment variables can be added here
        }
    }
}
