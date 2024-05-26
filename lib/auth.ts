import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Kakao from 'next-auth/providers/kakao';
import { createUser } from './db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, Kakao],
  callbacks: {
    async signIn(params) {
      const { user, account, profile } = params;
      await createUser(user.name!, user.name!, user.image!);
      return true;
    }
  }
});
