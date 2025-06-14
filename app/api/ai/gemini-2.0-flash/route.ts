import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { streamText, Message } from 'ai';
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
    'You are a helpful, concise AI assistant. Always format responses using Markdown.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = schema.parse(body);

    const result = await streamText({
      model: google('gemini-2.0-flash'),
      messages: [SYSTEM_MESSAGE, ...messages],
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
