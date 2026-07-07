import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useTest } from "../../contexts/TestContext"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "../ui/alert-dialog"
import { ImageInput } from "./ImageInput"

interface EmployeeFormProps {
  onSubmit: () => void
}

export function EmployeeForm({ onSubmit }: EmployeeFormProps) {
  const { t } = useTranslation()
  const { employeeData, updateEmployeeData } = useTest()
  const [name, setName] = useState(employeeData.name)
  const [code, setCode] = useState(employeeData.employeeCode)
  const [photo, setPhoto] = useState<string | null>(employeeData.photo)
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!name.trim()) { setError(t("employeeNameInvalid")); return }
    if (!code.trim()) { setError(t("employeeCodeInvalid")); return }
    if (!/^[a-zA-Z\s]+$/.test(name)) { setError(t("employeeNameInvalid")); return }
    if (!/^\d+$/.test(code)) { setError(t("employeeCodeInvalid")); return }
    if (!photo) { setError(t("employeeFormError")); return }

    updateEmployeeData({
      name: name.trim(),
      employeeCode: code.trim(),
      photo,
      testDate: new Date(),
    })
    onSubmit()
  }

  return (
    <>
      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t("employeeNameLabel")}</label>
            <Input
              placeholder={t("employeeNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t("employeeCodeLabel")}</label>
            <Input
              placeholder={t("employeeCodePlaceholder")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t("employeeDetailsTitle")}</label>
            <ImageInput value={photo} onChange={setPhoto} />
          </div>

          <Button size="lg" className="w-full" onClick={handleSubmit}>
            {t("continueButton")}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={!!error} onOpenChange={() => setError("")}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alertErrorTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <Button onClick={() => setError("")}>OK</Button>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
