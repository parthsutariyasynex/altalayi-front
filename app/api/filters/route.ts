import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET(request: Request) {
    try {
        const session: any = await getServerSession(authOptions);
        const token = session?.accessToken;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId") || "5";

        const res = await fetch(
            `https://altalayi-demo.btire.com/rest/V1/kleverapi/category-filter-options?categoryId=${categoryId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) {
            return NextResponse.json(
                { error: `External API returned status ${res.status}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch filters", details: error.message },
            { status: 500 }
        );
    }
}
