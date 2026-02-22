import React, { useState } from 'react';
import { Menu, ChevronDown, Power } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
    onToggleSidebar: () => void;
    sistemaId: string;
    onSistemaChange: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sistemaId, onSistemaChange }) => {
    const { logout } = useAuth();
    const [showSistemaDropdown, setShowSistemaDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    return (
        <header className="h-[46px] bg-[#263238] flex items-center justify-between px-4 text-white text-sm relative z-50">
            {/* Left */}
            <div className="flex items-center gap-4">
                <img src="/images/logo_kontrola_white.png" alt="Kontrola" className="h-[18px]" />
                <button onClick={onToggleSidebar} className="text-white/70 hover:text-white ml-4">
                    <Menu size={18} />
                </button>
                <span className="ml-2 bg-green-500 text-[10px] px-2 py-[2px] rounded font-semibold">Online</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
                {/* Sistema dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { setShowSistemaDropdown(!showSistemaDropdown); setShowUserDropdown(false); }}
                        className="flex items-center gap-1 px-3 py-1 hover:bg-white/10 rounded text-[13px]"
                    >
                        {sistemaId === '1' ? 'LOTENET' : 'LOTOBET'}
                        <ChevronDown size={14} />
                    </button>
                    {showSistemaDropdown && (
                        <div className="absolute right-0 top-full mt-1 bg-white text-gray-800 rounded shadow-lg min-w-[140px] py-1 z-50">
                            <button onClick={() => { onSistemaChange('1'); setShowSistemaDropdown(false); }}
                                className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-100 ${sistemaId === '1' ? 'font-semibold text-orange-500' : ''}`}>
                                LOTENET
                            </button>
                            <hr className="my-1 border-gray-200" />
                            <button onClick={() => { onSistemaChange('2'); setShowSistemaDropdown(false); }}
                                className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-100 ${sistemaId === '2' ? 'font-semibold text-orange-500' : ''}`}>
                                LOTOBET
                            </button>
                        </div>
                    )}
                </div>

                {/* User dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { setShowUserDropdown(!showUserDropdown); setShowSistemaDropdown(false); }}
                        className="flex items-center gap-2 px-3 py-1 hover:bg-white/10 rounded text-[13px]"
                    >
                        <img src="/images/logo_empresa.png" alt="" className="h-[20px]" />
                        <span>LOTEKA, SRL</span>
                        <ChevronDown size={14} />
                    </button>
                    {showUserDropdown && (
                        <div className="absolute right-0 top-full mt-1 bg-white text-gray-800 rounded shadow-lg min-w-[140px] py-1 z-50">
                            <button onClick={() => { logout(); setShowUserDropdown(false); }}
                                className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-100 flex items-center gap-2">
                                <Power size={14} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
