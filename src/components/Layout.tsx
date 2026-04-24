import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col text-white selection:bg-purple-500/30 font-sans selection:text-white antialiased overflow-hidden relative">
      {children}
    </div>
  );
}
