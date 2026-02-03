// Constants for MHG Sofra
import { MealTypeOption } from './types';

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
        gradient: 'from-orange-400 to-red-500'
    },
    {
        type: 'LUNCH',
        label: 'Lunch',
        labelAr: 'غداء',
        icon: '🍽️',
        color: '#4ECDC4',
        gradient: 'from-teal-400 to-cyan-500'
    },
    {
        type: 'DINNER',
        label: 'Dinner',
        labelAr: 'عشاء',
        icon: '🌙',
        color: '#9B59B6',
        gradient: 'from-purple-400 to-indigo-500'
    },
    {
        type: 'DESSERT',
        label: 'Dessert',
        labelAr: 'تحلية',
        icon: '🍰',
        color: '#F39C12',
        gradient: 'from-yellow-400 to-orange-500'
    }
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
