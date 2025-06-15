import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { r2 } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const session = await auth.api.getSession(req);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let key: string;

  try {
    const body = await req.json();
    key = body.key;
    if (!key || typeof key !== "string") {
      throw new Error("Invalid key");
    }
  } catch {
    return NextResponse.json({ error: "Missing or invalid key" }, { status: 400 });
  }

  const file = await db.file.findUnique({
    where: { key },
  });

  if (!file || file.userId !== userId) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const cdnUrl = process.env.R2_CDN_URL;

  if (cdnUrl) {
    // Serve via CDN
    return NextResponse.json({ url: `${cdnUrl}/${key}` });
  }

  // Fallback to signed S3-style URL
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
  });

  const url = await getSignedUrl(r2, command, { expiresIn: 60 });

  return NextResponse.json({ url });
};
