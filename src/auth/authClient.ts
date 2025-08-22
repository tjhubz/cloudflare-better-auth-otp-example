import { cloudflareClient } from "better-auth-cloudflare/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const client = createAuthClient({
    plugins: [cloudflareClient(), emailOTPClient()],
});

export default client;
