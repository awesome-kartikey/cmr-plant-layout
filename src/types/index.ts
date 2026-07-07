export interface EmployeeData {
  name: string
  employeeCode: string
  testDate: Date
  photo: string | null
  photoUrl: string | null
}

export interface Attempt {
  hazard: string
  nearestExit: string
  selectedExit: string
  points: number
  pathDrawn?: Point[]
  pathScore?: PathScoringResult
}

export interface TestData {
  score: number
  totalAttempts: number
  attempts: Attempt[]
}

export interface Point {
  x: number
  y: number
}

export interface PathScoringResult {
  score: number
  deviation: number
  time: number
  accuracy: "excellent" | "good" | "average" | "poor"
}

export interface Department {
  id: string
  label: string
  x: number
  y: number
  w: number
  h: number
  fill: string
  stroke: string
}

export interface ExitPoint {
  id: string
  label: string
  x: number
  y: number
}

export interface QuestionItem {
  id: string
  image: string
  label: string
}

export interface DragDropQuestion {
  id: string
  dropBox: { id: string; label: string }
  correctItem: QuestionItem
  incorrectItems: QuestionItem[]
}

export interface DefectData {
  testType: string
  questions: DragDropQuestion[]
}

export interface QuizResult {
  employeeData: EmployeeData
  testData: TestData
  id?: string
  createdAt?: Date
}
