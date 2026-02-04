// Constants for MHG Sofra
import { MealTypeOption, MealShape } from './types';

// Admin credentials (password: sam7@123)
// Hash generated with bcrypt, rounds: 10
export const ADMIN_PASSWORD_HASH = '$2a$10$8vn8KqZ5QYxYZ5YZ5YZ5YeO8vn8KqZ5QYxYZ5YZ5YZ5YeO8vn8KqZ';
export const ADMIN_USERNAME = 'admin';

// Meal type configurations
export const MEAL_TYPES: MealTypeOption[] = [
    {
        type: 'BREAKFAST',
        label: 'Breakfast',
        labelAr: 'فطار',
        icon: '🌅',
        color: '#FF6B6B',
        gradient: 'from-mhg-gold to-mhg-gold-deep'
    },
    {
        type: 'LUNCH',
        label: 'Lunch',
        labelAr: 'غداء',
        icon: '🍽️',
        color: '#4ECDC4',
        gradient: 'from-mhg-blue to-mhg-blue-deep'
    },
    {
        type: 'DINNER',
        label: 'Dinner',
        labelAr: 'عشاء',
        icon: '🌙',
        color: '#9B59B6',
        gradient: 'from-mhg-brown-soft to-mhg-brown'
    },
    {
        type: 'DESSERT',
        label: 'Dessert',
        labelAr: 'تحلية',
        icon: '🍰',
        color: '#F39C12',
        gradient: 'from-mhg-accent-red to-mhg-gold'
    }
];

export const MEAL_SHAPES: { type: MealShape; labelAr: string }[] = [
    { type: 'SANDWICH', labelAr: 'ساندويتش' },
    { type: 'PLATE', labelAr: 'طبق' },
    { type: 'BOX', labelAr: 'علبة' },
];

// Session storage keys
export const SESSION_KEYS = {
    USERNAME: 'mhg_sofra_username',
    ADMIN_TOKEN: 'mhg_sofra_admin_token',
    SELECTED_MEAL_TYPE: 'mhg_sofra_meal_type',
    CART: 'mhg_sofra_cart'
};

// API endpoints
export const API_ROUTES = {
    AUTH: {
        USERNAME: '/api/auth/username',
        ADMIN: '/api/auth/admin'
    },
    RESTAURANTS: '/api/restaurants',
    MENU: '/api/menu',
    ORDERS: '/api/orders',
    BILLING: '/api/billing'
};

// Date format
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
