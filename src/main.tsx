import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AppRouter from "./components/AppRouter";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter>
      <App />
    </AppRouter>
  </StrictMode>,
);
