import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, RotateCcw, Info, Download, Dices, MapPin, DollarSign } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const TicketConsult: React.FC = () => {
    const { token } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [serialInput, setSerialInput] = useState(searchParams.get('serial') || '');
    const [ticket, setTicket] = useState<any>(null);
    const [jugadas, setJugadas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const qsSerial = searchParams.get('serial');

    const fetchTicket = async (serial: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const sistemaId = localStorage.getItem('sistema_id') || '1';
            const res = await fetch(`/api/ticket?serial=${serial}&sistema_id=${sistemaId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                if (res.status === 404) {
                    setError(`No se encontró ticket con serial ${serial}`);
                    setTicket(null);
                    setJugadas([]);
                    return;
                }
                throw new Error('Server error');
            }

            const data = await res.json();
            setTicket(data.ticket);
            setJugadas(data.jugadas);
        } catch (err: any) {
            setError(err.message || 'Error al buscar el ticket');
            setTicket(null);
            setJugadas([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (qsSerial) {
            setSerialInput(qsSerial);
            fetchTicket(qsSerial);
        } else {
            setTicket(null);
            setJugadas([]);
        }
    }, [qsSerial, token]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (serialInput.trim()) {
            setSearchParams({ serial: serialInput.trim() });
        }
    };

    const handleClear = () => {
        setSerialInput('');
        setSearchParams({});
    };

    // Helper functions for formatting
    const formatMoney = (val: string | number) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num || 0);
    };

    return (
        <div className="p-5">
            {/* Page Header */}
            <div className="mb-5">
                <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                    <h4 className="text-[15px] text-gray-700 flex items-center gap-2">
                        <Link to="/" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={16} /></Link>
                        <span className="font-semibold">Consultar Ticket</span>
                    </h4>
                    <div className="text-[12px] text-gray-500">
                        <Link to="/" className="hover:underline">Home</Link> › Control de Premios ›{' '}
                        <span className="text-gray-700 font-medium">Consultar Ticket</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-[#f2dede] border border-[#ebccd1] text-[#a94442] px-4 py-3 rounded mb-5 flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-[#a94442] hover:opacity-75 font-bold">×</button>
                </div>
            )}

            {/* Search Panel */}
            <div className="bg-white border-t-[3px] border-[#2196F3] rounded shadow-sm mb-5">
                <div className="p-4 border-b border-gray-200">
                    <h5 className="text-[14px] font-medium text-gray-700 flex items-center gap-2">
                        <Search size={16} className="text-[#2196F3]" /> Consultar Ticket
                    </h5>
                </div>
                <div className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-3 items-end">
                        <div className="flex-1 max-w-[400px]">
                            <label className="block text-[12px] text-gray-600 mb-1 font-medium">Serial del Ticket:</label>
                            <input
                                type="text"
                                value={serialInput}
                                onChange={(e) => setSerialInput(e.target.value)}
                                className="w-full h-[36px] bg-[#fafafa] border border-gray-300 rounded px-3 text-[13px] outline-none focus:border-[#2196f3]"
                                placeholder="Ejemplo: ABC123456"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="h-[36px] bg-[#4CAF50] hover:bg-[#43a047] text-white px-4 rounded text-[13px] font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            <Search size={14} /> Buscar
                        </button>
                        {qsSerial && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="h-[36px] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 rounded text-[13px] font-medium transition-colors flex items-center gap-2"
                            >
                                <RotateCcw size={14} /> Limpiar
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="flex justify-center p-10">
                    <div className="animate-spin w-8 h-8 border-4 border-[#2196F3] border-t-transparent rounded-full"></div>
                </div>
            )}

            {/* Ticket Information */}
            {ticket && !isLoading && (
                <>
                    <div className="bg-white border-t-[3px] border-[#00BCD4] rounded shadow-sm mb-5">
                        <div className="p-5">
                            {/* Datos Basicos */}
                            <div className="flex justify-between items-center mb-4">
                                <h6 className="text-[14px] font-semibold text-[#2196F3] flex items-center gap-2">
                                    <Info size={16} /> Datos Básicos del Ticket
                                </h6>
                                <button className="bg-[#2196f3] text-white text-[12px] px-3 py-[5px] rounded flex items-center gap-2 hover:bg-[#1e88e5]">
                                    <Download size={14} /> Descargar
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mb-5 text-[13px]">
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Serial:</h6>
                                    <p className="text-gray-500">{ticket.serial}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Fecha Ticket:</h6>
                                    <p className="text-gray-500">{ticket.fecha_ticket} {ticket.hora_ticket}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Cantidad Jugadas:</h6>
                                    <p className="text-gray-500">{ticket.cantidad_jugadas}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Monto Total:</h6>
                                    <p className="text-gray-500">{formatMoney(ticket.monto_total)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mb-5 text-[13px]">
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Fecha Recepción Kontrola:</h6>
                                    <p className="text-gray-500">{ticket.fecha_creacion}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Anulado:</h6>
                                    {ticket.anulado === 'Si' ? (
                                        <>
                                            <span className="inline-block bg-[#F44336] text-white text-[11px] px-2 py-[2px] rounded mb-1">{ticket.anulado}</span>
                                            <p className="text-[11px] text-gray-500">{ticket.fecha_anulacion} {ticket.hora_anulacion}</p>
                                            <p className="text-[11px] text-gray-500">Por: {ticket.usuario_anulacion}</p>
                                        </>
                                    ) : (
                                        <span className="inline-block bg-[#4CAF50] text-white text-[11px] px-2 py-[2px] rounded">{ticket.anulado}</span>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <h6 className="font-bold text-gray-700 mb-1">Pagado:</h6>
                                    {ticket.pagado === 'Si' ? (
                                        <>
                                            <span className="inline-block bg-[#4CAF50] text-white text-[11px] px-2 py-[2px] rounded mb-1">{ticket.pagado}</span>
                                            <p className="text-[11px] text-gray-500">{formatMoney(ticket.monto_pagar)}</p>
                                            <p className="text-[11px] text-gray-500">{ticket.fecha_pago} {ticket.hora_pago}</p>
                                            <p className="text-[11px] text-gray-500">Por: {ticket.usuario_pago}</p>
                                        </>
                                    ) : (
                                        <span className="inline-block bg-gray-400 text-white text-[11px] px-2 py-[2px] rounded">{ticket.pagado}</span>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-200 my-5" />

                            {/* Datos Sorteo */}
                            <h6 className="text-[14px] font-semibold text-[#4CAF50] flex items-center gap-2 mb-4">
                                <Dices size={16} /> Información del Sorteo
                            </h6>
                            <div className="grid grid-cols-4 gap-4 mb-5 text-[13px]">
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Número Sorteo:</h6>
                                    <p className="text-gray-500">{ticket.numero_sorteo}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Nombre Sorteo:</h6>
                                    <p className="text-gray-500">{ticket.nombre_sorteo}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Lotería:</h6>
                                    <p className="text-gray-500">{ticket.loteria}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-5 text-[13px]">
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Fecha Sorteo:</h6>
                                    <p className="text-gray-500">{ticket.fecha_sorteo}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Hora Cierre:</h6>
                                    <p className="text-gray-500">{ticket.hora_cierre}</p>
                                </div>
                            </div>

                            <hr className="border-gray-200 my-5" />

                            {/* Ubicación Terminal */}
                            <h6 className="text-[14px] font-semibold text-[#00BCD4] flex items-center gap-2 mb-4">
                                <MapPin size={16} /> Ubicación y Terminal
                            </h6>
                            <div className="grid grid-cols-4 gap-4 mb-5 text-[13px]">
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Consorcio:</h6>
                                    <p className="text-gray-500">{ticket.consorcio}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Banca:</h6>
                                    <p className="text-gray-500">{ticket.banca}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Agencia:</h6>
                                    <p className="text-gray-500">{ticket.agencia}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Terminal:</h6>
                                    <p className="text-gray-500">{ticket.terminal}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-[13px]">
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Zona:</h6>
                                    <p className="text-gray-500">{ticket.zona}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Ciudad:</h6>
                                    <p className="text-gray-500">{ticket.ciudad}</p>
                                </div>
                                <div>
                                    <h6 className="font-bold text-gray-700 mb-1">Operador:</h6>
                                    <p className="text-gray-500">{ticket.operador}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Jugadas */}
                    <div className="bg-white rounded shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h5 className="text-[14px] font-medium text-[#4CAF50] flex items-center gap-2">
                                <DollarSign size={16} /> Jugadas del Ticket
                            </h5>
                            <span className="bg-[#29B6F6] text-white text-[11px] px-2 py-1 rounded font-medium">
                                Total: {jugadas.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-gray-700">
                                        <th className="px-4 py-3 font-semibold">ID</th>
                                        <th className="px-4 py-3 font-semibold">Número Jugada</th>
                                        <th className="px-4 py-3 font-semibold">Cantidad Apuesta</th>
                                        <th className="px-4 py-3 font-semibold">Monto Apuesta</th>
                                        <th className="px-4 py-3 font-semibold">Producto</th>
                                        <th className="px-4 py-3 font-semibold">Premiado</th>
                                        <th className="px-4 py-3 font-semibold">Monto Premiado</th>
                                        <th className="px-4 py-3 font-semibold">Anulado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jugadas.map((jugada, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                                            <td className="px-4 py-3 text-gray-600">{jugada.jugada_id}</td>
                                            <td className="px-4 py-3">
                                                <h6 className="font-bold text-gray-700 m-0">
                                                    {Array.isArray(jugada.numero_jugada) ? jugada.numero_jugada.join('-') : jugada.numero_jugada}
                                                </h6>
                                                <small className="text-[11px] text-gray-400 block mt-1">ID: {jugada.jugada_id}</small>
                                            </td>
                                            <td className="px-4 py-3">
                                                <h6 className="font-bold text-gray-700 m-0">{formatMoney(jugada.cantidad_apuesta)}</h6>
                                                <small className="text-[11px] text-gray-400 block mt-1">Apuesta total</small>
                                            </td>
                                            <td className="px-4 py-3">
                                                <h6 className="font-bold text-gray-700 m-0">{formatMoney(jugada.monto_apuesta)}</h6>
                                                <small className="text-[11px] text-gray-400 block mt-1">Monto jugado</small>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-[12px] text-gray-600">
                                                    <span className="w-[3px] h-[12px] bg-[#2196F3] inline-block rounded-sm"></span>
                                                    {jugada.producto}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {jugada.premiado === 'Si' ? (
                                                    <span className="inline-block bg-[#4CAF50] text-white text-[11px] px-2 py-[2px] rounded">Si</span>
                                                ) : jugada.premiado === 'No' ? (
                                                    <span className="inline-block bg-gray-400 text-white text-[11px] px-2 py-[2px] rounded">No</span>
                                                ) : null}
                                            </td>
                                            <td className="px-4 py-3">
                                                <h6 className="font-bold text-gray-700 m-0">{formatMoney(jugada.monto_premiado)}</h6>
                                                <small className="text-[11px] text-gray-400 block mt-1">Premio recibido</small>
                                            </td>
                                            <td className="px-4 py-3">
                                                {jugada.anulado === 'Si' ? (
                                                    <span className="inline-block bg-[#F44336] text-white text-[11px] px-2 py-[2px] rounded">Si</span>
                                                ) : (
                                                    <span className="inline-block bg-[#4CAF50] text-white text-[11px] px-2 py-[2px] rounded">No</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {jugadas.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                                No se encontraron jugadas registradas para este ticket.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
