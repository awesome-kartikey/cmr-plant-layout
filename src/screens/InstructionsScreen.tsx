import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { LayoutShell } from "../components/shared/LayoutShell"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { VideoIcon } from "lucide-react"

const instructions = [
  "instruction1",
  "instruction2",
  "instruction3",
  "instruction4",
  "instruction5",
  "instruction6",
  "instruction7",
]

export default function InstructionsScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <LayoutShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-indigo-700">
          {t("startTraining")}
        </h1>

        <Card>
          <CardContent className="space-y-4 p-6">
            <ol className="list-decimal space-y-3 pl-5">
              {instructions.map((key, i) => (
                <li key={i} className="text-gray-700 leading-relaxed">
                  {t(key)}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <VideoIcon className="h-5 w-5 text-indigo-600" />
              Tutorial Video
            </h2>
            <video
              controls
              className="w-full rounded-lg border"
              preload="metadata"
            >
              <source src="/video/tutorial.mp4" type="video/mp4" />
            </video>
          </CardContent>
        </Card>

        <Button
          size="lg"
          className="w-full"
          onClick={() => navigate("/form")}
        >
          {t("startTest")}
        </Button>
      </div>
    </LayoutShell>
  )
}
