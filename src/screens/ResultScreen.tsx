import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { db, storage } from "../lib/firebase"
import { useTest } from "../contexts/TestContext"
import { LayoutShell } from "../components/shared/LayoutShell"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { toast } from "sonner"
import { generateCertificate, shareCertificate } from "../lib/certificate"

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

function getAccuracyLabel(accuracy?: string) {
  switch (accuracy) {
    case "excellent": return { label: "Excellent", color: "bg-green-100 text-green-800" }
    case "good": return { label: "Good", color: "bg-blue-100 text-blue-800" }
    case "average": return { label: "Average", color: "bg-yellow-100 text-yellow-800" }
    default: return { label: "Poor", color: "bg-red-100 text-red-800" }
  }
}

export default function ResultScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { employeeData, testData, resetTest } = useTest()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const initials = (employeeData.name || "NA").substring(0, 2).toUpperCase()

  const saveResult = async () => {
    if (isSaving || saved) return
    setIsSaving(true)

    try {
      if (!employeeData.employeeCode) {
        toast.error("Missing employee data")
        setIsSaving(false)
        return
      }

      const employeeCode = employeeData.employeeCode.trim()
      const employeeRef = doc(db, "PlantLayout", employeeCode)

      let photoUrl = employeeData.photoUrl ?? null
      if (!photoUrl && employeeData.photo) {
        const storageRef = ref(storage, `employees/${employeeCode}/profile.jpg`)
        await uploadString(storageRef, employeeData.photo, "data_url")
        photoUrl = await getDownloadURL(storageRef)
      }

      await setDoc(employeeRef, {
        name: employeeData.name,
        employeeCode,
        testDate: employeeData.testDate.toISOString(),
        photoUrl: photoUrl ?? null,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      await addDoc(collection(employeeRef, "Results"), {
        score: testData.score,
        totalAttempts: testData.totalAttempts,
        attempts: testData.attempts,
        createdAt: serverTimestamp(),
      })

      setSaved(true)
      toast.success("Results saved successfully!")
    } catch (err) {
      console.error("Save error:", err)
      toast.error("Failed to save results")
      setIsSaving(false)
    }
  }

  const handleDownloadCertificate = () => {
    const doc = generateCertificate(employeeData, testData)
    shareCertificate(doc, `certificate-${employeeData.employeeCode}.pdf`)
  }

  const handlePlayAgain = () => {
    resetTest()
    navigate("/training")
  }

  const handleHome = () => {
    navigate("/home")
  }

  return (
    <LayoutShell>
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            {employeeData.photoUrl || employeeData.photo ? (
              <img
                src={employeeData.photoUrl ?? employeeData.photo ?? ""}
                alt="Employee"
                className="h-16 w-16 rounded-full border-2 border-indigo-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{employeeData.name || t("unknownEmployee")}</h2>
              <p className="text-gray-500">{t("idPrefix", { id: employeeData.employeeCode || "N/A" })}</p>
              <p className="text-sm text-gray-400">
                {t("testDate")}: {new Date(employeeData.testDate).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-lg text-gray-500">{t("score")}</p>
            <p className={`text-5xl font-bold ${getScoreColor(testData.score)}`}>
              {testData.score}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {testData.totalAttempts} {t("attempts")}
            </p>
          </CardContent>
        </Card>

        {testData.attempts.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-bold">{t("viewAttempts")}</h3>
              <div className="space-y-3">
                {testData.attempts.map((attempt, i) => {
                  const acc = getAccuracyLabel(attempt.pathScore?.accuracy)
                  return (
                    <div key={i} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{t("attempts")} {i + 1}</p>
                        <Badge variant="secondary">{attempt.points} pts</Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><span className="text-gray-500">{t("nearestExit")}:</span> {attempt.nearestExit}</p>
                        <p><span className="text-gray-500">{t("selectedExit")}:</span> {attempt.selectedExit}</p>
                        {attempt.pathScore && (
                          <>
                            <p><span className="text-gray-500">{t("pathScore")}:</span> {attempt.pathScore.score}</p>
                            <p>
                              <span className="text-gray-500">{t("pathAccuracy")}:</span>{" "}
                              <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${acc.color}`}>
                                {acc.label}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          <Button className="w-full" onClick={saveResult} disabled={isSaving || saved}>
            {isSaving ? t("saving") : saved ? t("saved") : t("saveButton")}
          </Button>

          <Button className="w-full" variant="secondary" onClick={handleDownloadCertificate}>
            Download Certificate
          </Button>

          <div className="flex gap-4">
            <Button className="flex-1" variant="outline" onClick={handleHome}>
              {t("home")}
            </Button>
            <Button className="flex-1" onClick={handlePlayAgain}>
              {t("playAgain")}
            </Button>
          </div>
        </div>
      </div>
    </LayoutShell>
  )
}
