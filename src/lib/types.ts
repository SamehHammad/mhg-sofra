// Type definitions for MHG Sofra

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'DESSERT';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface User {
    id: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Restaurant {
    id: string;
    name: string;
    phone: string | null;
    deliveryPrice: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    mealType: MealType;
    description: string | null;
    isAvailable: boolean;
    restaurantId: string;
    createdAt: Date;
    updatedAt: Date;
    restaurant?: Restaurant;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    restaurantId: string;
    mealType: MealType;
    totalAmount: number;
    status: OrderStatus;
    orderDate: Date;
    createdAt: Date;
    updatedAt: Date;
    user?: User;
    restaurant?: Restaurant;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    orderId: string;
    menuItemId: string;
    quantity: number;
    price: number;
    createdAt: Date;
    menuItem?: MenuItem;
}

export interface BillingUser {
    username: string;
    items: {
        name: string;
        price: number;
        quantity: number;
    }[];
    subtotal: number;
    deliveryShare: number;
    total: number;
}

export interface BillingSummary {
    date: string;
    mealType: MealType;
    restaurant: string;
    restaurantId: string;
    deliveryFee: number;
    users: BillingUser[];
    grandTotal: number;
}

export interface MealTypeOption {
    type: MealType;
    label: string;
    labelAr: string;
    icon: string;
    color: string;
    gradient: string;
}
