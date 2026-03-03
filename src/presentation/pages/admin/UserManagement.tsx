import React, { useState, useEffect } from 'react';
import { Pencil, UserPlus, Check, X, Shield, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserManagement: React.FC = () => {
    const { token, user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [consorcios, setConsorcios] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

    // Form fields
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        consorcioId: '',
        isActive: true,
        isStaff: false,
        forcePasswordChange: true
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, consorciosRes] = await Promise.all([
                fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/consorcios', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (usersRes.ok && consorciosRes.ok) {
                const usersData = await usersRes.json();
                const consorciosData = await consorciosRes.json();
                setUsers(usersData.users);
                setConsorcios(consorciosData.consorcios);
            }
        } catch (err) {
            console.error('Data fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.isStaff) {
            fetchData();
        }
    }, [user, token]);

    const handleOpenModal = (rowUser?: any) => {
        setError(null);
        setSuccessMsg(null);
        setGeneratedPassword(null);
        if (rowUser) {
            setIsEditing(true);
            setEditingUserId(rowUser.id);
            setFormData({
                email: rowUser.email,
                firstName: rowUser.first_name || '',
                lastName: rowUser.last_name || '',
                consorcioId: rowUser.consorcio_id ? String(rowUser.consorcio_id) : '',
                isActive: rowUser.is_active === 1 || rowUser.is_active === true,
                isStaff: rowUser.is_staff === 1 || rowUser.is_staff === true,
                forcePasswordChange: rowUser.force_password_change === 1 || rowUser.force_password_change === true
            });
        } else {
            setIsEditing(false);
            setEditingUserId(null);
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                consorcioId: '',
                isActive: true,
                isStaff: false,
                forcePasswordChange: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setGeneratedPassword(null);

        try {
            const url = isEditing && editingUserId
                ? `/api/admin/users/${editingUserId}`
                : '/api/admin/users';

            const method = isEditing ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                consorcioId: formData.consorcioId ? parseInt(formData.consorcioId) : null
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error saving user');
            }

            setSuccessMsg(data.message);
            if (!isEditing && data.password) {
                setGeneratedPassword(data.password);
            } else {
                fetchData();
                handleCloseModal();
            }

        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado');
        }
    };

    if (!user?.isStaff) {
        return <div className="p-10 text-center text-gray-500">Access Denied</div>;
    }

    return (
        <div className="p-5">
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h2 className="text-[20px] font-bold text-gray-800 flex items-center gap-2">
                        <Users size={20} className="text-[#3B95B0]" />
                        Gestión de Usuarios
                    </h2>
                    <p className="text-gray-500 text-[13px] mt-1">Administración de cuentas e integraciones de perfiles Kontrola</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#29B6F6] hover:bg-[#039BE5] text-white px-4 py-2 rounded text-[13px] font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                    <UserPlus size={16} /> Crear Usuario
                </button>
            </div>

            <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-10">
                        <div className="animate-spin w-8 h-8 border-4 border-[#3B95B0] border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px] text-left">
                            <thead className="bg-[#fafafa] border-b border-gray-200 text-gray-600 font-semibold">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Usuario (Email)</th>
                                    <th className="px-4 py-3">Nombre Completo</th>
                                    <th className="px-4 py-3">Consorcio</th>
                                    <th className="px-4 py-3 text-center">Staff?</th>
                                    <th className="px-4 py-3 text-center">Activo?</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-500">{u.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{u.email}</td>
                                        <td className="px-4 py-3">{(u.first_name || '') + ' ' + (u.last_name || '')}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {u.consorcio_nombre ? `${u.consorcio_id} - ${u.consorcio_nombre}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {u.is_staff ? <Check size={16} className="text-[#4CAF50] mx-auto" /> : <X size={16} className="text-gray-300 mx-auto" />}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {u.is_active ? (
                                                <span className="bg-[#E8F5E9] text-[#2E7D32] px-2 py-1 rounded text-[11px] font-medium">Activo</span>
                                            ) : (
                                                <span className="bg-[#FFEBEE] text-[#C62828] px-2 py-1 rounded text-[11px] font-medium">Inactivo</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleOpenModal(u)}
                                                className="text-[#2196F3] hover:text-[#1976D2] p-1 transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded shadow-lg w-full max-w-[500px] overflow-hidden">
                        <div className="bg-[#263238] p-4 text-white flex justify-between items-center">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Shield size={16} /> {isEditing ? 'Editar Usuario' : 'Crear Usuario'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-white/70 hover:text-white"><X size={18} /></button>
                        </div>

                        <div className="p-5">
                            {error && <div className="bg-[#FFEBEE] text-[#C62828] p-3 rounded mb-4 text-[12px]">{error}</div>}
                            {successMsg && !generatedPassword && <div className="bg-[#E8F5E9] text-[#2E7D32] p-3 rounded mb-4 text-[12px]">{successMsg}</div>}

                            {generatedPassword ? (
                                <div className="bg-[#E3F2FD] border border-[#90CAF9] p-4 rounded text-center mb-4">
                                    <h4 className="text-[#1976D2] font-semibold mb-2">Usuario creado exitosamente</h4>
                                    <p className="text-[13px] text-gray-700 mb-2">Se ha enviado un correo electrónico con sus datos de ingreso. La contraseña auto-generada es:</p>
                                    <div className="bg-white border border-[#BBDEFB] inline-block px-4 py-2 font-mono text-[16px] font-bold text-[#1565C0] rounded tracking-wider shadow-sm">
                                        {generatedPassword}
                                    </div>
                                    <button
                                        onClick={() => {
                                            fetchData();
                                            handleCloseModal();
                                        }}
                                        className="mt-4 bg-[#2196F3] text-white px-4 py-2 rounded text-[13px] w-full"
                                    >
                                        Cerrar y Actualizar Tabla
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSave}>
                                    <div className="space-y-4 text-[13px]">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-1">Email <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                required
                                                disabled={isEditing}
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full h-[36px] bg-[#fafafa] border border-gray-300 rounded px-3 outline-none focus:border-[#2196f3] disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                            {isEditing && <p className="text-[11px] text-gray-400 mt-1">El email no puede ser modificado.</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Nombre</label>
                                                <input
                                                    type="text"
                                                    value={formData.firstName}
                                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full h-[36px] bg-[#fafafa] border border-gray-300 rounded px-3 outline-none focus:border-[#2196f3]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Apellido</label>
                                                <input
                                                    type="text"
                                                    value={formData.lastName}
                                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="w-full h-[36px] bg-[#fafafa] border border-gray-300 rounded px-3 outline-none focus:border-[#2196f3]"
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 my-4 pt-4">
                                            <label className="block text-gray-700 font-semibold mb-1">Perfil y Consorcio</label>
                                            <select
                                                value={formData.consorcioId}
                                                onChange={e => setFormData({ ...formData, consorcioId: e.target.value })}
                                                className="w-full h-[36px] bg-[#fafafa] border border-gray-300 rounded px-3 outline-none focus:border-[#2196f3] mb-3"
                                            >
                                                <option value="">-- Sin asignar (Administrador Global) --</option>
                                                {consorcios.map(c => (
                                                    <option key={c.consorcio_id} value={c.consorcio_id}>
                                                        {c.consorcio_id} - {c.nombre}
                                                    </option>
                                                ))}
                                            </select>

                                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#2196F3] rounded focus:ring-0"
                                                    checked={formData.forcePasswordChange}
                                                    onChange={e => setFormData({ ...formData, forcePasswordChange: e.target.checked })}
                                                />
                                                <span className="text-gray-700">Requiere cambio de clave (próximo inicio de sesión)</span>
                                            </label>
                                        </div>

                                        <div className="border-t border-gray-200 mt-4 pt-4 flex items-center justify-between">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#4CAF50] rounded focus:ring-0"
                                                    checked={formData.isActive}
                                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <span className="text-gray-700 font-semibold text-[#4CAF50]">Usuario Activo</span>
                                            </label>

                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#FF9800] rounded focus:ring-0"
                                                    checked={formData.isStaff}
                                                    onChange={e => setFormData({ ...formData, isStaff: e.target.checked })}
                                                />
                                                <span className="text-gray-700 font-semibold text-[#E65100]">Rol de Staff</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-[13px] font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded text-[13px] font-medium"
                                        >
                                            {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
