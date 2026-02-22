import React from 'react';
import { Home, Trophy, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';

interface SidebarProps {
    collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
    const { user } = useAuth();
    const location = useLocation();

    return (
        <aside
            className={`bg-[#263238] text-white/80 transition-all duration-300 flex flex-col ${collapsed ? 'w-[52px]' : 'w-[260px]'} min-h-full`}
        >
            {/* User info */}
            {!collapsed && (
                <div className="px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo_loteka_menu.png" alt="" className="w-[38px] h-[38px] rounded-full object-cover" />
                        <div className="overflow-hidden">
                            <p className="text-[13px] font-semibold text-white truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-[11px] text-white/50 flex items-center gap-1 truncate">
                                <MapPin size={10} /> Consorcio #{user?.consorcioId}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-3">
                {!collapsed && (
                    <p className="px-5 text-[10px] uppercase tracking-wider text-white/40 mb-2 font-semibold">Main</p>
                )}
                <Link
                    to="/"
                    className={`flex items-center gap-3 px-5 py-[9px] text-[13px] transition-colors hover:bg-white/5
                        ${location.pathname === '/' ? 'bg-white/10 text-white' : ''}`}
                >
                    <Home size={16} />
                    {!collapsed && <span>Dashboard</span>}
                </Link>

                {!collapsed && (
                    <p className="px-5 text-[10px] uppercase tracking-wider text-white/40 mb-2 mt-5 font-semibold">Consultas</p>
                )}

                <div>
                    <div className={`flex items-center gap-3 px-5 py-[9px] text-[13px] text-white/60`}>
                        <Trophy size={16} />
                        {!collapsed && <span>Control de Premios</span>}
                    </div>
                    <Link
                        to="/"
                        className={`flex items-center gap-3 pl-12 pr-5 py-[7px] text-[12px] transition-colors hover:bg-white/5
                            ${location.pathname === '/' ? 'text-white' : 'text-white/50'}`}
                    >
                        {!collapsed && 'Resultados Sorteos y Premios'}
                    </Link>
                    <Link
                        to="/ticket"
                        className={`flex items-center gap-3 pl-12 pr-5 py-[7px] text-[12px] transition-colors hover:bg-white/5
                            ${location.pathname === '/ticket' ? 'text-white' : 'text-white/50'}`}
                    >
                        {!collapsed && 'Consultar Ticket'}
                    </Link>
                </div>
            </nav>
        </aside>
    );
};
