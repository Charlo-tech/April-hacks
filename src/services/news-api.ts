/**
 * Represents a news article.
 */
export interface NewsArticle {
  /**
   * The title of the news article.
   */
  title: string;
  /**
   * The description or snippet of the news article.
   */
  description: string;
  /**
   * The URL of the news article.
   */
  url: string;
  /**
   * The date the news article was published.
   */
  date: string;
}

/**
 * Asynchronously retrieves the latest news articles for a given country.
 *
 * @param countryName The name of the country to retrieve news for.
 * @returns A promise that resolves to an array of NewsArticle objects containing the latest news.
 */
export async function getLatestNews(countryName: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.error('News API key is missing. Please set the NEWS_API_KEY environment variable.');
    return []; // Return an empty array instead of throwing an error
  }

  try {
    const apiUrl = `https://gnews.io/api/v4/search?q=${countryName}&lang=en&apikey=${apiKey}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return []; // Return an empty array instead of throwing an error
    }

    const data = await response.json() as any;

    if (!data.articles || !Array.isArray(data.articles)) {
      console.error('Invalid data format from News API:', data);
      return []; // Return an empty array instead of throwing an error
    }

    return data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      date: article.publishedAt,
    }));
  } catch (error: any) {
    console.error('Error fetching news data:', error);
    return []; // Return an empty array instead of throwing an error
  }
}
