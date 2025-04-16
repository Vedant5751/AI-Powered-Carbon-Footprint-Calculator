import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

// Define the properties you expect on your User object, including the ID
interface IUser extends DefaultUser {
  id: string; // Add the 'id' property here
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user?: IUser; // Use the extended User interface
  }

  /** The OAuth profile returned from your provider */
  interface User extends IUser {}
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    id?: string; // Or the property you store the user ID under in the JWT callback
  }
}
