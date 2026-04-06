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
        // ... (remaining params logic)
        const params = new URLSearchParams();
        if (width) params.append("width", width);
        if (height) params.append("height", height);
        if (params.toString()) url += `?${params.toString()}`;

        const fetchOptions: any = {
            headers: {
                "Content-Type": "application/json",
                platform: "web",
                accept: "application/json",
            },
            cache: "no-store",
        };

        if (token && token !== "null") {
            fetchOptions.headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(url, fetchOptions);
        const responseText = await res.text();

        if (!res.ok) {
            console.error("[tyre-size/rim] Magento error:", res.status, responseText);
            return NextResponse.json({ error: "Magento error", details: responseText }, { status: res.status });
        }

        try {
            const data = JSON.parse(responseText);
            return NextResponse.json(data);
        } catch (e) {
            console.error("[tyre-size/rim] JSON Parse Error. Raw:", responseText);
            return NextResponse.json({ error: "Invalid JSON from Magento", raw: responseText }, { status: 500 });
        }
    } catch (err: any) {
        console.error("[tyre-size/rim] Fetch error:", err.message);
        return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
    }
}
