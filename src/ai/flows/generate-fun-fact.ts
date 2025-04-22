'use server';
/**
 * @fileOverview Generates a fun fact about a given country using GenAI.
 *
 * - generateFunFact - A function that generates a fun fact about a country.
 * - GenerateFunFactInput - The input type for the generateFunFact function.
 * - GenerateFunFactOutput - The return type for the GenerateFunFact function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getCountryData} from '@/services/countries-api';

const GenerateFunFactInputSchema = z.object({
  countryName: z.string().describe('The name of the country to generate a fun fact about.'),
});
export type GenerateFunFactInput = z.infer<typeof GenerateFunFactInputSchema>;

const GenerateFunFactOutputSchema = z.object({
  funFact: z.string().describe('A fun fact about the country.'),
});
export type GenerateFunFactOutput = z.infer<typeof GenerateFunFactOutputSchema>;

export async function generateFunFact(input: GenerateFunFactInput): Promise<GenerateFunFactOutput> {
  return generateFunFactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFunFactPrompt',
  input: {
    schema: z.object({
      countryName: z.string().describe('The name of the country to generate a fun fact about.'),
      countryData: z.object({
        name: z.string(),
        landmass: z.number(),
        population: z.number(),
        languages: z.array(z.string()),
        flag: z.string(),
      }).describe('Information about the country'),
    }),
  },
  output: {
    schema: z.object({
      funFact: z.string().describe('A fun fact about the country.'),
    }),
  },
  prompt: `You are a fun fact generator. Generate one interesting fun fact about the country: {{{countryName}}}.\n\nConsider these known facts about the country when generating the fun fact: \n- Landmass: {{{countryData.landmass}}} sq km\n- Population: {{{countryData.population}}}\n- Languages: {{#each countryData.languages}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}\n\nFun Fact: `,
});

const generateFunFactFlow = ai.defineFlow<
  typeof GenerateFunFactInputSchema,
  typeof GenerateFunFactOutputSchema
>(
  {
    name: 'generateFunFactFlow',
    inputSchema: GenerateFunFactInputSchema,
    outputSchema: GenerateFunFactOutputSchema,
  },
  async input => {
    const countryData = await getCountryData(input.countryName);
    const {output} = await prompt({
      countryName: input.countryName,
      countryData,
    });
    return output!;
  }
);

