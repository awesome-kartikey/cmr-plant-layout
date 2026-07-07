import jsPDF from "jspdf"
import type { EmployeeData, TestData } from "../types"

function getBandLabel(percentage: number) {
  if (percentage >= 90) return { label: "Level 1 - Excellent", color: "#4CAF50" }
  if (percentage >= 75) return { label: "Level 2 - Good", color: "#8BC34A" }
  if (percentage >= 60) return { label: "Level 3 - Average", color: "#FFC107" }
  if (percentage >= 40) return { label: "Level 4 - Below Average", color: "#FF9800" }
  return { label: "Poor", color: "#F44336" }
}

export function generateCertificate(employeeData: EmployeeData, testData: TestData): jsPDF {
  const doc = new jsPDF({ format: "a4", unit: "mm" })
  const pageW = 210
  const formattedDate = new Date(employeeData.testDate).toISOString().split("T")[0]

  doc.setDrawColor(30, 58, 138)
  doc.setLineWidth(2)
  doc.rect(10, 10, pageW - 20, 277)

  doc.setFontSize(36)
  doc.setTextColor(30, 58, 138)
  doc.text("ENDURANCE DOJO", pageW / 2, 35, { align: "center" })

  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text("Excellence in Defect Detection Training", pageW / 2, 44, { align: "center" })

  doc.setFontSize(22)
  doc.setTextColor(30, 58, 138)
  doc.text("Training Proficiency Certificate", pageW / 2, 62, { align: "center" })

  doc.setDrawColor(200)
  doc.setLineWidth(0.5)
  doc.line(40, 70, pageW - 40, 70)

  const maxScore = testData.totalAttempts * 20
  const percentage = maxScore > 0 ? Math.round((testData.score / maxScore) * 100) : 0
  const band = getBandLabel(percentage)

  doc.setFontSize(11)
  doc.setTextColor(60)

  const details = [
    `Employee Name: ${employeeData.name}`,
    `Employee ID: ${employeeData.employeeCode}`,
    `Assessment Date: ${formattedDate}`,
    `Final Score: ${testData.score} / ${maxScore} (${percentage}%)`,
    `Performance Level: ${band.label}`,
    `Attempts Used: ${testData.attempts.length} of ${testData.totalAttempts}`,
  ]

  details.forEach((line, i) => {
    doc.text(line, 30, 88 + i * 8)
  })

  doc.setDrawColor(200)
  doc.setLineWidth(0.5)
  doc.line(40, 138, pageW - 40, 138)

  doc.setFontSize(14)
  doc.setTextColor(30, 58, 138)
  doc.text("Attempt Details", 30, 152)

  const headers = ["#", "Hazard", "Selected Exit", "Points"]
  const colX = [30, 55, 105, 155]
  const colW = [25, 50, 50, 30]

  doc.setFillColor(30, 58, 138)
  doc.setTextColor(255)
  doc.setFontSize(9)
  headers.forEach((h, i) => {
    doc.rect(colX[i], 158, colW[i], 7, "F")
    doc.text(h, colX[i] + 2, 163)
  })

  doc.setTextColor(60)
  testData.attempts.forEach((attempt, i) => {
    const y = 167 + i * 7
    if (i % 2 === 0) {
      doc.setFillColor(242, 246, 252)
      doc.rect(30, y, 155, 7, "F")
    }
    doc.text(`${i + 1}`, colX[0] + 2, y + 5)
    doc.text(attempt.hazard, colX[1] + 2, y + 5)
    doc.text(attempt.selectedExit, colX[2] + 2, y + 5)
    doc.text(`${attempt.points}`, colX[3] + 2, y + 5)
  })

  doc.setFontSize(10)
  doc.setTextColor(150)
  doc.text("Assessment completed at Tetrahedron Manufacturing Services Pvt. Ltd.", pageW / 2, 230, { align: "center" })
  doc.text(`Certificate ID: ED-${formattedDate}-${employeeData.employeeCode}`, pageW / 2, 238, { align: "center" })

  doc.setDrawColor(100)
  doc.setLineWidth(0.5)
  doc.line(30, 250, 90, 250)
  doc.line(pageW - 90, 250, pageW - 30, 250)
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text("Examiner Signature", 60, 256, { align: "center" })
  doc.text("Training Director", pageW - 60, 256, { align: "center" })

  doc.setFontSize(8)
  doc.setTextColor(180)
  doc.text("ENDURANCE", pageW / 2, 270, { align: "center", angle: 0 })

  return doc
}

export function shareCertificate(doc: jsPDF, fileName: string) {
  const pdfBlob = doc.output("blob")
  const url = URL.createObjectURL(pdfBlob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
