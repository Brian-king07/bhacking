import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createId } from "@/lib/content/id";
import { isMediaBucket, type MediaBucket } from "@/lib/supabase/buckets";
import { createServiceClient, publicStorageUrl } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const bucketRaw = String(formData.get("bucket") ?? "media");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa JPG, PNG, WEBP o GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen no puede superar 5MB." },
      { status: 400 },
    );
  }

  if (!isMediaBucket(bucketRaw)) {
    return NextResponse.json({ error: "Bucket inválido" }, { status: 400 });
  }

  const bucket: MediaBucket = bucketRaw;
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";

  const path = `${createId("img")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = createServiceClient();

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("[supabase] upload:", error.message);
    return NextResponse.json(
      { error: `Error al subir: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    url: publicStorageUrl(bucket, path),
    bucket,
    path,
  });
}
