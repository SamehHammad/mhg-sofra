import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        default: 'لوحة الإدارة | MHG Sofra',
        template: '%s | لوحة الإدارة | MHG Sofra',
    },
    description: 'لوحة إدارة MHG Sofra',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return children;
}
