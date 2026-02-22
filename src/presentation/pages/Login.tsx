import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Por favor, ingresa tus credenciales.');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // El usuario real viene en la respuesta del backend
                login(data.token, data.user);
                navigate('/');
            } else {
                setError('Las credenciales de acceso son invalidas.');
            }
        } catch (err) {
            setError('Ocurrió un error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed flex flex-col items-center select-none"
            style={{ backgroundImage: 'url(/images/login_cover.jpg)' }}
        >
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-[721px] flex-1 min-h-screen flex flex-col justify-between pt-[44px]"
                style={{ backgroundColor: 'rgba(1, 4, 28, 0.55)', border: 'none' }}
            >
                {/* Top Section */}
                <div className="flex-grow flex flex-col items-center pt-[70px]">
                    <div className="mb-[60px] text-center">
                        <img src="/images/k_logo_light.png" alt="Kontrola Logo" className="mx-auto block" />
                    </div>

                    {error && (
                        <div className="w-full max-w-[331px] text-center mb-4">
                            <div className="bg-[#f31d1d] text-white p-3 rounded text-[15px] font-bold text-center">
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Inputs wrapper */}
                    <div className="w-[331px] flex flex-col items-center gap-[20px]">
                        <div className="relative w-[281px]">
                            <input
                                type="text"
                                placeholder="Username"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full h-[50px] pl-[50px] pr-[10px] text-[13px] text-[#006B96] bg-white rounded shadow-sm focus:outline-none placeholder:text-[#7FC3D380]"
                            />
                            <div className="absolute left-[15px] top-[15px]">
                                <User size={20} color="#006b96" />
                            </div>
                        </div>

                        <div className="relative w-[281px]">
                            <input
                                type="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-[50px] pl-[50px] pr-[10px] text-[13px] text-[#006B96] bg-white rounded shadow-sm focus:outline-none placeholder:text-[#7FC3D380]"
                            />
                            <div className="absolute left-[15px] top-[15px]">
                                <Lock size={20} color="#006b96" />
                            </div>
                        </div>

                        <div className="w-[281px]">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[45px] bg-[#3B95B0] text-white flex items-center justify-center gap-[6px] rounded transition-colors hover:bg-[#2d768c] font-bold text-[13px]"
                            >
                                {loading ? 'Iniciando...' : 'Iniciar'}
                                {!loading && (
                                    <div className="border border-white rounded-full p-[1px] flex items-center justify-center">
                                        <ChevronRight size={14} strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        </div>

                        <div className="text-center mt-2 w-[281px]">
                            <a href="#" className="text-white text-[12px] hover:text-[#3B95B0] transition-colors">
                                ¿Olvidó su contraseña?
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="text-center pb-8 pt-4 px-4 text-white text-[12px] relative mt-auto">
                    <img src="/images/logo.png" alt="Loteka Logo" className="mx-auto mb-4 relative z-10" />
                    <p className="mb-0 leading-[19px] relative z-10">
                        © 2019. Kontrola por <a href="http://loteka.com.do" target="_blank" rel="noreferrer" className="text-white hover:text-[#3B95B0] transition-colors">LOTEKA</a>
                        <br />
                        <a href="#" className="text-white hover:text-[#3B95B0] transition-colors">
                            El Acceso está permitido solo a personal autorizado.
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
};
