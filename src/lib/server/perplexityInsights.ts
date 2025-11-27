import { env } from '$env/dynamic/private';

/**
 * TypeScript interfaces for Perplexity API insights
 */

export interface IndicatorInsight {
    indicator: string;
    summary: string;
    trend: 'rise' | 'neutral' | 'lower';
    drivers: string[];
    forward_outlook: string;
}

export interface PerplexityInsightResponse {
    insights: IndicatorInsight[];
}

/**
 * Input data structure for each indicator
 */
export interface IndicatorData {
    name: string;
    currentValue: number | null;
    previousValue: number | null;
    units: string;
    category: 'energy' | 'economic' | 'monetary';
}

/**
 * Perplexity API response structure (raw)
 */
interface PerplexityAPIResponse {
    id: string;
    model: string;
    created: number;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: Array<{
        index: number;
        finish_reason: string;
        message: {
            role: string;
            content: string;
        };
        delta?: {
            role?: string;
            content?: string;
        };
    }>;
}

/**
 * Main function to fetch market insights from Perplexity API
 * 
 * @param indicators - Array of indicator data objects with current values
 * @returns Structured insights for each indicator
 */
export async function getMarketInsights(
    indicators: IndicatorData[]
): Promise<PerplexityInsightResponse> {
    const apiKey = env.perplexity;

    if (!apiKey) {
        console.warn('Perplexity API key not found. Returning empty insights.');
        return { insights: [] };
    }

    // Build the indicator summary for the prompt
    const indicatorSummary = indicators
        .map((ind) => {
            const change =
                ind.currentValue !== null && ind.previousValue !== null
                    ? ((ind.currentValue - ind.previousValue) / ind.previousValue) * 100
                    : null;
            return `- ${ind.name}: ${ind.currentValue !== null ? ind.currentValue.toFixed(2) : 'N/A'} ${ind.units}${change !== null ? ` (${change > 0 ? '+' : ''}${change.toFixed(1)}% change)` : ''}`;
        })
        .join('\n');

    // Strict prompt template with JSON schema enforcement
    const systemPrompt = `You are a professional economic analyst providing clear, balanced market insights for everyday users. Your analysis must be:

1. CONTEXT-APPROPRIATE LANGUAGE:
   - For UNEMPLOYMENT: Use empathetic, socially-aware language. Focus on economic and human impact. NEVER use investor slang like "bullish" or "bearish".
   - For CPI, INFLATION, GDP: Use standard economic terminology.
   - For ENERGY PRICES (Oil, Natural Gas): Use market-standard terminology (supply/demand dynamics).

2. TONE: Neutral, educational, accessible to non-experts. Avoid hype or promotional language.

3. OUTPUT FORMAT: You MUST return ONLY valid JSON matching this exact schema:

{
  "insights": [
    {
      "indicator": "string (exact name from input)",
      "summary": "string (2-3 sentences, clear explanation of current market context)",
      "trend": "rise | neutral | lower",
      "drivers": ["string", "string", ...] (3-5 key factors),
      "forward_outlook": "string (1-2 sentences, forward-looking expectation)"
    }
  ]
}

DO NOT include any text outside the JSON structure. DO NOT use markdown code blocks.`;

    const userPrompt = `Analyze the following economic indicators and provide insights for each using today's date (${new Date().toISOString().split('T')[0]}). Consider recent economic news, trends, and market dynamics.

Indicators:
${indicatorSummary}

Return a JSON object with an "insights" array containing one object per indicator. Each insight must follow the schema provided in the system prompt.`;

    try {
        // Call Perplexity API (using sonar model)
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'sonar-pro', // Using sonar-pro for better reasoning
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature: 0.3, // Lower temperature for more consistent output
                max_tokens: 2000,
                top_p: 0.9,
                return_citations: false,
                return_images: false,
                return_related_questions: false,
                search_recency_filter: 'week' // Focus on recent news
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Perplexity API error:', response.status, errorText);
            throw new Error(`Perplexity API error: ${response.status}`);
        }

        const data: PerplexityAPIResponse = await response.json();

        // Extract the JSON content from the response
        const content = data.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content in Perplexity response');
        }

        // Parse the JSON response (strip any potential markdown if present)
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/```\n?/g, '');
        }

        const parsedResponse: PerplexityInsightResponse = JSON.parse(cleanContent);

        // Validate the response structure
        if (!parsedResponse.insights || !Array.isArray(parsedResponse.insights)) {
            throw new Error('Invalid response structure from Perplexity');
        }

        // Validate each insight
        for (const insight of parsedResponse.insights) {
            if (
                !insight.indicator ||
                !insight.summary ||
                !insight.trend ||
                !insight.drivers ||
                !insight.forward_outlook
            ) {
                console.warn('Incomplete insight detected:', insight);
            }
            // Ensure trend is valid
            if (!['rise', 'neutral', 'lower'].includes(insight.trend)) {
                insight.trend = 'neutral';
            }
        }

        return parsedResponse;
    } catch (error) {
        console.error('Error fetching market insights:', error);
        // Return empty insights on error
        return {
            insights: []
        };
    }
}
