export interface Flight {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string | null;
    time: string;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string | null;
    time: string;
  };
  airline: string;
  flight_number: string;
}

export async function getFlightData(countryName: string): Promise<{ arrivalFlights: Flight[]; departureFlights: Flight[] }> {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey) {
    console.error('AviationStack API key is missing. Please set the AVIATIONSTACK_API_KEY environment variable.');
    return { arrivalFlights: [], departureFlights: [] };
  }

  const today = new Date();
  const date = today.toISOString().slice(0, 10);

  try {
    //  aviationstack API requires the IATA code of the airport, not the city name.
    //  hardcoding a common airport IATA code for each country for testing purposes.
    const airportIataMap: { [key: string]: string } = {
      'United States': 'JFK',    
      'Canada': 'YYZ',           
      'United Kingdom': 'LHR',   
      'Germany': 'FRA',         
      'France': 'CDG',          
      'Japan': 'HND',            
      'China': 'PEK',           
      'India': 'DEL',            
      'Brazil': 'GRU',           
      'Australia': 'SYD',         
    };

    const airportIata = airportIataMap[countryName] || 'JFK';

    const arrivalUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&arr_iata=${airportIata}&flight_date=${date}`;
    const departureUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${airportIata}&flight_date=${date}`;

    const [arrivalResponse, departureResponse] = await Promise.all([
      fetch(arrivalUrl),
      fetch(departureUrl)
    ]);

    if (!arrivalResponse.ok || !departureResponse.ok) {
      console.error(`HTTP error! Arrival Status: ${arrivalResponse.status}, Departure Status: ${departureResponse.status}`);
      return { arrivalFlights: [], departureFlights: [] };
    }

    const arrivalData = await arrivalResponse.json() as any;
    const departureData = await departureResponse.json() as any;

    if (!arrivalData.data || !Array.isArray(arrivalData.data) || !departureData.data || !Array.isArray(departureData.data)) {
      console.error('Invalid data format from AviationStack API: Arrival -', arrivalData, 'Departure - ', departureData);
      return { arrivalFlights: [], departureFlights: [] };
    }

    const arrivalFlights = arrivalData.data.slice(0, 3).map((flight: any) => ({
      flight_date: flight.flight_date,
      flight_status: flight.flight_status,
      departure: {
        airport: flight.departure.airport_name,
        timezone: flight.departure.timezone,
        iata: flight.departure.iata,
        icao: flight.departure.icao,
        terminal: flight.departure.terminal,
        time: flight.departure.scheduled,
      },
      arrival: {
        airport: flight.arrival.airport_name,
        timezone: flight.arrival.timezone,
        iata: flight.arrival.iata,
        icao: flight.arrival.icao,
        terminal: flight.arrival.terminal,
        time: flight.arrival.scheduled,
      },
      airline: flight.airline.name,
      flight_number: flight.flight.number,
    }));

    const departureFlights = departureData.data.slice(0, 3).map((flight: any) => ({
      flight_date: flight.flight_date,
      flight_status: flight.flight_status,
      departure: {
        airport: flight.departure.airport_name,
        timezone: flight.departure.timezone,
        iata: flight.departure.iata,
        icao: flight.departure.icao,
        terminal: flight.departure.terminal,
        time: flight.departure.scheduled,
      },
      arrival: {
        airport: flight.arrival.airport_name,
        timezone: flight.arrival.timezone,
        iata: flight.arrival.iata,
        icao: flight.arrival.icao,
        terminal: flight.arrival.terminal,
        time: flight.arrival.scheduled,
      },
      airline: flight.airline.name,
      flight_number: flight.flight.number,
    }));

    return { arrivalFlights, departureFlights };
  } catch (error: any) {
    console.error('Error fetching flight data:', error);
    return { arrivalFlights: [], departureFlights: [] };
  }
}
