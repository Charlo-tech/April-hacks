'use client';

import React, {useState, useCallback, useEffect} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Country} from '@/services/countries-api';
import {getCountryData} from '@/services/countries-api';
import {generateFunFact} from '@/ai/flows/generate-fun-fact';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Globe} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {getFlightData, Flight} from '@/services/flight-api';

interface GeoFunFactsProps {}

const GeoFunFacts: React.FC<GeoFunFactsProps> = () => {
  const [countryName, setCountryName] = useState<string>('');
  const [countryData, setCountryData] = useState<Country | null>(null);
  const [funFact, setFunFact] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const {toast} = useToast();
  const [searchHistory, setSearchHistory] = useState<Country[]>([]);
  const [flightData, setFlightData] = useState<{arrivalFlights: Flight[], departureFlights: Flight[]} | null>(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const country = await getCountryData(countryName);

      if (!country) {
        toast({
          title: 'Error',
          description: 'Failed to retrieve data for this country.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const fact = await generateFunFact({countryName: countryName});
      //const flights = await getFlightData({countryName: countryName});
      const flights = await getFlightData(country.name);

      setCountryData(country);
      setFunFact(fact?.funFact || 'Could not generate fun fact.');
      setFlightData(flights || null);

      setSearchHistory(prevHistory => {
        const newHistory = [country, ...prevHistory];
        return newHistory.slice(0, 10);
      });
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setFunFact('Failed to generate fun fact.');
      toast({
        title: 'Error',
        description: 'Failed to retrieve data for this country.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [countryName, toast]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background p-8">
      <h1 className="text-2xl font-semibold mb-4 text-primary">GeoFunFacts</h1>

      <div className="flex w-full max-w-md items-center space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Enter country name"
          value={countryName}
          onChange={e => setCountryName(e.target.value)}
          className="rounded-md shadow-sm focus:ring-primary focus:border-primary"
        />
        <Button onClick={handleSearch} className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md">
          {loading ? 'Loading...' : 'Search'}
        </Button>
      </div>

      {countryData && (
        <Card className="w-full max-w-md bg-card text-card-foreground shadow-md rounded-md overflow-hidden relative">
          <CardHeader className="p-4 relative">
            <CardTitle className="text-lg font-semibold text-primary">{countryData.name}</CardTitle>
            <CardDescription>
              <img src={countryData.flag} alt={`${countryData.name} Flag`} className="w-20 h-15 rounded-md shadow-sm" />
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 relative">
            <p>
              <strong>Landmass:</strong> {countryData.landmass} sq km
            </p>
            <p>
              <strong>Population:</strong> {countryData.population}
            </p>
            <p>
              <strong>Languages:</strong> {countryData.languages.join(', ')}
            </p>
            <p className="mt-4">
              <Globe className="inline-block h-4 w-4 mr-1 text-accent" />
              <strong>Fun Fact:</strong> {funFact}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-primary">Search History</h2>
        <div className="flex flex-wrap -mx-2">
          {searchHistory.map((country, index) => (
            <div key={index} className="w-1/2 px-2 mb-4">
              <Card className="bg-card text-card-foreground shadow-md rounded-md overflow-hidden">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-semibold text-primary">{country.name}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {flightData && (
        <footer className="mt-8 w-full max-w-md p-4 bg-secondary rounded-md shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-primary">Flight Data</h2>
          <div>
            <h3 className="text-lg font-semibold mb-2">Arrival Flights</h3>
            <ul>
              {flightData.arrivalFlights.map((flight, index) => (
                <li key={index} className="mb-1">
                  {flight.airline} - {flight.flight_number} from {flight.departure.airport} ({flight.arrival.time})
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Departure Flights</h3>
            <ul>
              {flightData.departureFlights.map((flight, index) => (
                <li key={index} className="mb-1">
                  {flight.airline} - {flight.flight_number} to {flight.arrival.airport} ({flight.departure.time})
                </li>
              ))}
            </ul>
          </div>
        </footer>
      )}
    </div>
  );
};

export default GeoFunFacts;
