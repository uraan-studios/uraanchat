/* pages/api/ai/gemini-2.5-flash.ts */

import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { streamText, Message, tool } from 'ai'; // Import 'tool'
import { z } from 'zod';

export const runtime = 'edge';

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ),
});

const SYSTEM_MESSAGE: Message = {
  id: 'system',
  role: 'system',
  content:
    'You are a helpful, concise AI assistant made by Uraan Studios called Uraan Chat. Always format responses using Markdown.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = schema.parse(body);

    const result = await streamText({
      model: google('models/gemini-2.5-flash-preview-05-20'),
      providerOptions: {
        google: {
          // This config now has an effect because tools are present
          thinkingConfig: {
            thinkingBudget: 2048,
          },
        },
      },
      messages: [SYSTEM_MESSAGE, ...messages],
      // ADD THIS: Define a tool for the model to consider
      tools: {
        getWeather: tool({
          description:
            'Get the current weather for a specific location.',
          parameters: z.object({
            city: z.string().describe('The city to get the weather for.'),
          }),
          execute: async ({ city }) => {
            // In a real app, you'd call a weather API here.
            // For this example, we'll just return a mock response.
            return {
              city,
              temperature: Math.floor(Math.random() * 30) + '°C',
              description: 'Sunny with a chance of clouds.',
            };
          },
        }),
      },
    });

    return result.toDataStreamResponse({
      // This will now send the reasoning steps when they are generated
      sendReasoning: true,
      sendSources: true,
      sendUsage: true,
    });
  } catch (error: any){
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}