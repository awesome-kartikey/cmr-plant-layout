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
      <Card className="border-slate-100 shadow-md">
        <CardContent className="p-6">
          <div className="grid gap-8 md:grid-cols-12">
            
            {/* Form Fields (7 Columns) */}
            <div className="md:col-span-7 space-y-5">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t("employeeNameLabel")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={t("employeeNamePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 bg-slate-50/50 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t("employeeCodeLabel")}
                </label>
                <div className="relative">
                  <Contact2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={t("employeeCodePlaceholder")}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-9 bg-slate-50/50 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Capture Verification Photo
                </label>
                <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-lg">
                  <ImageInput value={photo} onChange={setPhoto} />
                </div>
              </div>

              <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer py-6 rounded-xl font-bold" onClick={handleSubmit}>
                {t("continueButton")}
              </Button>
            </div>

            {/* Live ID Badge Mockup Preview (5 Columns) */}
            <div className="md:col-span-5 flex items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden min-h-[320px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
              
              {/* ID Badge Body */}
              <div className="w-full max-w-[230px] aspect-[1/1.5] border border-slate-200/80 bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-between text-center relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">
                
                {/* Badge top brand header */}
                <div className="w-full border-b pb-2 flex flex-col items-center">
                  <span className="text-[10px] font-black text-indigo-700 tracking-wider">CMR</span>
                  <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-[0.15em]">Manufacturing Services</span>
                </div>

                {/* ID Photo circular viewport */}
                <div className="my-4 relative">
                  {photo ? (
                    <img 
                      src={photo} 
                      alt="Badge Avatar" 
                      className="w-24 h-24 rounded-full border-2 border-indigo-100 object-cover shadow-inner bg-slate-50 animate-in zoom-in-95 duration-300" 
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                      <span className="text-3xl">📷</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-1 bg-indigo-600 text-white rounded-full p-1 border border-white">
                    <Shield className="h-3 w-3" />
                  </div>
                </div>

                {/* Details text fields */}
                <div className="space-y-1 w-full">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide truncate px-1">
                    {name.trim() || "Employee Name"}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
                    ID: {code.trim() || "••••••"}
                  </p>
                </div>

                {/* Badge bottom credential details */}
                <div className="w-full border-t border-dashed pt-2 mt-2 flex items-center justify-between text-[8px] font-bold text-indigo-600/80 tracking-widest">
                  <span>TRAINEE</span>
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
