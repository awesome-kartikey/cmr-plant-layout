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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      onChange(result)
      setError("")
    }
    reader.readAsDataURL(file)
  }

  const handleCamera = async () => {
    try {
      const { Camera } = await import("@capacitor/camera")
      const { CameraSource } = await import("@capacitor/camera/dist/esm/definitions")
      const image = await Camera.pickImages({
        quality: 80,
        limit: 1,
      })
      if (image.photos.length > 0) {
        onChange(image.photos[0].path || image.photos[0].webPath || "")
        setError("")
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
