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
        const session: any = await getServerSession(authOptions);
        token = session?.accessToken;
    }

    // Proceeding without strict token check at proxy level to allow Magento to decide (guest vs customer)

    const { searchParams } = new URL(request.url);
    const width = searchParams.get("width") || "";
    const height = searchParams.get("height") || "";
    const rim = searchParams.get("rim") || "";
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "20";

    if (!width && !height && !rim) {
        return NextResponse.json(
            { error: "Missing required parameters: at least one of width, height, or rim must be provided." },
            { status: 400 }
        );
    }

    const encodedWidth = width ? encodeURIComponent(width) : "any";
    const encodedHeight = height ? encodeURIComponent(height) : "any";
    const encodedRim = rim ? encodeURIComponent(rim) : "any";

    // Use the tyre-size search endpoint on the Magento backend
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/tyre-size/search/${encodedWidth}/${encodedHeight}/${encodedRim}?currentPage=${encodeURIComponent(page)}&pageSize=${encodeURIComponent(pageSize)}`;

    console.log("[tyre-size/search] Fetching:", url);

    try {
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
            console.error("[tyre-size/search] Backend error:", res.status, errBody);
            return NextResponse.json(
                { error: "Backend API error", details: errBody },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("[tyre-size/search] Fetch error:", err.message);
        return NextResponse.json(
            { error: "Failed to fetch tyre size search results", message: err.message },
            { status: 500 }
        );
    }
}
