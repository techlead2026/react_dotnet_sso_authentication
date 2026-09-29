// src/App.tsx
import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { GoogleLogin } from "@react-oauth/google";
import { loginRequest } from "./components/authConfig";
import ReactQueryDashboard from "./components/ReactQueryDashboard";
import { jwtDecode } from "jwt-decode"; // Run: npm install jwt-decode

export default function App() {
  const { instance, accounts } = useMsal();

  // Track our unified session state object
  const [session, setSession] = useState<any>(() => {
    const cached = localStorage.getItem("current_session");
    return cached ? JSON.parse(cached) : null;
  });

  // Handle Microsoft Login Callback dynamically
  useEffect(() => {
    if (accounts.length > 0 && !session) {
      // Fetch the active account details from MSAL context
      const activeAccount = instance.getActiveAccount() || accounts[0];

      // Get the token silently
      instance
        .acquireTokenSilent({
          ...loginRequest,
          account: activeAccount,
        })
        .then((tokenResult) => {
          const microsoftSession = {
            authType: "Microsoft",
            token: tokenResult.accessToken,
            email: activeAccount.username,
            name: activeAccount.name || "Corporate User",
          };

          localStorage.setItem(
            "current_session",
            JSON.stringify(microsoftSession),
          );
          setSession(microsoftSession);
        })
        .catch((err) => console.error("MSAL token resolution failed", err));
    }
  }, [accounts, instance, session]);

  // Determine if the user has passed either gate successfully
  const isAuthenticated = session !== null;

  // AUTOMATED URL SANITIZER INTERCEPTOR LOOP
  // --- FIXED: CLEANS THE URL ONLY AFTER SUCCESSFUL AUTHENTICATION ---
  useEffect(() => {
    // Wait until the user is fully authenticated and session is locked in
    if (isAuthenticated && (window.location.search || window.location.hash)) {
      // Safely clear out the trailing auth state strings from the address bar
      const cleanHomeUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanHomeUrl);
    }
  }, [isAuthenticated]);

  const handleMicrosoftLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div
      style={{
        maxWidth: "850px",
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "sans-serif",
      }}
    >
      <header
        style={{
          marginBottom: "20px",
          borderBottom: "2px solid #eaeaea",
          paddingBottom: "10px",
        }}
      >
        <h1>Financial Runway Management Dashboard</h1>
        <small style={{ color: "#718096", fontWeight: "bold" }}>
          🔒 Multi-Provider Gateway Framework Active
        </small>
      </header>

      {isAuthenticated ? (
        // RENDER LIVE DASHBOARD
        <ReactQueryDashboard />
      ) : (
        // SIGN-IN SELECTION CANVAS VIEW
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            backgroundColor: "#f8fafc",
          }}
        >
          <h2 style={{ marginBottom: "24px", color: "#1e293b" }}>
            Welcome. Select Your Identity Provider
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              alignItems: "center",
            }}
          >
            {/* OPTION A: MICROSOFT CORPORATE ROUTE */}
            <button
              onClick={handleMicrosoftLogin}
              style={{
                backgroundColor: "#0078d4",
                color: "#ffffff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Sign In with Microsoft Account
            </button>

            {/* OPTION B: DIRECT INDEPENDENT GOOGLE AUTHENTICATION ROUTE */}
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  // Decode the Google JWT to extract user profile details safely
                  const decoded: any = jwtDecode(credentialResponse.credential);

                  const googleSession = {
                    authType: "Google",
                    token: credentialResponse.credential,
                    email: decoded.email,
                    name: decoded.name || "Google User",
                  };

                  // Cache the entire object profile under our unified app key
                  localStorage.setItem(
                    "current_session",
                    JSON.stringify(googleSession),
                  );
                  setSession(googleSession);
                  console.log("Google session payload saved successfully.");
                }
              }}
              onError={() => {
                console.error("Independent Google login dropped.");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
