import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Initialize from localStorage or default to '1' (Lotenet)
    const [sistemaId, setSistemaId] = useState(() => {
        return localStorage.getItem('sistema_id') || '1';
    });

    const handleSistemaChange = (newSistemaId: string) => {
        if (newSistemaId === sistemaId) return;

        // 1. Save in local state
        setSistemaId(newSistemaId);

        // 2. Persist in localStorage
        localStorage.setItem('sistema_id', newSistemaId);

        // 3. Persist in cookie (to match legacy Django behavior across the site)
        document.cookie = `sistema_id=${newSistemaId}; path=/; SameSite=Lax`;

        // 4. Force reload to perfectly mimic Django's "full data refresh" behavior
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#eeeeee]">
            <Header
                onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                sistemaId={sistemaId}
                onSistemaChange={handleSistemaChange}
            />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar collapsed={sidebarCollapsed} />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
