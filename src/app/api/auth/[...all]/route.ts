import { getAuthForRequest } from "@/auth";

// Build this route for the Node.js runtime to allow 'postgres' and other Node APIs under Cloudflare's nodejs_compat.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
    const auth = await getAuthForRequest();
    return auth.handler(req);
}

export async function GET(req: Request) {
    const auth = await getAuthForRequest();
    return auth.handler(req);
}
