import * as bcrypt from 'bcryptjs';

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Generate simple token (for demo purposes)
export function generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
