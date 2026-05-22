import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import path from "path";
import os from "os";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
): Promise<UploadApiResponse> => {
  // Write buffer to temporary file
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${file.originalname}`);

  try {
    console.log("Writing file to temp:", tempFilePath);
    fs.writeFileSync(tempFilePath, file.buffer);

    console.log("Uploading to Cloudinary...");
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: folder,
      resource_type: "auto",
    });

    console.log("✓ Upload successful:", result.secure_url);
    return result;
  } catch (error) {
    console.error("Cloudinary error:", error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    // Clean up temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
};

export default cloudinary;
