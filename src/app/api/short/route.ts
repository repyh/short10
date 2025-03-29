import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import connectDB from "@/database/connect";
import Short from "@/database/Short";

// POST: Create a new short URL
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { targetURL, customId } = body;

        // Validate URL
        if (!targetURL) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Validate custom ID if provided
        if (customId && !/^[a-zA-Z0-9-_]+$/.test(customId)) {
            return NextResponse.json({ 
                error: "Custom path can only contain letters, numbers, hyphens, and underscores" 
            }, { status: 400 });
        }

        // Create a unique ID or use the custom one
        const id = customId || nanoid(6);

        // Check if ID already exists
        const existingShort = await Short.findOne({ id });
        if (existingShort) {
            return NextResponse.json({ 
                error: "Custom ID already exists. Please choose another one." 
            }, { status: 409 });
        }

        // Create new short URL
        const shortUrl = await Short.create({
            id,
            targetURL,
            clicks: 0,
        });

        return NextResponse.json({
            id: shortUrl.id,
            targetURL: shortUrl.targetURL,
            clicks: shortUrl.clicks,
            createdAt: shortUrl.createdAt
        });

    } catch (error) {
        console.error("Error creating short URL:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET: Retrieve all short URLs
export async function GET() {
    try {
        await connectDB();

        // Fetch all short URLs, sorted by creation date (newest first)
        const shortUrls = await Short.find().sort({ createdAt: -1 });

        return NextResponse.json(shortUrls);

    } catch (error) {
        console.error("Error retrieving short URLs:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
