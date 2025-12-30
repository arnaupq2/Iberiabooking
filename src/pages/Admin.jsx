import React, { useState, useEffect } from 'react';
import { getFlights, saveFlight, deleteFlight } from '../lib/storage';
import { Plus, Trash2, LogOut, Check, User, Key, Loader2, X, Plane } from 'lucide-react';

// Simple hash for "102026" to avoid plain text password.
// In a real app, use a proper backend or stronger auth.
// This is security-through-obscurity basically, but fits the "no plain text" requirement for client-side.
const PASSWORD_HASH = '1918366479'; // Simple string hash or just check purely. 
// Actually, let's just do a simple check since we can't hide client code.
// Ideally usage of bcryptjs but creating a hash for 102026:
// For this demo, we will use a state-based lock.

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Auth State
    const [authStep, setAuthStep] = useState('username'); // 'username' | 'code'
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [authError, setAuthError] = useState('');
    const [loading, setLoading] = useState(false);

    const [flights, setFlights] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Form State (keeping your existing state logic)
    const [formData, setFormData] = useState({
        origin: '', originCode: '', originCountry: '',
        destination: '', destinationCode: '', destinationCountry: '',
        departureTime: '', arrivalTime: '', flightTime: '',
        duration: '', flightCode: '', operator: 'Iberia',
        classes: { economy: false, premium: false, business: false },
        prices: { economy: '', premium: '', business: '' }
    });

    useEffect(() => {
        if (isAuthenticated) {
            setFlights(getFlights());
        }
    }, [isAuthenticated]);

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setAuthError('');
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await res.json();
            if (data.success) {
                setAuthStep('code');
            } else {
                setAuthError(data.error);
            }
        } catch (err) {
            setAuthError('Error de conexión con el servidor de autenticación.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setAuthError('');
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, code: otp })
            });
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
            } else {
                setAuthError(data.error);
            }
        } catch (err) {
            setAuthError('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    // ... (keeping existing handleDelete, handleSave logic)
    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este vuelo?')) {
            deleteFlight(id);
            setFlights(getFlights());
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        saveFlight(formData);
        setFlights(getFlights());
        setShowModal(false);
        // Reset form
        setFormData({
            origin: '', originCode: '', originCountry: '',
            destination: '', destinationCode: '', destinationCountry: '',
            departureTime: '', arrivalTime: '', flightTime: '',
            duration: '', flightCode: '', operator: 'Iberia',
            classes: { economy: false, premium: false, business: false },
            prices: { economy: '', premium: '', business: '' }
        });
    };


    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
            {/* HEADER IBERIA STYLE */}
            <header className="bg-iberia-red text-white h-16 flex justify-between items-center px-6 shadow-md relative z-20">
                <a href="/">
                    <img src="/iberia.svg" alt="Iberia" className="h-8 brightness-0 invert" />
                </a>
                <div className="flex items-center gap-6 text-sm font-medium opacity-90">
                    <div>IBERIA MANAGEMENT SYSTEM</div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <User className="text-iberia-red" />
                    <h1 className="text-2xl font-light text-gray-600 uppercase tracking-wide">Panel de Control</h1>
                </div>

                {!isAuthenticated ? (
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl border-t-4 border-iberia-red overflow-hidden mt-10">
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Acceso Seguro</h2>

                            {authStep === 'username' ? (
                                <form onSubmit={handleRequestCode} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario de Discord</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full p-3 pl-10 border border-gray-300 rounded focus:ring-2 focus:ring-iberia-red focus:border-iberia-red outline-none transition"
                                                placeholder="Ej: arnaupq"
                                                autoFocus
                                                required
                                            />
                                            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Debes tener permisos de administrador.</p>
                                    </div>
                                    {authError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{authError}</p>}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-iberia-red text-white py-3 rounded font-bold hover:bg-red-700 transition flex justify-center items-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Enviar Código de Acceso'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyCode} className="space-y-4 animate-in slide-in-from-right duration-300">
                                    <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4 border border-blue-100 flex flex-col items-center">
                                        <span>Hemos enviado un código a:</span>
                                        <span className="font-bold">{username}</span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Código de Verificación</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full p-3 pl-10 border border-gray-300 rounded focus:ring-2 focus:ring-iberia-red focus:border-iberia-red outline-none transition tracking-widest font-mono text-lg text-center"
                                                placeholder="000000"
                                                maxLength={6}
                                                autoFocus
                                                required
                                            />
                                            <Key className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        </div>
                                    </div>
                                    {authError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{authError}</p>}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gray-900 text-white py-3 rounded font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Verificar y Entrar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAuthStep('username')}
                                        className="w-full text-sm text-gray-500 hover:text-gray-700 hover:underline mt-2"
                                    >
                                        Volver / Cambiar usuario
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-700">Vuelos Programados</h2>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-iberia-red text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2 text-sm font-medium"
                            >
                                <Plus size={16} /> Crear Vuelo
                            </button>
                        </div>

                        {flights.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">
                                <Plane className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <p>No hay vuelos configurados.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {flights.map(flight => (
                                    <div key={flight.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg text-gray-800">{flight.originCode}</span>
                                                <span className="text-gray-400">→</span>
                                                <span className="font-bold text-lg text-gray-800">{flight.destinationCode}</span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {flight.departureTime} - {flight.arrivalTime} • {flight.flightCode}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {flight.prices.economy && `Eco: ${flight.prices.economy}R$ `}
                                                {flight.prices.business && `Bus: ${flight.prices.business}R$ `}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(flight.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                                            title="Eliminar vuelo"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Create Flight Modal - Keeping functional styling but slightly cleaner */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-10">
                                <h3 className="font-bold">Programar Nuevo Vuelo</h3>
                                <button onClick={() => setShowModal(false)} className="hover:text-gray-300"><X /></button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código Origen</label>
                                            <input value={formData.originCode} onChange={e => setFormData({ ...formData, originCode: e.target.value.toUpperCase() })} required placeholder="MAD" className="w-full p-2 border rounded focus:border-iberia-red outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">País Origen</label>
                                            <input value={formData.originCountry} onChange={e => setFormData({ ...formData, originCountry: e.target.value })} required placeholder="España" className="w-full p-2 border rounded focus:border-iberia-red outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código Destino</label>
                                            <input value={formData.destinationCode} onChange={e => setFormData({ ...formData, destinationCode: e.target.value.toUpperCase() })} required placeholder="JFK" className="w-full p-2 border rounded focus:border-iberia-red outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">País Destino</label>
                                            <input value={formData.destinationCountry} onChange={e => setFormData({ ...formData, destinationCountry: e.target.value })} required placeholder="Estados Unidos" className="w-full p-2 border rounded focus:border-iberia-red outline-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Salida</label>
                                            <input type="time" value={formData.departureTime} onChange={e => setFormData({ ...formData, departureTime: e.target.value })} required className="w-full p-2 border rounded focus:border-iberia-red outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Llegada</label>
                                            <input type="time" value={formData.arrivalTime} onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })} required className="w-full p-2 border rounded focus:border-iberia-red outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duración</label>
                                            <input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required placeholder="8h 25m" className="w-full p-2 border rounded focus:border-iberia-red outline-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nº Vuelo</label>
                                            <input value={formData.flightCode} onChange={e => setFormData({ ...formData, flightCode: e.target.value.toUpperCase() })} required placeholder="IB6251" className="w-full p-2 border rounded focus:border-iberia-red outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Operadora</label>
                                            <select value={formData.operator} onChange={e => setFormData({ ...formData, operator: e.target.value })} className="w-full p-2 border rounded focus:border-iberia-red outline-none">
                                                <option>Iberia</option>
                                                <option>Iberia Express</option>
                                                <option>Air Nostrum</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-bold text-gray-700 mb-3">Precios (Robux)</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                    <input type="checkbox" checked={formData.classes.economy} onChange={e => setFormData({ ...formData, classes: { ...formData.classes, economy: e.target.checked } })} />
                                                    Economy
                                                </label>
                                                {formData.classes.economy && <input type="number" value={formData.prices.economy} onChange={e => setFormData({ ...formData, prices: { ...formData.prices, economy: e.target.value } })} placeholder="100" className="w-full p-2 border rounded focus:border-iberia-red outline-none" />}
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                    <input type="checkbox" checked={formData.classes.premium} onChange={e => setFormData({ ...formData, classes: { ...formData.classes, premium: e.target.checked } })} />
                                                    Premium
                                                </label>
                                                {formData.classes.premium && <input type="number" value={formData.prices.premium} onChange={e => setFormData({ ...formData, prices: { ...formData.prices, premium: e.target.value } })} placeholder="150" className="w-full p-2 border rounded focus:border-iberia-red outline-none" />}
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                    <input type="checkbox" checked={formData.classes.business} onChange={e => setFormData({ ...formData, classes: { ...formData.classes, business: e.target.checked } })} />
                                                    Business
                                                </label>
                                                {formData.classes.business && <input type="number" value={formData.prices.business} onChange={e => setFormData({ ...formData, prices: { ...formData.prices, business: e.target.value } })} placeholder="300" className="w-full p-2 border rounded focus:border-iberia-red outline-none" />}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                        <button type="submit" className="px-6 py-2 bg-iberia-red text-white font-bold rounded hover:bg-red-700 transition">Crear Vuelo</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

export default Admin;
