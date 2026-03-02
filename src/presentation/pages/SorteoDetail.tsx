import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, Trophy, AlertTriangle, Clock, DollarSign, List, Calendar, Home as HomeIcon, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Juego {
    premio_id: number | null;
    numeros_ganadores: string | null;
    juego_id: number;
    juego_nombre: string;
    total_apuestas: number;
    monto_apostado: number;
    total_apuestas_post: number;
    monto_apostado_post: number;
    sorteo_cerrado: number;
}

interface Detalles {
    premio_id: number | null;
    numeros_ganadores: string | null;
    sorteo_nombre: string;
    sorteo_numero: number;
    loteria_nombre: string;
    fecha_cierre_sorteo: string;
    fecha_sorteo: string;
    hora_cierre: string;
    sorteo_cerrado: number;
    cantidad_tickets: number;
    cantidad_tickets_post: number;
    cantidad_tickets_anulados: number;
    cantidad_tickets_pagados: number;
    cantidad_tickets_premiados: number;
    total_vendido: number;
    total_premiados: number;
    total_pagados: number;
    total_anulados: number;
    total_ganancia: number;
    total_ganancia_post: number;
}

const formatMoney = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export const SorteoDetail = () => {
    const { sorteo_id } = useParams<{ sorteo_id: string }>();
    const { token } = useAuth();
    const [juegos, setJuegos] = useState<Juego[]>([]);
    const [detalles, setDetalles] = useState<Detalles | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/sorteo-detail?sorteo_id=${sorteo_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setJuegos(data.juegos);
                setDetalles(data.detalles);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [sorteo_id, token]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    if (loading) {
        return (
            <div className="p-10 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#3B95B0] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!detalles) {
        return <div className="p-10 text-gray-500 text-center">No se encontraron datos para este sorteo.</div>;
    }

    const isCerrado = detalles.sorteo_cerrado === 1;

    return (
        <div className="p-5">
            {/* Page Header */}
            <div className="mb-5">
                <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                    <h4 className="text-[15px] text-gray-700 flex items-center gap-2">
                        <Link to="/" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={16} /></Link>
                        <span className="font-semibold">Resultado Sorteo</span>
                    </h4>
                    <div className="text-[12px] text-gray-500">
                        <Link to="/" className="hover:underline">Home</Link> › Control de Premios ›{' '}
                        <Link to="/" className="hover:underline">Resultados</Link> ›{' '}
                        <span className="text-gray-700">Sorteo {detalles.sorteo_numero}:{detalles.sorteo_nombre}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-5">
                {/* Left Column (75%) */}
                <div className="flex-1 min-w-0">
                    {/* Panel Header */}
                    <div className="bg-white rounded shadow-sm border border-gray-200 mb-5">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h5 className="text-[14px] font-semibold text-gray-700">
                                Detalle Sorteo {detalles.sorteo_numero}:{detalles.sorteo_nombre}
                            </h5>
                            <span className={`text-[11px] px-3 py-1 rounded font-medium text-white ${isCerrado ? 'bg-[#607D8B]' : 'bg-gray-400'}`}>
                                {isCerrado ? 'CERRADO' : 'PENDIENTE'} ✓
                            </span>
                        </div>

                        <div className="p-5">
                            <h6 className="text-[13px] font-semibold text-gray-700 mb-4">Resumen Estadístico</h6>

                            {/* 4 Stat Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white border border-gray-200 rounded p-4 border-l-[3px] border-l-teal-500">
                                    <div className="flex items-center justify-between">
                                        <Ticket size={28} className="text-teal-400" />
                                        <div className="text-right">
                                            <h3 className="text-[20px] font-semibold">{detalles.cantidad_tickets}</h3>
                                            <span className="text-[9px] uppercase text-gray-400">Total tickets vendidos</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded p-4 border-l-[3px] border-l-orange-400">
                                    <div className="flex items-center justify-between">
                                        <Trophy size={28} className="text-orange-300" />
                                        <div className="text-right">
                                            <h3 className="text-[20px] font-semibold">{detalles.cantidad_tickets_premiados}</h3>
                                            <span className="text-[9px] uppercase text-gray-400">Total tickets premiados</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded p-4">
                                    <div className="flex items-center justify-between">
                                        <AlertTriangle size={28} className="text-red-300" />
                                        <div className="text-right">
                                            <h3 className="text-[20px] font-semibold">{detalles.cantidad_tickets_anulados}</h3>
                                            <span className="text-[9px] uppercase text-gray-400">Total tickets anulados</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded p-4">
                                    <div className="flex items-center justify-between">
                                        <Clock size={28} className="text-gray-400" />
                                        <div className="text-right">
                                            <h3 className="text-[20px] font-semibold">{detalles.cantidad_tickets_post}</h3>
                                            <span className="text-[9px] uppercase text-gray-400">Tickets post cierre</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Juegos Table */}
                            <div className="bg-white border border-gray-200 rounded">
                                <div className="p-3 border-b border-gray-200">
                                    <h5 className="text-[13px] font-semibold text-gray-700">Estadísticas por Juegos</h5>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[12px]">
                                        <thead>
                                            <tr className="bg-[#fafafa] border-b border-gray-200 text-gray-600">
                                                <th rowSpan={2} className="px-3 py-2 text-center border-r border-gray-200">Juego</th>
                                                <th colSpan={2} className="px-3 py-2 text-center font-bold border-r border-gray-200">Pre Sorteo</th>
                                                <th colSpan={2} className="px-3 py-2 text-center border-r border-gray-200">Post Sorteo</th>
                                                <th rowSpan={2} className="px-3 py-2 text-center">Estado</th>
                                            </tr>
                                            <tr className="bg-[#fafafa] border-b border-gray-200 text-gray-500 text-[11px]">
                                                <th className="px-3 py-1 border-r border-gray-200">Total Apuestas</th>
                                                <th className="px-3 py-1 border-r border-gray-200">Total Monto</th>
                                                <th className="px-3 py-1 border-r border-gray-200">Total Apuestas</th>
                                                <th className="px-3 py-1 border-r border-gray-200">Total Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {juegos.map((j, i) => (
                                                <tr
                                                    key={i}
                                                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => navigate(`/sorteo/${sorteo_id}/juego/${j.juego_id}?consorcio_id=`)}
                                                >
                                                    <td className="px-3 py-2 border-r border-gray-200">
                                                        <span className="text-[#1E88E5] font-medium">{j.juego_nombre}</span>
                                                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-[1px]">
                                                            <span className="w-[5px] h-[5px] rounded-full bg-blue-400 inline-block"></span>
                                                            No.{j.juego_id}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-center border-r border-gray-200">{j.total_apuestas}</td>
                                                    <td className="px-3 py-2 text-center border-r border-gray-200">{formatMoney(j.monto_apostado)}</td>
                                                    <td className={`px-3 py-2 text-center border-r border-gray-200 ${j.sorteo_cerrado ? 'bg-black/[.015]' : 'bg-[#ffeee8]'}`}>
                                                        {j.sorteo_cerrado ? j.total_apuestas_post : 0}
                                                    </td>
                                                    <td className={`px-3 py-2 text-center border-r border-gray-200 ${j.sorteo_cerrado ? 'bg-black/[.015]' : 'bg-[#ffeee8]'}`}>
                                                        {j.sorteo_cerrado ? formatMoney(j.monto_apostado_post) : '$0'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {j.monto_apostado === j.monto_apostado_post ? (
                                                            <span className="bg-green-500 text-white text-[10px] px-2 py-[2px] rounded">CORRECTO</span>
                                                        ) : (
                                                            <span className="bg-red-500 text-white text-[10px] px-2 py-[2px] rounded">CON DIFERENCIAS</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (25%) */}
                <div className="w-[280px] flex-shrink-0 space-y-4">
                    {/* Total Ganancias */}
                    <div className="bg-white rounded shadow-sm border border-gray-200">
                        <div className="p-3 border-b border-gray-200 flex items-center gap-2">
                            <DollarSign size={14} className="text-gray-500" />
                            <h6 className="text-[13px] font-semibold text-gray-700">Total Ganancias</h6>
                        </div>
                        <div className="p-5 text-center">
                            <p className="text-[28px] font-bold text-gray-800">{formatMoney(detalles.total_ganancia)}</p>
                            <span className="text-[11px] text-gray-400">Monto Total Ganancias Generales</span>
                        </div>
                    </div>

                    {/* Números Ganadores */}
                    {detalles.premio_id && (
                        <div className="bg-white rounded shadow-sm border border-gray-200">
                            <div className="p-3 border-b border-gray-200 flex items-center gap-2">
                                <List size={14} className="text-gray-500" />
                                <h6 className="text-[13px] font-semibold text-gray-700">Números Ganadores</h6>
                            </div>
                            <div className="p-4 text-center">
                                <p className="text-[26px] font-bold text-gray-800 tracking-wider">{detalles.numeros_ganadores || '—'}</p>
                            </div>
                        </div>
                    )}

                    {/* Resultado del Sorteo */}
                    <div className="bg-white rounded shadow-sm border border-gray-200">
                        <div className="p-3 border-b border-gray-200 flex items-center gap-2">
                            <List size={14} className="text-gray-500" />
                            <h6 className="text-[13px] font-semibold text-gray-700">Resultado del Sorteo</h6>
                        </div>
                        <table className="w-full text-[12px]">
                            <tbody>
                                <tr className="border-b border-gray-100"><td className="px-3 py-2 text-gray-500">🎫 Total tickets vendidos:</td><td className="text-right px-3 py-2 font-medium">{detalles.cantidad_tickets}</td></tr>
                                <tr className="border-b border-gray-100"><td className="px-3 py-2 text-gray-500">🎫 Total tickets nulos:</td><td className="text-right px-3 py-2 font-medium">{detalles.cantidad_tickets_anulados}</td></tr>
                                <tr className="border-b border-gray-100"><td className="px-3 py-2 text-gray-500">🏆 Total tickets premiados:</td><td className="text-right px-3 py-2 font-medium">{detalles.cantidad_tickets_premiados}</td></tr>
                                <tr className="border-b border-gray-100"><td className="px-3 py-2 text-gray-500">🎫 Total tickets pagados:</td><td className="text-right px-3 py-2 font-medium">{detalles.cantidad_tickets_pagados}</td></tr>
                                <tr className="border-b border-gray-100"><td className="px-3 py-2 text-gray-500">💰 Monto ventas:</td><td className="text-right px-3 py-2 font-medium">{formatMoney(detalles.total_vendido)}</td></tr>
                                <tr className="border-b border-gray-100"><td className="px-3 py-2 text-gray-500">💰 Monto premiado:</td><td className="text-right px-3 py-2 font-medium">{formatMoney(detalles.total_premiados)}</td></tr>
                                <tr><td className="px-3 py-2 text-gray-500">💰 Monto pagado:</td><td className="text-right px-3 py-2 font-medium">{formatMoney(detalles.total_pagados || 0)}</td></tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Detalle del Sorteo */}
                    <div className="bg-white rounded shadow-sm border border-gray-200">
                        <div className="p-3 border-b border-gray-200 flex items-center gap-2">
                            <List size={14} className="text-gray-500" />
                            <h6 className="text-[13px] font-semibold text-gray-700">Detalle del Sorteo</h6>
                        </div>
                        <table className="w-full text-[12px]">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="px-3 py-2 text-gray-500 flex items-center gap-1"><HomeIcon size={12} /> Lotería:</td>
                                    <td className="text-right px-3 py-2 text-[#1E88E5]">{detalles.loteria_nombre}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-3 py-2 text-gray-500">📋 Sorteo:</td>
                                    <td className="text-right px-3 py-2 text-[#1E88E5]">{detalles.sorteo_nombre}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-3 py-2 text-gray-500 flex items-center gap-1"><Hash size={12} /> # Sorteo:</td>
                                    <td className="text-right px-3 py-2">{detalles.sorteo_numero}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-3 py-2 text-gray-500 flex items-center gap-1"><Calendar size={12} /> Cierre:</td>
                                    <td className="text-right px-3 py-2 text-[11px]">{detalles.fecha_cierre_sorteo ? new Date(detalles.fecha_cierre_sorteo).toLocaleString('es-DO') : ''}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-3 py-2 text-gray-500">📄 Estado:</td>
                                    <td className="text-right px-3 py-2">{isCerrado ? 'CERRADO' : 'PENDIENTE'}</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2 text-gray-500">
                                        {detalles.total_premiados > 0 ? '🟢' : detalles.premio_id ? '🔵' : isCerrado ? '🔵' : '🟡'} Resolución:
                                    </td>
                                    <td className="text-right px-3 py-2">
                                        {detalles.total_premiados > 0 ? 'Premiado'
                                            : detalles.total_premiados === 0 && detalles.premio_id ? 'Premiación realizada'
                                                : isCerrado ? 'Esperando premiación'
                                                    : 'En espera de sorteo'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
