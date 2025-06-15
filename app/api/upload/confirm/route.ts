import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { z } from "zod";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/heic",
  "text/plain",
  "application/pdf",
];

const MAX_SIZE = 5 * 1024 * 1024;

const confirmSchema = z.object({
  key: z.string(),
  size: z.number(),
  name: z.string(),
  type: z.string(),
  tags: z.array(z.string()).optional(),
});

export const POST = async (req: Request) => {
  const session = await auth.api.getSession(req);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = confirmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { key, size, name, type, tags } = parsed.data;

  if (!ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  // (Optional) Confirm actual size from R2
  const head = await r2.send(
    new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
    })
  );

  if (head.ContentLength !== size) {
    return NextResponse.json({ error: "Size mismatch" }, { status: 400 });
  }

  await db.file.create({
    data: {
      userId,
      key,
      size,
      name,
      type,
      ...(tags ? { tags } : {}),
    },
  });

  return NextResponse.json({ success: true });
};
