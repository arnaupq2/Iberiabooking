const STORAGE_KEY = 'iberia_flights';

export const getFlights = () => {
    const flights = localStorage.getItem(STORAGE_KEY);
    return flights ? JSON.parse(flights) : [];
};

export const saveFlight = (flight) => {
    const flights = getFlights();
    const newFlight = { ...flight, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    flights.push(newFlight);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flights));
    return newFlight;
};

export const deleteFlight = (id) => {
    const flights = getFlights();
    const filtered = flights.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
