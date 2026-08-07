import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

// Automatically handle Vite dynamic chunk load errors on new Vercel deployments
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
