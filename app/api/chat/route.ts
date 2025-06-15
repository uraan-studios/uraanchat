// app/api/chat/route.ts
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, CoreMessage } from "ai";
import { NextRequest, NextResponse } from "next/server";

// Use the edge runtime for best streaming performance
export const runtime = "edge";

// Initialize the OpenRouter provider with the API key from environment variables
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Ensure messages and model are present in the request body
    const { messages, model }: { messages: CoreMessage[]; model: string } =
      body;

    if (!model) {
      return new Response(JSON.stringify({ error: "Model is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the specific model from the provider
    const chatModel = openrouter.chat(model);

    // Call the streamText function with the model and messages
    const result = await streamText({
      model: chatModel,
      messages,
    });

    // Return the stream as a Data Stream response
    return result.toDataStreamResponse({
      sendReasoning: true,
      sendSources: true,
    });
  } catch (error) {
    // Generic error handling
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}