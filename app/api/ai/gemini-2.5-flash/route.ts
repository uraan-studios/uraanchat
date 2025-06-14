import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { streamText, Message, generateText } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
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

    const result = await generateText({
      model: google('gemini-2.0-flash-thinking-exp-01-21'),
      maxTokens: 512,
      messages: [SYSTEM_MESSAGE, ...messages],
    });

    console.log(result.reasoning);
    console.log(result.reasoningDetails);

    return result;
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
