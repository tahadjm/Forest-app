declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id */
      id: string
      /** The user's name */
      name: string
      /** The user's email address */
      email: string
      /** The user's role */
      role: string
      /** The user's authentication token */
      token: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    token: string
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's id */
    id: string
    /** The user's name */
    name: string
    /** The user's email address */
    email: string
    /** The user's role */
    role: string
    /** The user's authentication token */
    token: string
  }
}
