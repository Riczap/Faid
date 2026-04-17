import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./template/components/common/PageMeta.tsx";
import { ThemeProvider } from "./template/context/ThemeContext.tsx";
import { BRAND } from "./config/branding.ts";

// Apply branding from config
document.title = BRAND.pageTitle;
const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
if (favicon) {
  favicon.href = BRAND.favicon;
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AppWrapper>
      <App />
    </AppWrapper>
  </ThemeProvider>
);
