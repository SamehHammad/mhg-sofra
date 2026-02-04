import { BillingUser, BillingSummary } from './types';

interface OrderWithDetails {
    user: { username: string };
    items: {
        menuItem: { name: string };
        price: number;
        quantity: number;
    }[];
}

export function calculateBilling(
    orders: OrderWithDetails[],
    deliveryFee: number,
    restaurantName: string,
    restaurantId: string,
    mealType: string,
    date: string
): BillingSummary {
    // Group orders by user
    const userMap = new Map<string, BillingUser>();

    orders.forEach((order) => {
        const username = order.user.username;

        if (!userMap.has(username)) {
            userMap.set(username, {
                username,
                items: [],
                subtotal: 0,
                deliveryShare: 0,
                total: 0,
            });
        }

        const user = userMap.get(username)!;

        order.items.forEach((item) => {
            user.items.push({
                name: item.menuItem.name,
                price: item.price,
                quantity: item.quantity,
            });
            user.subtotal += item.price * item.quantity;
        });
    });

    // Calculate delivery fee split
    const userCount = userMap.size;
    const deliveryShare = userCount > 0 ? deliveryFee / userCount : 0;

    // Update each user's total
    const users = Array.from(userMap.values()).map((user) => ({
        ...user,
        deliveryShare,
        total: user.subtotal + deliveryShare,
    }));

    // Calculate grand total
    const grandTotal = users.reduce((sum, user) => sum + user.total, 0);

    return {
        date,
        mealType: mealType as any,
        restaurant: restaurantName,
        restaurantId,
        deliveryFee,
        users,
        grandTotal,
    };
}

export function formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} جنيه`;
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}
