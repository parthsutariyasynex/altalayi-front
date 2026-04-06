import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.includes("null") || authHeader.includes("undefined")) {
            console.error("[my-statement-types] Invalid token:", authHeader);
            return NextResponse.json({ message: 'Unauthorized: Invalid token format' }, { status: 401 });
        }

        const magentoUrl = `${BASE_URL}/my-statement/types`;
        console.log(`>>> My Statement Types GET REQUEST: ${magentoUrl}`);

        const response = await fetch(magentoUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                'platform': 'web',
            },
            cache: 'no-store',
        });

        // Safe response parsing
        const responseText = await response.text();
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (err) {
            console.error(`<<< My Statement Types GET RESPONSE: ${response.status} (FAILED TO PARSE JSON)`, responseText);
            return NextResponse.json(
                { message: "Invalid backend response format", details: responseText.substring(0, 200) },
                { status: 502 }
            );
        }

        console.log(`<<< My Statement Types GET RESPONSE: ${response.status}`, data);

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[my-statement-types] Catch error:', error);
        return NextResponse.json(
            { message: error.message || 'Server error fetching statement types' },
            { status: 500 }
        );
    }
}
