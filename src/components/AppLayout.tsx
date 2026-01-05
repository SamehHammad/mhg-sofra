'use client';

import Container from './Container';
import TopNav from './TopNav';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      <TopNav title={title} subtitle={subtitle} />
      <main className="py-6 lg:py-10">
        <Container>{children}</Container>
      </main>
    </div>
  );
}

