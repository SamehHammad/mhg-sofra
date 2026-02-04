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

export type MealShape = 'SANDWICH' | 'PLATE' | 'BOX';

export const MEAL_SHAPES: { type: MealShape; labelAr: string }[] = [
    { type: 'SANDWICH', labelAr: 'ساندويتش' },
    { type: 'PLATE', labelAr: 'طبق' },
    { type: 'BOX', labelAr: 'علبة' },
];

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    mealType: MealType;
    description: string | null;
    mealShape?: MealShape | null;
    options: string[];
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
    selectedOption: string | null;
    createdAt: Date;
    menuItem?: MenuItem;
}

export interface BillingUser {
    username: string;
    items: {
        name: string;
        price: number;
        quantity: number;
        selectedOption?: string | null;
        mealShape?: string | null;
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
