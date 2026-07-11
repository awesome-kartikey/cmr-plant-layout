import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useTest } from "../../contexts/TestContext"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "../ui/alert-dialog"
import { ImageInput } from "./ImageInput"
import { User, Contact2, Shield } from "lucide-react"

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
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-8 md:p-10">
          <div className="grid gap-10 md:grid-cols-12">

            {/* Form Fields (7 Columns) */}
            <div className="md:col-span-7 space-y-7">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  {t("employeeNameLabel")}
                </label>
                <Input
                  placeholder={t("employeeNamePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-16 text-2xl px-6 bg-slate-50 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all"
                />
              </div>

              {/* Employee Code Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <Contact2 className="h-4 w-4 text-indigo-500" />
                  {t("employeeCodeLabel")}
                </label>
                <Input
                  placeholder={t("employeeCodePlaceholder")}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-16 text-2xl px-6 bg-slate-50 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all"
                />
              </div>

              {/* Photo Capture */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-widest">
                  Capture Verification Photo
                </label>
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                  <ImageInput value={photo} onChange={setPhoto} />
                </div>
              </div>

              {/* Continue Button */}
              <Button
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer py-8 text-2xl rounded-xl font-black shadow-lg shadow-indigo-600/25 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                onClick={handleSubmit}
              >
                {t("continueButton")}
              </Button>
            </div>

            {/* Live ID Badge Preview (5 Columns) */}
            <div className="md:col-span-5 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200 rounded-2xl relative overflow-hidden min-h-[380px]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl" />

              {/* ID Badge Body */}
              <div className="w-full max-w-[260px] aspect-[1/1.5] border border-slate-200 bg-white rounded-2xl shadow-2xl p-5 flex flex-col items-center justify-between text-center relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">

                {/* Badge top brand header */}
                <div className="w-full border-b pb-3 flex flex-col items-center">
                  <span className="text-sm font-black text-indigo-700 tracking-widest">CMR</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Manufacturing Services</span>
                </div>

                {/* ID Photo circular viewport */}
                <div className="my-4 relative">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Badge Avatar"
                      className="w-28 h-28 rounded-full border-4 border-indigo-100 object-cover shadow-md bg-slate-50 animate-in zoom-in-95 duration-300"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-1 bg-indigo-600 text-white rounded-full p-1.5 border-2 border-white shadow">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Details text fields */}
                <div className="space-y-1 w-full">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest truncate px-1">
                    {name.trim() || "Employee Name"}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">
                    ID: {code.trim() || "••••••"}
                  </p>
                </div>

                {/* Badge bottom credential details */}
                <div className="w-full border-t border-dashed pt-3 mt-2 flex items-center justify-between text-[9px] font-bold text-indigo-600 tracking-widest uppercase">
                  <span>Trainee</span>
                  <span>CMR-PLT</span>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!error} onOpenChange={() => setError("")}>
        <AlertDialogContent className="bg-white border border-slate-100 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alertErrorTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <Button onClick={() => setError("")} className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">OK</Button>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
