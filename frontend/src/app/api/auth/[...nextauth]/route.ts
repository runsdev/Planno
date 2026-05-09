import { handlers } from "@/auth";

// Force Node.js runtime — PrismaClient cannot run in the Edge runtime
export const runtime = "nodejs";

export const { GET, POST } = handlers;
