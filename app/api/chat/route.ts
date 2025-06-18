// app/api/chat/route.ts
import { SYSTEM_MESSAGE } from "@/constants/system";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, CoreMessage } from "ai";
import { Settings } from "lucide-react";
import { NextRequest, NextResponse } from "next/server";

// Optional: Use edge runtime for lower latency
// export const runtime = "edge";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    // AUTH
    const session = await auth.api.getSession(req);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { id, messages, model }: { id: string; messages: CoreMessage[]; model: string } = body;

    if (!model) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    // Use existing chat if `id` exists
    let chat = await db.chat.findUnique({
      where: { id },
    });

    // Optional: Validate ownership of existing chat
    if (chat && chat.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access to chat" }, { status: 403 });
    }

    if (!chat) {
      chat = await db.chat.create({
        data: {
          id,
          userId,
          title: "", // Optional: You can set a preview of the first user message
          rootMessage: "", // Optional: Set later if needed
        },
      });
    }

    // Insert the last user message (assumes it's the most recent in the list)
    const userMessage = messages.findLast((m) => m.role === "user");
    if (userMessage) {
      await db.message.create({
        data: {
          chatId: chat.id,
          userId,
          role: "user",
          content: userMessage as unknown as object, // Store full message as JSON
        },
      });
    }

    

    // Stream LLM response
    const chatModel = openrouter.chat(model, {
      reasoning: {
        effort: "high",
      },
      user: userId,
      usage: {
        include: true
      },
      

      });
    const result = await streamText({
      model: chatModel,
      messages,
      system: SYSTEM_MESSAGE,
      
      async onFinish(result) {
        try {
          const assistantMessage = result.response.messages[0];
          if (assistantMessage) {
            const saved = await db.message.create({
              data: {
                chatId: chat!.id,
                userId: null,
                role: "assistant",
                content: assistantMessage as unknown as object,
              },
              select: { id: true },
            });

            console.log("Assistant message saved with ID:", saved.id);

            // Optional: Update chat title or rootMessage based on first messages
            // await db.chat.update({
            //   where: { id: chat.id },
            //   data: { title: ..., rootMessage: ... }
            // });
          }
        } catch (saveError) {
          console.error("Failed to save assistant message:", saveError);
        }
      },
    });

    return result.toDataStreamResponse({
      sendReasoning: true,
      sendSources: true,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
