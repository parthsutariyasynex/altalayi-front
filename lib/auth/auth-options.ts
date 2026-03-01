import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Magento",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    // Call Magento direct token endpoint from env
                    const magentoUrl = process.env.MAGENTO_AUTH_TOKEN_URL;
                    if (!magentoUrl) {
                        console.error("MAGENTO_AUTH_TOKEN_URL is not defined in .env");
                        return null;
                    }

                    console.log("Calling Magento Auth:", magentoUrl);
                    const res = await fetch(magentoUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            username: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    // Magento returns the token as a JSON string (e.g., "abcdef...")
                    const data = await res.json();
                    console.log("Magento Response:", data);

                    if (res.ok && data) {
                        return {
                            id: credentials.email,
                            email: credentials.email,
                            name: credentials.email,
                            token: data,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth Error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            console.log("JWT callback - user:", user);
            if (user) {
                token.accessToken = (user as any).token;
            }
            console.log("JWT callback - final token:", token);
            return token;
        },
        async session({ session, token }) {
            console.log("Session callback - token:", token);
            (session as any).accessToken = token.accessToken;
            console.log("Session callback - final session:", session);
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "yoursecret",
};
