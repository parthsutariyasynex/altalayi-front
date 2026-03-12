import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Step 1: Get token from header or session
        let token: string | null = null;
        const authHeader = request.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).replace(/['"]/g, "").trim();
        }

        if (!token) {
            const session: any = await getServerSession(authOptions);
            token = session?.accessToken;
        }

        if (!token || token === "null" || token === "undefined") {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Step 2: Handle search parameters
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId") || "5";
        const page = searchParams.get("page") || "1";
        const pageSize = searchParams.get("pageSize") || "20";

        // Step 3: Construct Magento URL
        // Example: /rest/V1/kleverapi/category-products?categoryId=5&searchCriteria[currentPage]=1&searchCriteria[pageSize]=20&brand=29
        const magentoUrl = new URL(
            "https://altalayi-demo.btire.com/rest/V1/kleverapi/category-products"
        );

        magentoUrl.searchParams.set("categoryId", categoryId);
        magentoUrl.searchParams.set("searchCriteria[currentPage]", page);
        magentoUrl.searchParams.set("searchCriteria[pageSize]", pageSize);

        // Forward dynamic filters as top-level params (as per customer KleverAPI pattern)
        // Correctly handle multiple values for the same key (OR logic for groups)
        const uniqueKeys = Array.from(new Set(Array.from(searchParams.keys())));
        uniqueKeys.forEach((key) => {
            if (!["categoryId", "page", "pageSize"].includes(key)) {
                const values = searchParams.getAll(key);
                if (values.length > 0) {
                    magentoUrl.searchParams.set(key, values.join(","));
                }
            }
        });

        const res = await fetch(magentoUrl.toString(), {
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
        return Response.json(data);

    } catch (error: any) {
        console.error("category-products route error:", error.message);
        return Response.json(
            { error: "Failed to fetch products", message: error.message },
            { status: 500 }
        );
    }
}
