// app/api/chat/generate-title/route.ts
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { NextRequest } from 'next/server';

export const runtime = 'edge'; // optional, for Edge functions if you're using streaming

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession(req);
    const userId = session?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const { chatId, content } = await req.json();

    if (!chatId || !content) {
      return new Response(
        JSON.stringify({ error: 'Chat ID and content are required' }),
        { status: 400 }
      );
    }

    const chat = await db.chat.findUnique({
      where: { id: chatId },
      select: { userId: true },
    });

    if (!chat || chat.userId !== userId) {
      return new Response(JSON.stringify({ error: 'Chat not found' }), {
        status: 404,
      });
    }

    const prompt = `Generate a concise, descriptive title (maximum 6 words) for this conversation based on the user's message. Return only the title, no quotes or extra text.\n\nUser message: "${content.slice(0, 200)}"`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    const result = await response.json();
    const title = result.choices?.[0]?.message?.content?.trim() ?? 'Untitled';

    await db.chat.update({
      where: { id: chatId },
      data: { title: title.slice(0, 100) },
    });

    return new Response(JSON.stringify({ title }));
  } catch (error) {
    console.error('Title generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate title' }), {
      status: 500,
    });
  }
}
