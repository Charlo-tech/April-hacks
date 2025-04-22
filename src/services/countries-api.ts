/**
 * Represents a country with its key information.
 */
export interface Country {
  /**
   * The name of the country.
   */
  name: string;
  /**
   * The landmass of the country in square kilometers.
   */
  landmass: number;
  /**
   * The population of the country.
   */
  population: number;
  /**
   * The languages spoken in the country.
   */
  languages: string[];
  /**
   * The URL of the country's flag.
   */
  flag: string;
}

/**
 * Asynchronously retrieves data for a given country.
 *
 * @param countryName The name of the country to retrieve data for.
 * @returns A promise that resolves to a Country object containing country data.
 */
export async function getCountryData(countryName: string): Promise<Country | null> {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Country not found, return null
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as any[];

    if (data.length === 0) {
      return null; // No country found, return null
    }

    const country = data[0];

    return {
      name: country.name.common,
      landmass: country.area,
      population: country.population,
      languages: Object.values(country.languages || {}),
      flag: country.flags.png,
    };
  } catch (error: any) {
    console.error('Error fetching country data:', error);
    return null; // Return null in case of an error
  }
}
