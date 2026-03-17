import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const pageSize = searchParams.get("pageSize") || "15";
        const currentPage = searchParams.get("currentPage") || "1";

        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized: Missing customer token" }, { status: 401 });
        }

        const url = `${BASE_URL}/notifications?pageSize=${pageSize}&currentPage=${currentPage}`;
        console.log("[Notifications] Fetching:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
                platform: "web",
            },
        });

        const data = await response.json();
        console.log("[Notifications] Status:", response.status);
        console.log("[Notifications] Response keys:", Object.keys(data));
        console.log("[Notifications] Response preview:", JSON.stringify(data).substring(0, 1000));

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // Normalize: find the notification items array from whatever key Magento uses
        let items: any[] = [];
        if (Array.isArray(data)) {
            items = data;
        } else {
            // Try common Magento response field names
            for (const key of Object.keys(data)) {
                if (Array.isArray(data[key]) && data[key].length > 0) {
                    console.log("[Notifications] Found items array in key:", key, "count:", data[key].length);
                    items = data[key];
                    break;
                }
            }
        }

        // Return normalized response
        return NextResponse.json({
            items,
            total_count: data.total_count ?? data.totalCount ?? items.length,
            unread_count: data.unread_count ?? data.unreadCount ?? 0,
        });
    } catch (error) {
        console.error("Proxy GET Notifications Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
