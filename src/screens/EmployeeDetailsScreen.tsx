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
