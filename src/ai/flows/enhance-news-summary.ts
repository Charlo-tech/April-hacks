'use server';
/**
 * @fileOverview Summarizes the latest news articles for a given country using GenAI.
 *
 * - summarizeNews - A function that summarizes news articles about a country.
 * - SummarizeNewsInput - The input type for the summarizeNews function.
 * - SummarizeNewsOutput - The return type for the summarizeNews function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getLatestNews, NewsArticle} from '@/services/news-api';

const SummarizeNewsInputSchema = z.object({
  countryName: z.string().describe('The name of the country to summarize news for.'),
});
export type SummarizeNewsInput = z.infer<typeof SummarizeNewsInputSchema>;

const SummarizeNewsOutputSchema = z.object({
  summary: z.string().describe('A summarized version of the latest news articles.'),
});
export type SummarizeNewsOutput = z.infer<typeof SummarizeNewsOutputSchema>;

export async function summarizeNews(input: SummarizeNewsInput): Promise<SummarizeNewsOutput> {
  return summarizeNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNewsPrompt',
  input: {
    schema: z.object({
      countryName: z.string().describe('The name of the country.'),
      newsArticles: z
        .array(z.object({title: z.string(), description: z.string(), url: z.string(), date: z.string()}))
        .describe('The latest news articles about the country.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summarized version of the latest news articles.'),
    }),
  },
  prompt: `Summarize the following news articles about {{countryName}}:\n\n{{#each newsArticles}}\nTitle: {{title}}\nDescription: {{description}}\nDate: {{date}}\n\n{{/each}}\n\nProvide a concise summary of the main points covered in the articles.`, // Handlebars template here
});

const summarizeNewsFlow = ai.defineFlow<
  typeof SummarizeNewsInputSchema,
  typeof SummarizeNewsOutputSchema
>(
  {
    name: 'summarizeNewsFlow',
    inputSchema: SummarizeNewsInputSchema,
    outputSchema: SummarizeNewsOutputSchema,
  },
  async input => {
    const newsArticles = await getLatestNews(input.countryName);
    const {output} = await prompt({
      countryName: input.countryName,
      newsArticles,
    });
    return output!;
  }
);
