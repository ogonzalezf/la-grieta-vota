import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleWeight: number;
      roleName: string;
    } & DefaultSession["user"];
  }

  interface User {
    roleId?: number | null;
  }
}
