import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sistemaId, setSistemaId] = useState('1');

    return (
        <div className="min-h-screen flex flex-col bg-[#eeeeee]">
            <Header
                onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                sistemaId={sistemaId}
                onSistemaChange={setSistemaId}
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
