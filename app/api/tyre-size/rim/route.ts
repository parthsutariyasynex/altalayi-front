import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    let token: string | null = null;

    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).replace(/['"]/g, "").trim();
    }
    if (!token || token === "null") {
        const cookie = request.cookies.get("auth-token")?.value;
        if (cookie) token = cookie.replace(/['"]/g, "").trim();
    }
    if (!token || token === "null") {
        const session: any = await getServerSession(authOptions);
        token = session?.accessToken;
    }
    // Optional token - if found use it, else proceed as guest

    const { searchParams } = new URL(request.url);
    const width = searchParams.get("width");
    const height = searchParams.get("height");

    try {
        let url = `${process.env.NEXT_PUBLIC_BASE_URL}/tyre-size/rim`;
        const params = new URLSearchParams();
        if (width) params.append("width", width);
        if (height) params.append("height", height);
        if (params.toString()) url += `?${params.toString()}`;
        const fetchOptions: any = {
            headers: {
                "Content-Type": "application/json",
                platform: "web",
            },
            cache: "no-store",
        };

        if (token && token !== "null") {
            fetchOptions.headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(url, fetchOptions);

        if (!res.ok) {
            const errBody = await res.text();
            console.error("[tyre-size/rim] Magento error:", res.status, errBody);
            return NextResponse.json({ error: "Magento API error", details: errBody }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("[tyre-size/rim] Fetch error:", err.message);
        return NextResponse.json({ error: "Failed to fetch rims", message: err.message }, { status: 500 });
    }
}
