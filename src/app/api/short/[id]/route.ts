import { NextRequest, NextResponse } from "next/server";
import Short from "@/database/Short";
import connectDB from "@/database/connect";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const shortUrl = await Short.findOne({ id });

        if (!shortUrl) {
            return NextResponse.json({ error: "Short URL not found" }, { status: 404 });
        }

        shortUrl.clicks += 1;
        await shortUrl.save();

        return NextResponse.json({
            id: shortUrl.id,
            targetURL: shortUrl.targetURL,
            clicks: shortUrl.clicks,
            createdAt: shortUrl.createdAt
        });

    } catch (error) {
        console.error("Error retrieving short URL:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await context.params;

        const shortUrl = await Short.findOne({ id });

        if (!shortUrl) {
            return NextResponse.json({ error: "Short URL not found" }, { status: 404 });
        }

        await Short.deleteOne({ id });

        return NextResponse.json({ message: "Short URL deleted successfully" });

    } catch (error) {
        console.error("Error deleting short URL:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
