import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (req: NextRequest, {params}:  {params: Promise<{id: string}>}) => {
  const session = await auth.api.getSession(req);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  const chat = await db.chat.findUnique({
     where: { id },
     select: {
       id: true,
       userId: true,
       title: true,
       rootMessage: true,
       messages: {
         select: {
           id: true,
           role: true,
           content: true,
         }
       }
     },
    });

  if (!chat || chat.userId !== userId) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return NextResponse.json(chat);
};

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const chatId = params.id;
    
    // Verify the chat belongs to the user
    const chat = await db.chat.findUnique({
      where: { id: chatId },
      select: { userId: true }
    });

    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Delete all messages associated with this chat first
    await db.message.deleteMany({
      where: { chatId }
    });

    // Then delete the chat
    await db.chat.delete({
      where: { id: chatId }
    });

    return NextResponse.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}