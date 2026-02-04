import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const subscription = await request.json();
        const { endpoint, keys, username } = subscription;

        if (!endpoint || !keys) {
            return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
        }

        let userId = null;
        if (username) {
            const user = await prisma.user.findUnique({
                where: { username },
            });
            if (user) {
                userId = user.id;
            }
        }

        // Upsert the subscription
        // @ts-ignore
        await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                keys,
                ...(userId && { userId }),
            },
            create: {
                endpoint,
                keys,
                userId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving subscription:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
