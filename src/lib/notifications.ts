import webpush from "web-push";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        "mailto:admin@mhg-sofra.com",
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function sendNotificationToAll(title: string, body: string, url: string = "/") {
    try {
        // @ts-ignore
        const subscriptions = await prisma.pushSubscription.findMany();
        if (!subscriptions || subscriptions.length === 0) return false;

        return await sendToSubscriptions(subscriptions, title, body, url);
    } catch (error) {
        console.error("Error broadcasting notification:", error);
        return false;
    }
}

export async function sendNotificationToAllExcept(excludedUsername: string, title: string, body: string, url: string = "/") {
    try {
        // @ts-ignore
        const subscriptions = await prisma.pushSubscription.findMany({
            where: {
                OR: [
                    { user: { username: { not: excludedUsername } } },
                    { userId: null } // Include anonymous subscriptions if any
                ]
            },
            include: { user: true }
        });

        if (!subscriptions || subscriptions.length === 0) return false;

        // Double check filtering in memory to be safe against nulls/joins nuances
        const filteredSubs = subscriptions.filter((sub: any) => !sub.user || sub.user.username !== excludedUsername);

        return await sendToSubscriptions(filteredSubs, title, body, url);
    } catch (error) {
        console.error("Error broadcasting notification except user:", error);
        return false;
    }
}

export async function sendNotificationToUser(username: string, title: string, body: string, url: string = "/") {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                // @ts-ignore
                pushSubscriptions: true
            }
        });

        // @ts-ignore
        if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
            console.log(`No subscriptions found for user ${username}`);
            return false;
        }

        // @ts-ignore
        return await sendToSubscriptions(user.pushSubscriptions, title, body, url);

    } catch (error) {
        console.error(`Error sending notification to user ${username}:`, error);
        return false;
    }
}

async function sendToSubscriptions(subscriptions: any[], title: string, body: string, url: string) {
    const notificationPayload = JSON.stringify({
        title,
        body,
        icon: "/logo2.png",
        data: { url },
    });

    const promises = subscriptions.map((sub: any) =>
        webpush
            .sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: sub.keys as any,
                },
                notificationPayload
            )
            .catch(async (err: any) => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log(`Subscription ${sub.id} expired/gone, deleting.`);
                    // @ts-ignore
                    await prisma.pushSubscription.delete({ where: { id: sub.id } });
                } else {
                    console.error("Error sending notification to sub:", sub.id, err);
                }
            })
    );

    await Promise.all(promises);
    return true;
}
