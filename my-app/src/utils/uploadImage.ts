import { toast } from "react-hot-toast"
import axios from "axios"
export const uploadMedia = async (file: File): Promise<string | null> => {
  const formData = new FormData()
  formData.append("image", file)

  try {
    const res = await fetch("http://localhost:8000/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    console.log("Upload response:", data)

    if (data.imageUrl) {
      toast.success("Image uploaded successfully!")
      return data.imageUrl // ✅ إرجاع رابط الصورة
    } else {
      toast.error("Image upload failed")
      return null
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    toast.error("Error uploading image")
    return null
  }
}
export const deleteFile = async (filename) => {
  try {
    const response = await axios.delete(`http://localhost:8000/api/upload/delete/${filename}`)
    return response.data
  } catch (error) {
    console.error("Error deleting file:", error.response?.data || error.message)
    throw error
  }
}
