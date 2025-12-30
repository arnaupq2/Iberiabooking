import React, { useState, useEffect } from 'react';
import { getFlights } from '../lib/storage';
import { Plane, ChevronRight, Info, Check } from 'lucide-react';

const Home = () => {
    const [flights, setFlights] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [bookingStep, setBookingStep] = useState('select'); // select, details, invoice
    const [selectedClass, setSelectedClass] = useState('economy');

    useEffect(() => {
        setFlights(getFlights());
    }, []);

    const handleBookClick = (flight) => {
        setSelectedFlight(flight);
        setBookingStep('details');
        // Default to first available class
        if (flight.prices.economy) setSelectedClass('economy');
        else if (flight.prices.premium) setSelectedClass('premium');
        else if (flight.prices.business) setSelectedClass('business');
    };

    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                setLoading(false);
            }, 1000); // 1s fade out duration
        }, 3000); // 3s display time

        return () => clearTimeout(timer);
    }, []);

    const getPrice = () => {
        if (!selectedFlight) return 0;
        const priceStr = selectedFlight.prices[selectedClass] || '0';
        return parseInt(priceStr, 10);
    };

    const handleContinue = () => {
        setBookingStep('invoice');
        // Here we would trigger the webhook in a real scenario
        console.log('Factura generada para:', selectedFlight.flightCode, 'Clase:', selectedClass, 'Total:', getPrice());
    };

    const closeModal = () => {
        setSelectedFlight(null);
        setBookingStep('select');
    };

    if (loading) {
        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/carga.png')" }}
                />

                {/* Overlay darken */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Center Content (Consejo) */}
                <div className="relative z-10 p-4 max-w-md w-full animate-pulse">
                    <img
                        src="/consejo.png"
                        alt="Consejo Iberia"
                        className="w-full h-auto rounded-lg shadow-2xl border border-white/20"
                    />
                </div>
            </div>
        );
    }

    // Helper to format currency
    const formatPrice = (price) => price ? `${price} R$` : 'no disponible';

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            {/* 1. HEADER IBERIA STYLE */}
            <header className="bg-iberia-red text-white h-16 flex justify-between items-center px-6 shadow-md relative z-20">
                <img src="/iberia.svg" alt="Iberia" className="h-8 brightness-0 invert" />
                <div className="flex items-center gap-6 text-sm font-medium">
                    <div className="hidden md:block opacity-90">
                        TOTAL DE LO SELECCIONADO EN ROBUX: <span className="font-bold text-lg ml-1">0 R$</span>
                    </div>
                    <a href="/control" className="flex items-center gap-2 hover:underline opacity-90">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">👤</div>
                        Acceder → ENTRADA AL PANEL
                    </a>
                </div>
            </header>

            {/* 2. STEPS BAR */}
            <div className="bg-white border-b border-gray-200 py-3 hidden md:flex justify-center text-xs text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2 text-iberia-red font-bold">
                    <span className="w-5 h-5 rounded-full border border-iberia-red flex items-center justify-center text-[10px]">1</span>
                    Selección de vuelos
                </div>
                <div className="w-12 border-t border-gray-300 mx-3"></div>
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">2</span>
                    Datos de pasajeros
                </div>
                <div className="w-12 border-t border-gray-300 mx-3"></div>
                <div>3 Personaliza y completa</div>
                <div className="w-12 border-t border-gray-300 mx-3"></div>
                <div>4 Pago</div>
                <div className="w-12 border-t border-gray-300 mx-3"></div>
                <div>5 Confirmación</div>
            </div>

            {/* 3. MAIN CONTENT */}
            <main className="max-w-6xl mx-auto p-4 md:p-8">

                <div className="flex items-center gap-3 mb-6">
                    <Plane className="rotate-90 text-gray-400" />
                    <h1 className="text-2xl font-light text-gray-600 uppercase tracking-wide">Selecciona un vuelo de ida</h1>
                </div>

                {/* Date Strip */}
                {/* Date Strip - Dynamic */}
                <div className="flex justify-center mb-8 border-t border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    {[...Array(5)].map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + (i - 2)); // -2 (anteayer), -1 (ayer), 0 (hoy), +1 (mañana), +2 (pasado)

                        // Override logic to show generic "Previous" for i < 2 if prefer simple list
                        // Showing: [Anteayer] [Ayer] [HOY] [Mañana] [Pasado]

                        const isToday = i === 2;
                        const isPast = i < 2;

                        const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
                        const dayNum = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '').toUpperCase();

                        return (
                            <div
                                key={i}
                                className={`px-6 py-3 border-r border-gray-200 text-center text-xs min-w-[100px]
                                    ${isToday ? 'bg-iberia-red text-white shadow-lg transform scale-105 relative z-10' : ''}
                                    ${isPast ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-500 hover:bg-gray-100 cursor-pointer'}
                                `}
                            >
                                <div className={isToday ? 'text-xs font-bold mt-1' : ''}>
                                    {dayName}
                                </div>
                                <div className={isToday ? 'text-lg font-bold' : ''}>
                                    {dayNum}
                                </div>
                                <div className={isToday ? 'text-sm opacity-90' : ''}>
                                    {isToday ? '191 R$' : (isPast ? 'No disponible' : `desde ${150 + (i * 10)} R$`)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Flights Grid */}
                {flights.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No hay vuelos disponibles para hoy.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Headers for Options */}
                        <div className="hidden md:grid grid-cols-12 gap-0 px-0 text-xs font-bold text-gray-800 uppercase text-center mb-0">
                            <div className="col-span-6 text-left pl-4 pb-2 text-gray-500">Horario / Duración</div>
                            <div className="col-span-3 pb-2 text-gray-600 tracking-wider">TURISTA</div>
                            <div className="col-span-3 pb-2 text-gray-600 tracking-wider">BUSINESS CLASS</div>
                        </div>

                        {flights.map(flight => (
                            <div key={flight.id} className="bg-white border border-gray-200 shadow-sm transition-all grid grid-cols-1 md:grid-cols-12 overflow-hidden group">

                                {/* Flight Info (Left) */}
                                <div className="col-span-1 md:col-span-6 p-6 flex flex-col justify-center relative border-b md:border-b-0">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-light text-gray-800">{flight.departureTime}</div>
                                            <div className="text-xs font-bold text-gray-400">{flight.originCode}</div>
                                        </div>

                                        <div className="flex-1 px-6 flex flex-col items-center">
                                            <div className="text-[10px] text-gray-400 uppercase mb-1">{flight.duration}</div>
                                            <div className="w-full h-px bg-gray-300 relative flex justify-center">
                                                <Plane size={12} className="text-gray-400 absolute -top-1.5 rotate-90" />
                                            </div>
                                            <div className="text-[10px] text-green-600 font-bold mt-1 uppercase">Directo</div>
                                        </div>

                                        <div className="text-center">
                                            <div className="text-2xl font-light text-gray-800">{flight.arrivalTime}</div>
                                            <div className="text-xs font-bold text-gray-400">{flight.destinationCode}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-gray-500">Operado por {flight.operator || 'Iberia'}</span>
                                        <span className="text-xs text-blue-600 font-bold ml-auto cursor-pointer">Ver detalles</span>
                                    </div>
                                </div>

                                {/* Price Options (Right) */}
                                {/* Turista */}
                                <div
                                    onClick={() => flight.prices.economy && handleBookClick(flight)}
                                    className={`col-span-1 md:col-span-3 p-4 flex flex-col justify-between cursor-pointer transition-all border-l border-gray-100 h-full min-h-[120px]
                                        ${!flight.prices.economy ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-gray-600 hover:bg-gray-500 text-white'}
                                        relative
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm ${flight.prices.economy ? 'text-white' : 'text-gray-300'}`}>Turista</span>
                                        {flight.prices.economy && <Check size={16} className="text-white opacity-80" />}
                                    </div>

                                    <div className="text-right mt-auto">
                                        {flight.prices.economy ? (
                                            <div className="text-2xl font-bold text-white">
                                                {flight.prices.economy} R$
                                            </div>
                                        ) : (
                                            <div className="text-lg font-bold text-gray-300">
                                                no disponible
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Business */}
                                <div
                                    onClick={() => flight.prices.business && handleBookClick(flight)}
                                    className={`col-span-1 md:col-span-3 p-4 flex flex-col justify-between cursor-pointer transition-all border-l border-gray-100 h-full min-h-[120px]
                                        ${!flight.prices.business ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white hover:bg-gray-50'}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm ${flight.prices.business ? 'text-gray-800' : 'text-gray-300'}`}>Business Class</span>
                                    </div>

                                    <div className="text-right mt-auto">
                                        {flight.prices.business ? (
                                            <div className="text-2xl font-bold text-gray-800">
                                                {flight.prices.business} R$
                                            </div>
                                        ) : (
                                            <div className="text-lg font-bold text-gray-300">
                                                no disponible
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="bg-iberia-red text-white p-8 mt-20">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 opacity-90">
                    <img src="/iberia.svg" alt="Iberia" className="h-10 brightness-0 invert" />
                    <div className="text-xs text-right space-y-1">
                        <p>Accesibilidad</p>
                        <p>Política de protección de datos personales</p>
                        <p>© Iberia 2025</p>
                    </div>
                </div>
            </footer>

            {/* Booking Modal */}
            {selectedFlight && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
                    <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">

                        {/* Modal Header */}
                        <div className="bg-iberia-red text-white p-4 flex justify-between items-center sticky top-0">
                            <h3 className="font-bold text-lg">Resumen de Vuelo</h3>
                            <button onClick={closeModal} className="hover:bg-white/20 p-1 rounded-full"><ChevronRight className="rotate-90 md:rotate-0" /></button>
                        </div>

                        <div className="p-6 max-h-[80vh] overflow-y-auto">

                            {bookingStep === 'details' && (
                                <>
                                    {/* Flight Route Summary */}
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="text-center">
                                            <div className="text-4xl font-light text-gray-900">{selectedFlight.originCode}</div>
                                            <div className="text-sm text-gray-500">{selectedFlight.originCountry}</div>
                                        </div>
                                        <div className="flex-1 border-b-2 border-dashed border-gray-300 mx-4 relative top-[-10px]"></div>
                                        <div className="text-center">
                                            <div className="text-4xl font-light text-gray-900">{selectedFlight.destinationCode}</div>
                                            <div className="text-sm text-gray-500">{selectedFlight.destinationCountry}</div>
                                        </div>
                                    </div>

                                    {/* Flight Details Grid */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="block text-gray-400 text-xs">HORA SALIDA</span>
                                            <span className="font-medium text-gray-800">{selectedFlight.departureTime}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 text-xs">HORA LLEGADA</span>
                                            <span className="font-medium text-gray-800">{selectedFlight.arrivalTime}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 text-xs">VUELO</span>
                                            <span className="font-medium text-gray-800">{selectedFlight.flightCode}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 text-xs">DURACIÓN</span>
                                            <span className="font-medium text-gray-800">{selectedFlight.duration}</span>
                                        </div>
                                    </div>

                                    {/* Class Selection */}
                                    <h4 className="font-bold text-gray-800 mb-3">Selecciona tu clase</h4>
                                    <div className="space-y-3 mb-8">
                                        {selectedFlight.prices.economy && (
                                            <label className={`flex justify - between items - center p - 4 border rounded - lg cursor - pointer transition - all ${selectedClass === 'economy' ? 'border-iberia-red bg-red-50 ring-1 ring-iberia-red' : 'border-gray-200 hover:border-gray-300'} `}>
                                                <div className="flex items-center gap-3">
                                                    <input type="radio" name="class" checked={selectedClass === 'economy'} onChange={() => setSelectedClass('economy')} className="text-iberia-red focus:ring-iberia-red" />
                                                    <span className="font-medium text-gray-900">Economy</span>
                                                </div>
                                                <span className="font-bold text-gray-900">{selectedFlight.prices.economy} R$</span>
                                            </label>
                                        )}
                                        {selectedFlight.prices.premium && (
                                            <label className={`flex justify - between items - center p - 4 border rounded - lg cursor - pointer transition - all ${selectedClass === 'premium' ? 'border-iberia-red bg-red-50 ring-1 ring-iberia-red' : 'border-gray-200 hover:border-gray-300'} `}>
                                                <div className="flex items-center gap-3">
                                                    <input type="radio" name="class" checked={selectedClass === 'premium'} onChange={() => setSelectedClass('premium')} className="text-iberia-red focus:ring-iberia-red" />
                                                    <span className="font-medium text-gray-900">Premium Economy</span>
                                                </div>
                                                <span className="font-bold text-gray-900">{selectedFlight.prices.premium} R$</span>
                                            </label>
                                        )}
                                        {selectedFlight.prices.business && (
                                            <label className={`flex justify - between items - center p - 4 border rounded - lg cursor - pointer transition - all ${selectedClass === 'business' ? 'border-iberia-red bg-red-50 ring-1 ring-iberia-red' : 'border-gray-200 hover:border-gray-300'} `}>
                                                <div className="flex items-center gap-3">
                                                    <input type="radio" name="class" checked={selectedClass === 'business'} onChange={() => setSelectedClass('business')} className="text-iberia-red focus:ring-iberia-red" />
                                                    <span className="font-medium text-gray-900">Business Class</span>
                                                </div>
                                                <span className="font-bold text-gray-900">{selectedFlight.prices.business} R$</span>
                                            </label>
                                        )}
                                    </div>

                                    {/* Footer Price & Action */}
                                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div>
                                            <span className="text-sm text-gray-500">Total a pagar</span>
                                            <div className="text-2xl font-bold text-iberia-red">{getPrice()} <span className="text-sm">Robux</span></div>
                                        </div>
                                        <button onClick={handleContinue} className="bg-iberia-red text-white py-3 px-8 rounded-lg font-bold hover:bg-red-700 transition shadow-lg shadow-red-900/20">
                                            Continuar
                                        </button>
                                    </div>
                                </>
                            )}

                            {bookingStep === 'invoice' && (
                                <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Reserva Iniciada!</h3>
                                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">Tu solicitud de vuelo ha sido procesada correctamente.</p>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-500">Vuelo</span>
                                            <span className="font-medium">{selectedFlight.flightCode}</span>
                                        </div>
                                        <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
                                            <span className="text-gray-500">Clase</span>
                                            <span className="font-medium capitalize">{selectedClass}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-900">Total Factura</span>
                                            <span className="font-bold text-xl text-iberia-red">{getPrice()} Robux</span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 text-left">
                                        <Info className="text-blue-600 shrink-0 mt-1" size={20} />
                                        <div>
                                            <p className="font-bold text-blue-800 text-sm mb-1">Pasos Finales</p>
                                            <p className="text-blue-700 text-sm">
                                                Para completar el pago de <strong>{getPrice()} Robux</strong>, por favor
                                                <span className="font-bold"> Compra el pase de roblox en Iberia (https://www.roblox.com/es/communities/33968534/Iberia-L-neas-A-reas-de-Espa-a#!/about)), con tu clase correspondiente</span> y busca tu nombre en la siguiente pagina
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            window.location.href = 'https://iberiarobloxcheckmentsystem.onrender.com/';
                                        }}
                                        className="mt-8 bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition shadow-lg"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
