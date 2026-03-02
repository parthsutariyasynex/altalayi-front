import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const session: any = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || "5";

    const res = await fetch(
        `https://altalayi-demo.btire.com/rest/V1/kleverapi/category-products?categoryId=${categoryId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await res.json();
    return Response.json(data);
}
