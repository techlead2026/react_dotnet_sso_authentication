// src/components/AuthPage.tsx
import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

export default function AuthPage() {
  const { instance, inProgress } = useMsal();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setAuthError(null);
      // Attempt to authenticate using standard clean popup mechanisms
      await instance.loginPopup(loginRequest);
    } catch (err: any) {
      console.warn("Auth Handshake Diagnostic Capture:", err);

      // If a nested popup or interaction error is actively flagged, bypass popups entirely
      // and redirect the host window directly to the Microsoft login endpoint.
      if (
        err.errorMessage?.includes("block_nested_popups") ||
        err.errorMessage?.includes("interaction_in_progress")
      ) {
        setAuthError(
          "Popup blocked or active. Redirecting securely to corporate login page...",
        );

        // Timeout allows the state text to mount before navigating away
        setTimeout(() => {
          instance.loginRedirect(loginRequest).catch((redirectErr) => {
            setAuthError(
              redirectErr.message ||
                "Failed to initiate authentication redirect.",
            );
          });
        }, 1200);
      } else {
        setAuthError(
          err.message || "Failed to complete corporate single sign-on.",
        );
      }
    }
  };

  // If MSAL is currently fetching tokens or parsing redirect frames, show the loading state
  if (inProgress !== "none") {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f7fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "24px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          <div
            className="spinner"
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #0078d4",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px auto",
            }}
          ></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <strong>Verifying Microsoft Security Assertions...</strong>
          <p style={{ color: "#718096", fontSize: "0.85em", marginTop: "8px" }}>
            Synchronizing token state arrays securely.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f4f8",
        fontFamily: "sans-serif",
        margin: 0,
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          padding: "40px",
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "#0078d4",
            width: "60px",
            height: "60px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px auto",
            color: "#fff",
            fontSize: "1.8em",
            fontWeight: "bold",
          }}
        >
          F
        </div>

        <h2
          style={{ margin: "0 0 8px 0", color: "#1a202c", fontSize: "1.6em" }}
        >
          Financial Runway Gateway
        </h2>
        <p
          style={{
            margin: "0 0 32px 0",
            color: "#4a5568",
            fontSize: "0.95em",
            lineHeight: "1.5",
          }}
        >
          Provide valid corporate identity tokens via Microsoft Entra ID to open
          protected cloud metrics ledger access pipelines.
        </p>

        {authError && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              background: "#fff5f5",
              border: "1px solid #fed7d7",
              borderRadius: "6px",
              color: "#c53030",
              fontSize: "0.85em",
              textAlign: "left",
            }}
          >
            <strong>Security Notice:</strong> {authError}
          </div>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "14px",
            background: "#0078d4",
            color: "#ffffff",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1em",
            transition: "background 0.2s",
            boxShadow: "0 4px 12px rgba(0,120,212,0.2)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#005a9e")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#0078d4")}
        >
          Sign In With Microsoft SSO
        </button>

        <div
          style={{
            marginTop: "32px",
            borderTop: "1px solid #e2e8f0",
            paddingTop: "16px",
          }}
        >
          <small style={{ color: "#a0aec0" }}>
            Protected Infrastructure Portfolio Layer • Phase 4
          </small>
        </div>
      </div>
    </div>
  );
}
