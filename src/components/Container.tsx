'use client';

import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={`w-full mx-auto  px-3 md:px-10 lg:px-40 sm:px-4 ${className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
