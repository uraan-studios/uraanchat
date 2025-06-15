import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import { v4 as uuid } from "uuid";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

// === Types ===
export type FileUploadResponse = {
  url: string;
  key: string;
};

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/heic",
  "text/plain",
  "application/pdf",
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const POST = async (req: Request) => {
  const session = await auth.api.getSession(req);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { fileName, fileSize, fileType } = body;

  if (!fileName || !fileSize || !fileType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(fileType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  if (fileSize > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
  }

  const key = `f/${uuid()}`; // userId removed from path

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize, // Optional but can help for validation
  });

  const url = await getSignedUrl(r2, command, { expiresIn: 60 });

  return NextResponse.json({ url, key });
};


export const GET = async (req: Request) => {
  const session = await auth.api.getSession(req);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const sort = searchParams.get("sort");
  const search = searchParams.get("search");

  const files = await db.file.findMany({
    where: {
      userId,
      ...(type && type !== "all" ? { type: { contains: type } } : {}),
      ...(search ? { name: { contains: search} } : {}),
    },
    orderBy: sort === "size" ? { size: "desc" } : { createdAt: "desc" },
  });

  return NextResponse.json({
    files: files.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      createdAt: f.createdAt,
      key: f.key,
    })),
  });
};

export const DELETE = async (req: Request) => {
  const session = await auth.api.getSession(req);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await req.json();

  if (!key) {
    return NextResponse.json({ error: "File key not provided" }, { status: 400 });
  }

  const file = await db.file.findUnique({ where: { key } });

  if (!file || file.userId !== userId) {
    return NextResponse.json({ error: "File not found or unauthorized" }, { status: 404 });
  }

  await db.file.delete({ where: { key } });

  return NextResponse.json({ success: true });
};
