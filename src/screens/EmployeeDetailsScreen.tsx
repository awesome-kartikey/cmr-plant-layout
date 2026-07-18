import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { LayoutShell } from "../components/shared/LayoutShell"
import { EmployeeForm } from "../components/shared/EmployeeForm"
import { useTest } from "../contexts/TestContext"

export default function EmployeeDetailsScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { testData } = useTest()

  const handleSubmit = () => {
    if (testData.attempts.length > 0) {
      navigate("/result")
    } else {
      navigate("/training")
    }
  }

  return (
    <LayoutShell noScroll>
      <div className="flex flex-col h-full mx-auto w-full max-w-6xl">
        <div className="mb-4 sm:mb-6 shrink-0">
          <h1 className="text-2xl sm:text-3xl font-black text-indigo-700">
            {t("employeeDetailsTitle")}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
            {t("employeeDetailsSubtitle")}
          </p>
        </div>
        
        {/* The form container takes the remaining vertical space */}
        <div className="flex-1 min-h-0 flex flex-col justify-center">
          <EmployeeForm onSubmit={handleSubmit} />
        </div>
      </div>
    </LayoutShell>
  )
}
