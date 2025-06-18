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