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
  const pageH = 297
  const margin = 14
  const contentW = pageW - margin * 2
  const formattedDate = new Date(employeeData.testDate).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric"
  })

  const maxScore = testData.totalAttempts * 100
  const percentage = maxScore > 0 ? Math.round((testData.score / maxScore) * 100) : 0
  const band = getBandLabel(percentage)

  // ── outer border ─────────────────────────────────────
  doc.setDrawColor(30, 58, 138)
  doc.setLineWidth(1.5)
  doc.rect(margin, margin, contentW, pageH - margin * 2)

  // ── inner thin border ─────────────────────────────────
  doc.setLineWidth(0.4)
  doc.rect(margin + 2, margin + 2, contentW - 4, pageH - margin * 2 - 4)

  // ── Header background ──────────────────────────────────
  doc.setFillColor(30, 58, 138)
  doc.rect(margin + 2, margin + 2, contentW - 4, 28, "F")

  // ── Title ─────────────────────────────────────────────
  doc.setFontSize(15)
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.text("CMR MANUFACTURING SERVICES", pageW / 2, margin + 12, { align: "center" })

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(200, 220, 255)
  doc.text("Excellence in Emergency Evacuation & Plant Layout Training", pageW / 2, margin + 19, { align: "center" })

  // ── Certificate title ─────────────────────────────────
  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Training Proficiency Certificate", pageW / 2, margin + 38, { align: "center" })

  doc.setDrawColor(30, 58, 138)
  doc.setLineWidth(0.4)
  doc.line(margin + 20, margin + 41, pageW - margin - 20, margin + 41)

  // ── Employee info grid ────────────────────────────────
  let y = margin + 50
  const labelX = margin + 8
  const valueX = margin + 55

  const infoRows = [
    ["Employee Name", employeeData.name],
    ["Employee ID", employeeData.employeeCode],
    ["Assessment Date", formattedDate],
    ["Final Score", `${testData.score} / ${maxScore} pts  (${percentage}%)`],
    ["Performance Level", band.label],
    ["Total Attempts", `${testData.attempts.length} of ${testData.totalAttempts}`],
  ]

  doc.setFontSize(9)
  infoRows.forEach(([label, value], i) => {
    const rowY = y + i * 8
    if (i % 2 === 0) {
      doc.setFillColor(245, 248, 255)
      doc.rect(margin + 4, rowY - 4, contentW - 8, 8, "F")
    }
    doc.setFont("helvetica", "bold")
    doc.setTextColor(100, 116, 139)
    doc.text(label + ":", labelX, rowY)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(30, 41, 59)
    doc.text(value, valueX, rowY)
  })

  y += infoRows.length * 8 + 6

  // ── Divider ───────────────────────────────────────────
  doc.setDrawColor(200, 210, 230)
  doc.setLineWidth(0.4)
  doc.line(margin + 4, y, pageW - margin - 4, y)
  y += 8

  // ── Attempt table title ───────────────────────────────
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 58, 138)
  doc.text("Attempt Details", labelX, y)
  y += 6

  // ── Table header ──────────────────────────────────────
  const colX   = [margin + 4, margin + 18, margin + 70, margin + 120, margin + 150]
  const headers = ["#", "Hazard Location", "Gate Choice", "Path Quality", "Points"]

  doc.setFillColor(30, 58, 138)
  doc.rect(margin + 4, y, contentW - 8, 7, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  headers.forEach((h, i) => {
    doc.text(h, colX[i] + 2, y + 4.5)
  })
  y += 7

  // ── Table rows ────────────────────────────────────────
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)

  testData.attempts.forEach((attempt, i) => {
    const rowH = 7
    const rowY = y + i * rowH

    if (i % 2 === 0) {
      doc.setFillColor(242, 246, 252)
      doc.rect(margin + 4, rowY, contentW - 8, rowH, "F")
    }

    doc.setTextColor(30, 41, 59)
    doc.text(`${i + 1}`, colX[0] + 2, rowY + 4.5)
    doc.text(attempt.hazard, colX[1] + 2, rowY + 4.5)

    const isNearest = attempt.nearestExit === "Nearest Gate"
    doc.setTextColor(isNearest ? 22 : 185, isNearest ? 163 : 28, isNearest ? 74 : 28)
    doc.text(isNearest ? "✓ Nearest" : "✗ Further", colX[2] + 2, rowY + 4.5)

    const acc = attempt.pathScore?.accuracy ?? "—"
    const accColors: Record<string, [number, number, number]> = {
      excellent: [21, 128, 61],
      good: [22, 101, 52],
      average: [180, 100, 20],
      poor: [185, 28, 28],
    }
    const [r, g, b] = accColors[acc] ?? [100, 116, 139]
    doc.setTextColor(r, g, b)
    doc.text(acc.charAt(0).toUpperCase() + acc.slice(1), colX[3] + 2, rowY + 4.5)

    doc.setTextColor(30, 41, 59)
    doc.text(`${attempt.points}`, colX[4] + 2, rowY + 4.5)
  })

  y += testData.attempts.length * 7 + 10

  // ── Bottom border above footer ────────────────────────
  doc.setDrawColor(200, 210, 230)
  doc.setLineWidth(0.4)
  doc.line(margin + 4, y, pageW - margin - 4, y)
  y += 8

  // ── Footer note ───────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(120, 140, 180)
  doc.text("Assessment completed at Tetrahedron Manufacturing Services Pvt. Ltd.", pageW / 2, y, { align: "center" })
  y += 5
  doc.setFont("helvetica", "normal")
  doc.text(`Certificate ID: CMR-PLT-${new Date(employeeData.testDate).toISOString().split("T")[0]}-${employeeData.employeeCode}`, pageW / 2, y, { align: "center" })
  y += 12

  // ── Signature lines ───────────────────────────────────
  doc.setDrawColor(100, 116, 139)
  doc.setLineWidth(0.5)
  const sigLeft  = margin + 20
  const sigRight = pageW - margin - 70
  doc.line(sigLeft, y, sigLeft + 55, y)
  doc.line(sigRight, y, sigRight + 55, y)
  y += 4
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100)
  doc.text("Examiner Signature", sigLeft + 27, y, { align: "center" })
  doc.text("Training Director", sigRight + 27, y, { align: "center" })
  y += 10

  // ── Watermark ─────────────────────────────────────────
  doc.setFontSize(8)
  doc.setTextColor(200)
  doc.text("TETRAHEDRON", pageW / 2, y, { align: "center" })

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
