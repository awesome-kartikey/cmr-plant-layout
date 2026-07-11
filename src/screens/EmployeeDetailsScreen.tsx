import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { LayoutShell } from "../components/shared/LayoutShell"
import { EmployeeForm } from "../components/shared/EmployeeForm"

export default function EmployeeDetailsScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = () => {
    navigate("/training")
  }

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 space-y-10 py-10">
        <h1 className="text-4xl font-black text-indigo-700">
          {t("employeeDetailsTitle")}
        </h1>
        <p className="text-lg text-gray-500 font-medium">{t("employeeDetailsSubtitle")}</p>
        <EmployeeForm onSubmit={handleSubmit} />
      </div>
    </LayoutShell>
  )
}
