/// <reference types="vite-plugin-pwa/client" />
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "./lib/i18n"
import App from "./App"
import { registerSW } from "virtual:pwa-register"

registerSW({ immediate: true })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
