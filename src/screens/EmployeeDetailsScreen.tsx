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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-indigo-700">
          {t("employeeDetailsTitle")}
        </h1>
        <p className="text-gray-500">{t("employeeDetailsSubtitle")}</p>
        <EmployeeForm onSubmit={handleSubmit} />
      </div>
    </LayoutShell>
  )
}
