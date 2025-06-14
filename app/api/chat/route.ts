// app/api/chat/route.ts

import { google } from '@ai-sdk/google';
import { streamText, Message } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'edge'; // Optional: switch to 'nodejs' if local-only

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const schema = z.object({
      messages: z.array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })
      ),
    });

    const { messages } = schema.parse(body);

    const result = await streamText({
      model: google('gemini-1.5-flash'), // Use latest or correct model name
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
