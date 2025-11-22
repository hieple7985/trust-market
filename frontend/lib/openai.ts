import OpenAI from 'openai';

// Lazy-load OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface AIResolutionResult {
  outcome: boolean;
  reasoning: string;
  confidence: number;
  sources: string[];
}

export async function analyzeMarketWithAI(
  question: string,
  resolutionTime: Date,
  dataSources?: string[]
): Promise<AIResolutionResult> {
  const prompt = `You are an AI oracle resolving a prediction market question.

Question: ${question}
Resolution Time: ${resolutionTime.toISOString()}
Current Time: ${new Date().toISOString()}

${dataSources && dataSources.length > 0 ? `Data Sources:\n${dataSources.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : ''}

Your task:
1. Analyze the question and determine if it has been resolved as YES or NO
2. Provide detailed reasoning for your decision
3. Assess your confidence level (0-100%)
4. List the sources you used to make this determination

Important guidelines:
- Only resolve as YES if there is clear, verifiable evidence
- If the outcome is uncertain or the resolution time hasn't passed, indicate low confidence
- Be objective and fact-based
- Cite specific sources when possible

Respond in JSON format:
{
  "outcome": true/false,
  "reasoning": "Detailed explanation of your decision",
  "confidence": 95,
  "sources": ["source1", "source2"]
}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert AI oracle that resolves prediction markets with high accuracy and objectivity. Always provide factual, well-reasoned responses.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent, factual responses
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(response) as AIResolutionResult;

    // Validate the response
    if (
      typeof result.outcome !== 'boolean' ||
      typeof result.reasoning !== 'string' ||
      typeof result.confidence !== 'number' ||
      !Array.isArray(result.sources)
    ) {
      throw new Error('Invalid response format from OpenAI');
    }

    return result;
  } catch (error) {
    console.error('Error analyzing market with AI:', error);
    throw error;
  }
}

// Helper function to gather data sources for a market
export async function gatherDataSources(question: string): Promise<string[]> {
  const sources: string[] = [];

  // For now, we'll use a simple approach
  // In production, you would integrate with various APIs:
  // - CoinGecko for crypto prices
  // - News APIs for events
  // - On-chain data for blockchain events
  // - Custom data sources

  // Example: Check if question is about crypto prices
  if (question.toLowerCase().includes('bitcoin') || question.toLowerCase().includes('btc')) {
    sources.push('CoinGecko API - Bitcoin price data');
  }

  if (question.toLowerCase().includes('ethereum') || question.toLowerCase().includes('eth')) {
    sources.push('CoinGecko API - Ethereum price data');
  }

  // Add general web search as a fallback
  sources.push('Web search results');

  return sources;
}

