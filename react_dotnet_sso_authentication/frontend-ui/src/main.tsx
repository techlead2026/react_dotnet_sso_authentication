// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { msalConfig } from "./components/authConfig.ts";
import App from "./App.tsx";
import "./index.css";

const msalInstance = new PublicClientApplication(msalConfig);
const queryClient = new QueryClient();
const googleClientId =
  "323947381327-npc0ego1rktlsni9ikpc1e6pg0bqte3e.apps.googleusercontent.com";
msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as any;
    msalInstance.setActiveAccount(payload.account);
  }
});

msalInstance.initialize().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      {/* 1. Add your Google Client ID string right here */}

      <GoogleOAuthProvider clientId={googleClientId}>
        <MsalProvider instance={msalInstance}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </MsalProvider>
      </GoogleOAuthProvider>
    </StrictMode>,
  );
});
