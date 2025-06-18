// app/api/chat/route.ts
import { SYSTEM_MESSAGE } from "@/constants/system";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, CoreMessage, generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

// const runtime = "edge"; // Optional: Enable edge runtime


// Background task to generate and set chat title
async function generateAndSetChatTitle({
  id,
  messages,
  userId,
  openrouter
}: {
  id: string;
  messages: CoreMessage[];
  userId: string;
  openrouter: ReturnType<typeof createOpenRouter>;
}) {
  try {
    const titleModel = openrouter.chat("google/gemini-2.5-flash", {
      user: userId,
    });

    const { text } = await generateText({
      model: titleModel,
      messages,
      system:
        "You'll generate a title for this chat based on the user's message. Return only the title, no quotes or extra text",
    });

    await db.chat.update({
      where: { id },
      data: { title: text },
    });
  } catch (err) {
    console.error("Failed to generate chat title:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    // AUTH
    const session = await auth.api.getSession(req);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { id, messages, model, apikey }: { id: string; messages: CoreMessage[]; model: string, apikey: string } = body;

    const openrouter = createOpenRouter({
      apiKey: apikey!,
    });


    if (!model) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    // Fetch or create chat
    let chat = await db.chat.findUnique({
      where: { id },
    });

    if (chat && chat.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access to chat" }, { status: 403 });
    }

    if (!chat) {
      chat = await db.chat.create({
        data: {
          id,
          userId,
          title: "",
          rootMessage: "",
        },
      });

      // Run background title generation
      void generateAndSetChatTitle({ id, messages, userId, openrouter });
    }

    // Save last user message (assumes last user message is at the end)
    const userMessage = messages.findLast((m) => m.role === "user");
    if (userMessage) {
      await db.message.create({
        data: {
          chatId: chat.id,
          userId,
          role: "user",
          content: JSON.stringify(userMessage),
        },
      });
    }

    // Stream assistant response
    const chatModel = openrouter.chat(model, {
      reasoning: { effort: "high" },
      usage: { include: true },
      user: userId,
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
                content: JSON.stringify(assistantMessage),
              },
              select: { id: true },
            });

            console.log("Assistant message saved with ID:", saved.id);
          }
        } catch (err) {
          console.error("Failed to save assistant message:", err);
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
