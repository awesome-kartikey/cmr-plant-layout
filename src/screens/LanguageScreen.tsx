import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import i18n from "../lib/i18n"
import { Button } from "../components/ui/button"

export default function LanguageScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSelect = (lang: string) => {
    i18n.changeLanguage(lang)
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
          {t("selectLanguage")}
        </h1>
        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            className="w-full text-lg"
            onClick={() => handleSelect("en")}
          >
            English
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full text-lg"
            onClick={() => handleSelect("hi")}
          >
            हिंदी
          </Button>
        </div>
      </div>
    </div>
  )
}
