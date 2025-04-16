// src/lib/auth.ts
// This file re-exports the authOptions to make them accessible from both
// the /pages and /app directories

// Import the authOptions from your NextAuth config
import { authOptions as nextAuthOptions } from "@/pages/api/auth/[...nextauth]";

// Re-export for use in App Router API routes
export const authOptions = nextAuthOptions; 