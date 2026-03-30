import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    let token: string | null = null;

    // 1. Try Header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).replace(/['"]/g, "").trim();
    }

    // 2. Try auth-token cookie
    if (!token || token === "null") {
        const cookie = request.cookies.get("auth-token")?.value;
        if (cookie) {
            token = cookie.replace(/['"]/g, "").trim();
        }
    }

    // 3. Try Session
    if (!token || token === "null") {
        const session: any = await getServerSession(authOptions);
        token = session?.accessToken;
    }

    // Proceed without token if missing, allowing guest access if Magento supports it

    // This route (width) does not typically take search parameters for its primary function.
    // If it were to take parameters, they would be extracted here.
    // For example, if it needed a 'category' parameter:
    // const { searchParams } = new URL(request.url);
    // const category = searchParams.get("category");
    // const encodedCategory = category ? encodeURIComponent(category) : '';
    // const url = `${process.env.NEXT_PUBLIC_BASE_URL}/tyre-size/width${encodedCategory ? `?category=${encodedCategory}` : ''}`;

    const fetchOptions: any = {
        headers: {
            'Content-Type': 'application/json',
            'platform': 'web'
        },
        cache: 'no-store',
    };

    if (token && token !== "null") {
        fetchOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/tyre-size/width`,
            fetchOptions
        );

        if (!res.ok) {
            const errBody = await res.text();
            console.error("[tyre-size/width] Magento error:", res.status, errBody);
            return NextResponse.json({ error: "Magento API error", details: errBody }, { status: res.status });
        }

        const data = await res.json();
        console.log("[tyre-size/width] Raw response:", JSON.stringify(data).substring(0, 500));
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("[tyre-size/width] Fetch error:", err.message);
        return NextResponse.json({ error: "Failed to fetch widths", message: err.message }, { status: 500 });
    }
}
