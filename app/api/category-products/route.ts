import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth/auth-options";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Step 1: Get token - try multiple methods
        let token: string | null = null;

        // Method 1: Authorization header from client
        const authHeader = request.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).replace(/['"]/g, "").trim();
            console.log("[category-products] Token from Auth header:", token ? "found" : "missing");
        }

        // Method 2: NextAuth JWT from cookie (most reliable on Vercel)
        if (!token) {
            try {
                const jwtToken = await getToken({
                    req: request,
                    secret: process.env.NEXTAUTH_SECRET,
                });
                token = (jwtToken as any)?.accessToken || null;
                console.log("[category-products] Token from JWT cookie:", token ? "found" : "missing");
            } catch (e) {
                console.error("[category-products] JWT token error:", e);
            }
        }

        // Method 3: getServerSession fallback
        if (!token) {
            try {
                const session: any = await getServerSession(authOptions);
                token = session?.accessToken || null;
                console.log("[category-products] Token from getServerSession:", token ? "found" : "missing");
            } catch (e) {
                console.error("[category-products] getServerSession error:", e);
            }
        }

        if (!token || token === "null" || token === "undefined") {
            console.error("[category-products] No valid token found. Auth header:", !!authHeader);
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Step 2: Handle search parameters
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId") || "5";
        const page = searchParams.get("page") || "1";
        const pageSize = searchParams.get("pageSize") || "20";

        // Step 3: Construct Magento URL manually (not via URLSearchParams)
        // so that commas in multi-value filters stay unencoded.
        const queryParts: string[] = [
            `categoryId=${encodeURIComponent(categoryId)}`,
            `searchCriteria[currentPage]=${encodeURIComponent(page)}`,
            `searchCriteria[pageSize]=${encodeURIComponent(pageSize)}`,
        ];

        // Same filter = OR (repeated params); different filters = AND.
        // Magento/KleverAPI expects repeated params for OR: itemCode=2709&itemCode=2602
        const reservedKeys = new Set(["categoryId", "page", "pageSize"]);
        const uniqueKeys = Array.from(new Set(Array.from(searchParams.keys())));

        uniqueKeys.forEach((key) => {
            if (reservedKeys.has(key)) return;
            const rawValues = searchParams.getAll(key);
            const values = rawValues
                .flatMap((v) => v.split(",").map((s) => s.trim()).filter(Boolean))
                .filter((v, i, arr) => arr.indexOf(v) === i);
            values.forEach((value) => {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            });
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const magentoUrlStr = `${baseUrl}/category-products?${queryParts.join("&")}`;
        console.log("[category-products] Magento URL:", magentoUrlStr);
        console.log("[category-products] Base URL env:", baseUrl ? "set" : "MISSING!");

        const res = await fetch(magentoUrlStr, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error("Magento category-products error:", res.status, errBody);
            return Response.json(
                { error: "Magento API error", details: errBody },
                { status: res.status }
            );
        }

        const data = await res.json();
        // DEBUG: Log first product's full structure to identify stock fields
        const items = data.products || data.items || [];
        if (items.length > 0) {
            console.log("=== FIRST PRODUCT ALL FIELDS ===");
            console.log(JSON.stringify(items[0], null, 2));
            console.log("=== FIELD NAMES ===", Object.keys(items[0]));
        }
        return Response.json(data);

    } catch (error: any) {
        console.error("category-products route error:", error.message);
        return Response.json(
            { error: "Failed to fetch products", message: error.message },
            { status: 500 }
        );
    }
}
