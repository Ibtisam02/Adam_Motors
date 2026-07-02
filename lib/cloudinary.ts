import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Delete one or more images from Cloudinary by their public IDs.
 * Used to prevent orphaned files when a DB write fails or a car/image
 * is removed.
 */
export async function deleteCloudinaryImages(publicIds: string[]) {
  if (!publicIds.length) return;
  try {
    await cloudinary.api.delete_resources(publicIds, { resource_type: "image" });
  } catch (err) {
    // Log but don't throw — we don't want a cleanup failure to mask
    // the original error, but we do want it recorded.
    console.error("Failed to delete Cloudinary images:", publicIds, err);
  }
}
type CloudinarySignatureParams = {
  timestamp: number | string;
  folder: string;
};
/** Generate a signature for direct (signed) uploads from the server */
export function getCloudinarySignature(params: CloudinarySignatureParams) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET as string;
  console.log(apiSecret);
console.log(process.env.CLOUDINARY_API_SECRET);
console.log(params);


  const cleanParams = {
    timestamp: params.timestamp,
    folder: params.folder,
  };

  return cloudinary.utils.api_sign_request(cleanParams, apiSecret);
}

export default cloudinary;
