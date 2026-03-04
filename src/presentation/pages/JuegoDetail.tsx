import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, List, Home as HomeIcon, Hash, Calendar, FileDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Jugada {
    numero_apuesta: string;
    cantidad_apuesta: number;
    monto_apuesta: number;
    cantidad_apuesta_post: number;
    monto_apuesta_post: number;
}

interface Detalles {
    sorteo_nombre: string;
    sorteo_numero: number;
    loteria_nombre: string;
    juego_nombre: string;
    fecha_sorteo: string;
    fecha_cierre_sorteo: string;
    hora_cierre: string;
    sorteo_cerrado: number;
}

const formatMoney = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export const JuegoDetail = () => {
    const { sorteo_id, juego_id } = useParams<{ sorteo_id: string; juego_id: string }>();
    const { token } = useAuth();

    const [jugadas, setJugadas] = useState<Jugada[]>([]);
    const [detalles, setDetalles] = useState<Detalles | null>(null);
    const [totalGanancias, setTotalGanancias] = useState(0);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchDetail = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const consorcioId = urlParams.get('consorcio_id') || '';
            const query = new URLSearchParams({
                sorteo_id: sorteo_id || '',
                juego_id: juego_id || '',
                page: page.toString(),
                sistema_id: localStorage.getItem('sistema_id') || '1'
            });
            if (consorcioId) query.set('consorcio_id', consorcioId);

            const res = await fetch(`/api/juego-detail?${query.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                setJugadas(data.jugadas);
                if (data.detalles && Object.keys(data.detalles).length > 0) {
                    setDetalles(data.detalles);
                }
                setTotalGanancias(data.total_ganancias);
                setTotalPages(data.total_pages);
                setCurrentPage(data.current_page);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [sorteo_id, juego_id, token]);

    useEffect(() => {
        fetchDetail(currentPage);
    }, [fetchDetail, currentPage]);

    if (loading && jugadas.length === 0) {
        return (
            <div className="p-10 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#3B95B0] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!detalles) {
        return <div className="p-10 text-gray-500 text-center">No se encontraron datos para este juego.</div>;
    }

    const isCerrado = detalles.sorteo_cerrado === 1;

    return (
        <div className="p-5">
            {/* Page Header */}
            <div className="mb-5">
                <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                    <h4 className="text-[15px] text-gray-700 flex items-center gap-2">
                        <Link to={`/sorteo/${sorteo_id}`} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={16} /></Link>
                        <span className="font-semibold">Resultado Sorteo</span>
                    </h4>
                    <div className="text-[12px] text-gray-500">
                        <Link to="/" className="hover:underline">Home</Link> › Control de Premios ›{' '}
                        <Link to="/" className="hover:underline">Resultados Sorteos y Premios</Link> ›{' '}
                        <Link to={`/sorteo/${sorteo_id}`} className="hover:underline">Sorteo {detalles.sorteo_numero}:{detalles.sorteo_nombre}</Link> ›{' '}
                        <span className="text-gray-700 font-medium">Juego {juego_id}:{detalles.juego_nombre}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-5">
                {/* Left Column - Main Table */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded shadow-sm border border-gray-200 mb-5 pb-2">
                        <div className="p-4 border-b border-gray-200">
                            <h5 className="text-[14px] font-semibold text-gray-700">
                                Detalle Juego {juego_id}:{detalles.juego_nombre}
                            </h5>
                        </div>

                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-[12px] border border-gray-200">
                                <thead>
                                    <tr className="bg-[#fafafa] border-b border-gray-200 text-gray-600">
                                        <th rowSpan={2} className="px-3 py-2 text-center border-r border-gray-200 align-middle">Número Apuesta</th>
                                        <th colSpan={2} className="px-3 py-2 text-center font-bold border-r border-gray-200 text-[13px]">Pre Sorteo</th>
                                        <th colSpan={2} className="px-3 py-2 text-center font-bold border-r border-gray-200 text-[13px]">Post Sorteo</th>
                                        <th rowSpan={2} className="px-3 py-2 text-center align-middle">Estado</th>
                                    </tr>
                                    <tr className="bg-[#fafafa] border-b border-gray-200 text-gray-600">
                                        <th className="px-3 py-2 text-center border-r border-gray-200 font-medium">Total Apuestas</th>
                                        <th className="px-3 py-2 text-center border-r border-gray-200 font-medium">Total Monto Apostado</th>
                                        <th className="px-3 py-2 text-center border-r border-gray-200 font-medium">Total Apuestas</th>
                                        <th className="px-3 py-2 text-center border-r border-gray-200 font-medium">Total Monto Apostado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jugadas.map((j, i) => {
                                        const withDifference = j.cantidad_apuesta_post > j.cantidad_apuesta;
                                        return (
                                            <tr key={i} className={`border-b border-gray-100 ${withDifference ? 'bg-[#fee8e7] border-[#fbbbb7]' : 'hover:bg-gray-50'}`}>
                                                <td className="px-3 py-2 text-center border-r border-gray-200">{j.numero_apuesta}</td>
                                                <td className="px-3 py-2 text-center border-r border-gray-200">{j.cantidad_apuesta}</td>
                                                <td className="px-3 py-2 text-center border-r border-gray-200">{formatMoney(j.monto_apuesta)}</td>

                                                {isCerrado ? (
                                                    <>
                                                        <td className="px-3 py-2 text-center border-r border-gray-200 bg-black/[.015]">{j.cantidad_apuesta_post}</td>
                                                        <td className="px-3 py-2 text-center border-r border-gray-200 bg-black/[.015]">{formatMoney(j.monto_apuesta_post)}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-3 py-2 text-center border-r border-gray-200 bg-black/[.015]">0</td>
                                                        <td className="px-3 py-2 text-center border-r border-gray-200 bg-black/[.015]">$0</td>
                                                    </>
                                                )}

                                                <td className="px-3 py-2 text-center">
                                                    {withDifference ? (
                                                        <span className="bg-red-500 text-white text-[10px] px-2 py-[3px] rounded">CON DIFERENCIAS</span>
                                                    ) : (
                                                        <span className="bg-green-500 text-white text-[10px] px-2 py-[3px] rounded">CORRECTO</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {jugadas.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-6 text-center text-gray-500">No hay jugadas registradas para este juego.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-5 py-3 flex items-center justify-between border-t border-gray-100">
                                <span className="text-[12px] text-gray-500">Mostrando página {currentPage} de {totalPages}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1 || loading}
                                        className="px-3 py-1 border border-gray-200 text-gray-600 rounded text-[12px] hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || loading}
                                        className="px-3 py-1 border border-gray-200 text-gray-600 rounded text-[12px] hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-[280px] flex-shrink-0 space-y-4">
                    {/* Total Vendido */}
                    <div className="bg-white rounded shadow-sm border border-gray-200">
                        <div className="p-3 border-b border-gray-200 flex items-center gap-2">
                            <DollarSign size={14} className="text-gray-500" />
                            <h6 className="text-[13px] font-semibold text-gray-700">Total Vendido</h6>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-[24px] font-bold text-[#1E88E5]">{formatMoney(totalGanancias)}</p>
                            <span className="text-[11px] text-gray-500 mt-1 block">Total Vendido para juego: {detalles.juego_nombre}</span>
                        </div>
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
                                    <td className="px-3 py-2 text-gray-500 flex items-center gap-1"><Hash size={12} /> Sorteo:</td>
                                    <td className="text-right px-3 py-2 text-[#1E88E5]">{detalles.sorteo_nombre}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-3 py-2 text-gray-500 flex items-center gap-1"><List size={12} /> # Sorteo:</td>
                                    <td className="text-right px-3 py-2">{detalles.sorteo_numero}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-3 py-2 text-gray-500 flex items-center gap-1"><Calendar size={12} /> Cierre:</td>
                                    <td className="text-right px-3 py-2 text-[11px]">{detalles.fecha_cierre_sorteo ? new Date(detalles.fecha_cierre_sorteo).toLocaleString('es-DO') : ''}</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2 text-gray-500 flex items-center gap-1"><FileDown size={12} /> Estado:</td>
                                    <td className="text-right px-3 py-2 font-medium">{isCerrado ? 'CERRADO' : 'PENDIENTE'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
