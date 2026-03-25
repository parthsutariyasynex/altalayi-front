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
    // Proceeding without strict token check at proxy level to allow Magento to decide (guest vs customer)
    // If token is found, we'll use it.

    const { searchParams } = new URL(request.url);
    const width = searchParams.get("width");

    try {
        let url = `${process.env.NEXT_PUBLIC_BASE_URL}/tyre-size/height`;
        if (width) {
            url += `?width=${encodeURIComponent(width)}`;
        }
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                platform: "web",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error("[tyre-size/height] Magento error:", res.status, errBody);
            return NextResponse.json({ error: "Magento API error", details: errBody }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("[tyre-size/height] Fetch error:", err.message);
        return NextResponse.json({ error: "Failed to fetch heights", message: err.message }, { status: 500 });
    }
}
