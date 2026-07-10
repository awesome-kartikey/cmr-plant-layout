import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { TestProvider } from "./contexts/TestContext"
import { Toaster } from "./components/ui/sonner"
import SplashScreen from "./screens/SplashScreen"
import LanguageScreen from "./screens/LanguageScreen"
import LoginScreen from "./screens/LoginScreen"
import SignupScreen from "./screens/SignupScreen"
import HomeScreen from "./screens/HomeScreen"
import InstructionsScreen from "./screens/InstructionsScreen"
import EmployeeDetailsScreen from "./screens/EmployeeDetailsScreen"
import TrainingScreen from "./screens/TrainingScreen"
import TrainingScreenKonva from "./screens/TrainingScreenKonva"
import ResultScreen from "./screens/ResultScreen"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TestProvider>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/language" element={<LanguageScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/instructions" element={<InstructionsScreen />} />
            <Route path="/form" element={<EmployeeDetailsScreen />} />
            <Route path="/training" element={<TrainingScreen />} />
            <Route path="/training-exp" element={<TrainingScreenKonva />} />
            <Route path="/result" element={<ResultScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </TestProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
