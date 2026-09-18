import { supabase } from "./supabase";

const BUCKET = "property-documents";
const MEDIA_BUCKET = "property-media";

function extensionForAsset(asset) {
  const match = asset?.fileName?.match(/\.([a-z0-9]+)$/i);
  if (match) return match[1].toLowerCase();
  const typeMatch = asset?.mimeType?.match(/image\/([a-z0-9]+)/i);
  return typeMatch ? typeMatch[1].toLowerCase() : "jpg";
}

function mediaExtensionForAsset(asset) {
  const match = asset?.fileName?.match(/\.([a-z0-9]+)$/i);
  if (match) return match[1].toLowerCase();
  const typeMatch = asset?.mimeType?.match(/(?:image|video)\/([a-z0-9]+)/i);
  return typeMatch ? typeMatch[1].toLowerCase() : "mp4";
}

async function blobFromUri(uri) {
  const response = await fetch(uri);
  if (!response.ok)
    throw new Error("Unable to read the selected document image");
  return response.blob();
}

async function uploadAsset(asset, sellerId, bucket, extension, fallbackType) {
  if (!asset?.uri) throw new Error("Select a file before uploading");
  const path = `${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const blob = await blobFromUri(asset.uri);
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: asset.mimeType || fallbackType,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl)
    throw new Error("Upload completed without a public URL");
  return data.publicUrl;
}

export async function uploadPropertyDocument(asset, sellerId) {
  if (!asset?.uri) throw new Error("Select a document image before uploading");
  const extension = extensionForAsset(asset);
  return uploadAsset(asset, sellerId, BUCKET, extension, "image/jpeg");
}

export async function uploadPropertyMedia(asset, sellerId) {
  const extension = mediaExtensionForAsset(asset);
  const fallbackType = asset?.type === "video" ? "video/mp4" : "image/jpeg";
  return uploadAsset(asset, sellerId, MEDIA_BUCKET, extension, fallbackType);
}

export async function deletePropertyDocument(documentUrl) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = documentUrl?.indexOf(marker);
  if (index === -1) return;
  const path = documentUrl.slice(index + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
