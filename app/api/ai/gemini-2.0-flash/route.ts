import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText, type Message } from "ai";
import { z } from "zod";

export const runtime = "edge";

// --- Zod Schemas for Validating Incoming Request ---
// No changes needed here, they are correct.
const TextPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const UrlAttachmentPartSchema = z.object({
  type: z.enum(["image", "document"]),
  url: z.string().url(),
  mimeType: z.string().optional(),
});

const ContentPartSchema = z.union([TextPartSchema, UrlAttachmentPartSchema]);

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.union([z.string(), z.array(ContentPartSchema)]),
});

const RequestBodySchema = z.object({
  messages: z.array(MessageSchema),
});

const SYSTEM_MESSAGE: Message = {
  id: 'system',
  role: "system",
  content: `You are Uraan Chat, an AI assistant powered by the Uraan Studios. Your role is to assist and engage in conversation while being helpful, respectful, and engaging.
- If you are specifically asked about the model you are using, you may mention that you use the Gemini 2.5 Pro model. If you are not asked specifically about the model you are using, you do not need to mention it.
- The current date and time including timezone is 6/15/2025, 10:33:58 AM GMT+5.
- Always use LaTeX for mathematical expressions:
    - Inline math must be wrapped in escaped parentheses: \\( content \\)
    - Do not use single dollar signs for inline math
    - Display math must be in double dollar signs: $$ content $$
- Ensure code is properly formatted using Prettier with a print width of 80
- Present code in Markdown code blocks with the correct language extension indicated`,
};

export async function POST(req: NextRequest) {
  try {
    // The `useChat` hook sends the whole message history.
    // The new content (with attachments) is part of the last message.
    const { messages } = RequestBodySchema.parse(await req.json());

    const processedMessages = await Promise.all(
      messages.map(async (message) => {
        if (typeof message.content === "string") {
          return message;
        }

        const processedContent = await Promise.all(
          message.content.map(async (part) => {
            if (part.type === "text") {
              return part;
            }

            if (part.type === "image") {
              return {
                type: "image",
                image: new URL(part.url),
              };
            }

            if (part.type === "document") {
              if (!part.mimeType) {
                throw new Error(
                  `MIME type is required for 'document' attachments. URL: ${part.url}`,
                );
              }
              const response = await fetch(part.url);
              if (!response.ok) {
                throw new Error(
                  `Failed to fetch document from ${part.url}. Status: ${response.status}`,
                );
              }
              const data = new Uint8Array(await response.arrayBuffer());
              return {
                type: "data",
                mimeType: part.mimeType,
                data,
              };
            }

            // ===== THIS IS THE FIX =====
            // If the part type is unknown, throw an error.
            // This will be caught by the main catch block, ensuring a response.
            throw new Error(`Unsupported content part type: '${(part as any).type}'`);
            // ==========================
          }),
        );

        return {
          role: message.role,
          content: processedContent,
        };
      }),
    );

    const result = await streamText({
      model: google("gemini-2.5-flash-preview-05-20", ),
      messages: [SYSTEM_MESSAGE, ...(processedMessages as Message[])],
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof z.ZodError
            ? "Invalid request body"
            : "An internal server error occurred.",
        details: error.message,
      },
      // Use 400 for client errors (like bad input), 500 for server errors
      { status: error instanceof z.ZodError || error.message.includes("Unsupported") ? 400 : 500 },
    );
  }
}