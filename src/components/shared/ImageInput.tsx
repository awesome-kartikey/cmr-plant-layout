import { useState, useRef } from "react"
import { useTranslation } from "react-i18next"

interface ImageInputProps {
  value: string | null
  onChange: (uri: string) => void
}

export function ImageInput({ value, onChange }: ImageInputProps) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = base64Str
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX_WIDTH = 500
        const MAX_HEIGHT = 500
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL("image/jpeg", 0.7)) // 70% quality JPEG
      }
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const result = ev.target?.result as string
      const compressed = await compressImage(result)
      onChange(compressed)
      setError("")
    }
    reader.readAsDataURL(file)
  }

  const handleCamera = async () => {
    try {
      const { Camera } = await import("@capacitor/camera")
      const { CameraSource } = await import("@capacitor/camera/dist/esm/definitions")
      const image = await Camera.pickImages({
        quality: 70,
        limit: 1,
        width: 500, // Capacitor camera handles downscaling if we pass these options
        height: 500
      })
      if (image.photos.length > 0) {
        // Capacitor might return a webPath that is already local or base64. 
        // If it returns webPath, we can just use it, or fetch and compress it if it's too large.
        // It's safer to just fetch it and run compressImage.
        const res = await fetch(image.photos[0].webPath || image.photos[0].path || "")
        const blob = await res.blob()
        const reader = new FileReader()
        reader.onload = async (ev) => {
          const result = ev.target?.result as string
          const compressed = await compressImage(result)
          onChange(compressed)
          setError("")
        }
        reader.readAsDataURL(blob)
      }
    } catch {
      fileRef.current?.click()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {value ? (
          <img
            src={value}
            alt="Employee"
            className="h-20 w-20 rounded-full border-2 border-indigo-200 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
            <span className="text-2xl text-gray-400">📷</span>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t("selectImageButton")}
          </button>
          <button
            type="button"
            onClick={handleCamera}
            className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            {t("takePhotoButton")}
          </button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {!value && (
        <p className="text-sm text-gray-400">{t("noImageSelected")}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
