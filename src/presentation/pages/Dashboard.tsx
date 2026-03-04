import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Ticket, Medal, DollarSign, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Sorteo {
    premio_id: number | null;
    loteria_id: number;
    loteria_nombre: string;
    sorteo_id: string;
    sorteo_nombre: string;
    sorteo_numero: number;
    fecha_sorteo: string;
    hora_cierre: string;
    fecha_cierre_sorteo: string;
    sorteo_cerrado: string;
    cantidad_tickets: number;
    cantidad_tickets_post: number;
    cantidad_tickets_anulado: number;
    monto_apuesta: number;
    monto_apostado_post: number;
    cantidad_tickets_premiado: number;
    monto_premiado: number;
    cantidad_tickets_pagado: number;
    monto_pagado: number;
}

interface Consorcio { consorcio_id: number; nombre: string; }
interface Loteria { loteria_id: number; nombre: string; }

const formatMoney = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('es-DO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

export const Dashboard = () => {
    const { token, user } = useAuth();
    const [sorteos, setSorteos] = useState<Sorteo[]>([]);
    const [totalJugado, setTotalJugado] = useState(0);
    const [totalPremiado, setTotalPremiado] = useState(0);
    const [totalGanancias, setTotalGanancias] = useState(0);
    const [consorcios, setConsorcios] = useState<Consorcio[]>([]);
    const [loterias, setLoterias] = useState<Loteria[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [tipoBusqueda, setTipoBusqueda] = useState('1');
    const [initialDate, setInitialDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [finalDate, setFinalDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [numeroSorteo, setNumeroSorteo] = useState('');
    const [consorcioId, setConsorcioId] = useState('');
    const [loteriaId, setLoteriaId] = useState('');
    const [inclExpress, setInclExpress] = useState(false);
    const [inclRuleta, setInclRuleta] = useState(false);

    // Dropdown visibility
    const [showConsorcio, setShowConsorcio] = useState(false);
    const [showLoteria, setShowLoteria] = useState(false);

    const fetchSorteos = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (tipoBusqueda === '2' && numeroSorteo) {
                params.set('tipo', '2');
                params.set('numero_sorteo', numeroSorteo);
            } else {
                params.set('tipo', '1');
                params.set('initial_date', initialDate);
                params.set('final_date', finalDate);
            }
            if (consorcioId) params.set('consorcio_id', consorcioId);
            if (loteriaId) params.set('loteria_id', loteriaId);
            if (inclExpress) params.set('incluir_express', 'on');
            if (inclRuleta) params.set('incluir_ruleta', 'on');

            params.set('sistema_id', localStorage.getItem('sistema_id') || '1');

            const res = await fetch(`/api/sorteos?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                setSorteos(data.sorteos);
                setTotalJugado(data.detalles.total_jugado);
                setTotalPremiado(data.detalles.total_premiado);
                setTotalGanancias(data.detalles.total_ganancias);
                setConsorcios(data.consorcios);
                setLoterias(data.loterias);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [token, tipoBusqueda, initialDate, finalDate, numeroSorteo, consorcioId, loteriaId, inclExpress, inclRuleta]);

    useEffect(() => { fetchSorteos(); }, []);

    const handleBuscar = (e: React.FormEvent) => {
        e.preventDefault();
        fetchSorteos();
    };

    const selectedConsorcioName = consorcioId
        ? consorcios.find(c => String(c.consorcio_id) === consorcioId)?.nombre || 'Consorcio'
        : 'Por Consorcio';
    const selectedLoteriaName = loteriaId
        ? loterias.find(l => String(l.loteria_id) === loteriaId)?.nombre || 'Loteria'
        : 'Por Lotería';

    const isSuperAdmin = user?.consorcioId === 1;

    return (
        <div className="p-5">
            {/* Page Header */}
            <div className="mb-5">
                <div className="bg-white p-4 border-b border-gray-200">
                    <h4 className="text-[15px] text-gray-700 flex items-center gap-2">
                        <ArrowLeft size={16} className="text-gray-400" />
                        <span className="font-semibold">Resumen de Resultados</span> — Jugadas y Premios
                    </h4>
                </div>
                <div className="bg-[#fafafa] border-b border-gray-200 px-4 py-2 text-[12px] text-gray-500">
                    <span>Home</span> › <span>Control de Premios</span> › <span className="text-gray-700">Jugadas y Premios</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                {/* Total Ventas */}
                <div className="bg-[#607D8B] rounded p-5 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-[22px] font-bold">{formatMoney(totalJugado)}</h3>
                        <span className="text-[10px] uppercase tracking-wider opacity-80">Total Ventas</span>
                    </div>
                    <Ticket size={40} className="opacity-50" />
                </div>
                {/* Total Premios */}
                <div className="bg-[#FF9800] rounded p-5 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-[22px] font-bold">{formatMoney(totalPremiado)}</h3>
                        <span className="text-[10px] uppercase tracking-wider opacity-80">Total Premios</span>
                    </div>
                    <Medal size={40} className="opacity-50" />
                </div>
                {/* Ganancias */}
                <div className="bg-[#009688] rounded p-5 text-white flex items-center justify-between">
                    <div className="text-right w-full">
                        <h3 className="text-[22px] font-bold">{formatMoney(totalGanancias)}</h3>
                        <span className="text-[10px] uppercase tracking-wider opacity-80">Ganancias</span>
                    </div>
                    <DollarSign size={40} className="opacity-50 order-first" />
                </div>
            </div>

            {/* Panel */}
            <div className="bg-white rounded shadow-sm border border-gray-200">
                {/* Panel Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h5 className="text-[14px] font-semibold text-gray-700">
                        F10 - Resumen Pre-Cierre y Post-Cierre
                        <span className="ml-2 bg-[#29B6F6] text-white text-[10px] px-2 py-[2px] rounded">SORTEOS MULTIPLES</span>
                    </h5>
                </div>

                {/* Filters */}
                <form onSubmit={handleBuscar} className="bg-[#fafafa] border-b border-gray-200 px-4 py-3 flex flex-wrap items-center gap-3 text-[13px]">
                    <span className="text-gray-500 font-medium">Filtros de Búsqueda:</span>

                    {/* Tipo búsqueda */}
                    <div className="relative">
                        <select
                            value={tipoBusqueda}
                            onChange={(e) => setTipoBusqueda(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-[6px] text-[12px] bg-white pr-6"
                        >
                            <option value="1">📅 Por Fecha</option>
                            <option value="2">⚙ Por Número Sorteo</option>
                        </select>
                    </div>

                    {/* Date / Sorteo number */}
                    {tipoBusqueda === '1' ? (
                        <div className="flex items-center gap-2">
                            <input type="date" value={initialDate} onChange={e => setInitialDate(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-[5px] text-[12px]" />
                            <span className="text-gray-400">—</span>
                            <input type="date" value={finalDate} onChange={e => setFinalDate(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-[5px] text-[12px]" />
                        </div>
                    ) : (
                        <input type="text" placeholder="Número sorteo" value={numeroSorteo}
                            onChange={e => setNumeroSorteo(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-[5px] text-[12px] w-[160px]" />
                    )}

                    {/* Consorcio dropdown (only superadmin) */}
                    {isSuperAdmin && (
                        <div className="relative">
                            <button type="button" onClick={() => { setShowConsorcio(!showConsorcio); setShowLoteria(false); }}
                                className="border border-gray-300 rounded px-3 py-[5px] text-[12px] bg-white flex items-center gap-1">
                                {selectedConsorcioName} <ChevronDown size={12} />
                            </button>
                            {showConsorcio && (
                                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded shadow-lg z-40 min-w-[180px] max-h-[240px] overflow-y-auto">
                                    <button type="button" onClick={() => { setConsorcioId(''); setShowConsorcio(false); }}
                                        className="w-full text-left px-3 py-2 text-[12px] hover:bg-gray-100">Mostrar Todos</button>
                                    <hr />
                                    {consorcios.map(c => (
                                        <button type="button" key={c.consorcio_id}
                                            onClick={() => { setConsorcioId(String(c.consorcio_id)); setShowConsorcio(false); }}
                                            className="w-full text-left px-3 py-2 text-[12px] hover:bg-gray-100">{c.nombre}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loteria dropdown */}
                    <div className="relative">
                        <button type="button" onClick={() => { setShowLoteria(!showLoteria); setShowConsorcio(false); }}
                            className="border border-gray-300 rounded px-3 py-[5px] text-[12px] bg-white flex items-center gap-1">
                            {selectedLoteriaName} <ChevronDown size={12} />
                        </button>
                        {showLoteria && (
                            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded shadow-lg z-40 min-w-[180px] max-h-[240px] overflow-y-auto">
                                <button type="button" onClick={() => { setLoteriaId(''); setShowLoteria(false); }}
                                    className="w-full text-left px-3 py-2 text-[12px] hover:bg-gray-100">Mostrar Todos</button>
                                <hr />
                                {loterias.map(l => (
                                    <button type="button" key={l.loteria_id}
                                        onClick={() => { setLoteriaId(String(l.loteria_id)); setShowLoteria(false); }}
                                        className="w-full text-left px-3 py-2 text-[12px] hover:bg-gray-100">{l.nombre}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Express / Ruleta checkboxes */}
                    <span className="text-gray-500 ml-auto">Incluir Express:</span>
                    <label className="flex items-center gap-1 text-[12px]">
                        <input type="checkbox" checked={inclExpress} onChange={e => setInclExpress(e.target.checked)} /> Chance
                    </label>
                    <label className="flex items-center gap-1 text-[12px]">
                        <input type="checkbox" checked={inclRuleta} onChange={e => setInclRuleta(e.target.checked)} /> Ruleta
                    </label>

                    <button type="submit"
                        className="bg-[#4CAF50] text-white px-6 py-[6px] rounded text-[12px] font-medium hover:bg-[#43A047] transition-colors ml-2">
                        Buscar
                    </button>
                </form>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                        <thead>
                            <tr className="bg-[#fafafa] border-b border-gray-200 text-gray-600 text-left">
                                <th className="px-4 py-3">Lotería</th>
                                <th className="px-4 py-3">Sorteo</th>
                                <th className="px-4 py-3">Hora Cierre</th>
                                <th className="px-4 py-3">Fecha Sorteo</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Resolución</th>
                                <th className="px-4 py-3">Total Ventas</th>
                                <th className="px-4 py-3">Total Premios</th>
                                <th className="px-4 py-3">Total Pagos</th>
                                <th className="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-10 text-gray-400">Cargando sorteos...</td>
                                </tr>
                            ) : sorteos.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-10 text-gray-400">No se encontraron sorteos para los filtros seleccionados.</td>
                                </tr>
                            ) : sorteos.map((s, i) => (
                                <tr key={`${s.sorteo_id}-${i}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">{s.loteria_nombre}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-[#1E88E5] font-medium">{s.sorteo_nombre}</span>
                                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-[2px]">
                                            <span className="w-[6px] h-[6px] rounded-full bg-blue-400 inline-block"></span>
                                            Sorteo No.{s.sorteo_numero}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{s.hora_cierre}</td>
                                    <td className="px-4 py-3">{formatDate(s.fecha_sorteo)}</td>
                                    <td className="px-4 py-3">
                                        {s.sorteo_cerrado === 'CERRADO' ? (
                                            s.cantidad_tickets_post > 0
                                                ? <span className="bg-red-500 text-white text-[10px] px-2 py-[2px] rounded">Con diferencias</span>
                                                : <span className="bg-[#2196F3] text-white text-[10px] px-2 py-[2px] rounded">Cerrado</span>
                                        ) : (
                                            <span className="bg-gray-400 text-white text-[10px] px-2 py-[2px] rounded">Pendiente</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-[11px]">
                                        {s.monto_premiado > 0 ? (
                                            <span className="text-green-600 flex items-center gap-1">● Premiado</span>
                                        ) : s.monto_premiado === 0 && s.premio_id ? (
                                            <span className="text-blue-500 flex items-center gap-1">● Premiación realizada</span>
                                        ) : s.sorteo_cerrado === 'CERRADO' ? (
                                            <span className="text-blue-400 flex items-center gap-1">● Esperando premiación</span>
                                        ) : (
                                            <span className="text-amber-500 flex items-center gap-1">● En espera de sorteo</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold">{formatMoney(s.monto_apuesta)}</span>
                                        <div className="text-[10px] text-gray-400">Tickets Válidos: {s.cantidad_tickets}</div>
                                        <div className="text-[10px] text-gray-400">Tickets Nulos: {s.cantidad_tickets_anulado}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold">{formatMoney(s.monto_premiado)}</span>
                                        <div className="text-[10px] text-gray-400">Tickets Premiados: {s.cantidad_tickets_premiado}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold">{formatMoney(s.monto_pagado)}</span>
                                        <div className="text-[10px] text-gray-400">Tickets Pagados: {s.cantidad_tickets_pagado}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <Link to={`/sorteo/${s.sorteo_id}`}
                                                className="border border-gray-300 text-gray-600 text-[10px] px-3 py-[3px] rounded-full hover:bg-gray-100 transition-colors">
                                                Ver detalles
                                            </Link>
                                            {s.monto_premiado > 0 && (
                                                <button className="border border-gray-300 text-gray-600 text-[10px] px-3 py-[3px] rounded-full hover:bg-gray-100 transition-colors">
                                                    Ventas y premios
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
