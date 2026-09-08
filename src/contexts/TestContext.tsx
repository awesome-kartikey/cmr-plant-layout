import { createContext, useContext, useState, type ReactNode } from "react"
import type { EmployeeData, TestData, Attempt } from "../types"

interface TestContextType {
  employeeData: EmployeeData
  updateEmployeeData: (data: Partial<EmployeeData>) => void
  testData: TestData
  addAttempt: (attempt: Attempt) => void
  resetTest: () => void
  resetEmployeeData: () => void
  resetAll: () => void
}

const TestContext = createContext<TestContextType | null>(null)

const initialEmployeeData: EmployeeData = {
  name: "",
  employeeCode: "",
  testDate: new Date(),
  photo: null,
  photoUrl: null,
}

const initialTestData: TestData = {
  score: 0,
  totalAttempts: 10,
  attempts: [],
}

export function TestProvider({ children }: { children: ReactNode }) {
  const [employeeData, setEmployeeData] = useState<EmployeeData>(initialEmployeeData)
  const [testData, setTestData] = useState<TestData>(initialTestData)

  const updateEmployeeData = (data: Partial<EmployeeData>) => {
    setEmployeeData((prev) => ({ ...prev, ...data }))
  }

  const addAttempt = (attempt: Attempt) => {
    setTestData((prev) => {
      const updatedAttempts = [...prev.attempts, attempt]
      const updatedScore = prev.score + attempt.points
      return { ...prev, attempts: updatedAttempts, score: updatedScore }
    })
  }

  const resetTest = () => {
    setTestData(initialTestData)
  }

  const resetEmployeeData = () => {
    setEmployeeData({
      ...initialEmployeeData,
      testDate: new Date(),
    })
  }

  const resetAll = () => {
    setEmployeeData({
      ...initialEmployeeData,
      testDate: new Date(),
    })
    setTestData(initialTestData)
  }

  return (
    <TestContext.Provider
      value={{
        employeeData,
        updateEmployeeData,
        testData,
        addAttempt,
        resetTest,
        resetEmployeeData,
        resetAll,
      }}
    >
      {children}
    </TestContext.Provider>
  )
}

export function useTest() {
  const ctx = useContext(TestContext)
  if (!ctx) throw new Error("useTest must be used within TestProvider")
  return ctx
}
