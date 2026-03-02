import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET() {
    const session: any = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
        "https://altalayi-demo.btire.com/rest/V1/kleverapi/category-products",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await res.json();
    return Response.json(data);
}
