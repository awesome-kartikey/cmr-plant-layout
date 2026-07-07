import type { EmployeeData, TestData } from "../types"

const STORAGE_KEY = "plantlayout_results"

interface StoredResult {
  employeeData: EmployeeData
  testData: TestData
  timestamp: number
}

export function saveTestResult(employeeData: EmployeeData, testData: TestData) {
  const existing = retrieveTestResults()
  const newResult: StoredResult = {
    employeeData,
    testData,
    timestamp: Date.now(),
  }
  existing.push(newResult)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

export function retrieveTestResults(): StoredResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}
