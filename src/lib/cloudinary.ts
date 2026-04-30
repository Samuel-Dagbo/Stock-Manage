import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary

export const uploadImage = async (fileDataUri: string) => {
  try {
    const result = await cloudinary.uploader.upload(fileDataUri, {
      folder: "stock-manage",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    })
    return { success: true, url: result.secure_url, publicId: result.public_id }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    return { success: false, error }
  }
}

export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId)
    return { success: true }
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    return { success: false, error }
  }
}