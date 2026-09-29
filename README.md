# react_dotnet_sso_authentication
React and .net core project which demonstrate Corporate Microsoft Entra ID &amp; Standalone Google OAuth Integration

# Architectural Specification: Multi-Provider SSO Identity Gateway
## Corporate Microsoft Entra ID & Standalone Google OAuth Integration

This document outlines the complete technical architecture, package distributions, configuration checklists, and implementation steps used to establish a dual-login security perimeter for the application. The system unifies session aggregation into a single application-centric layer, allowing transparent provider scalability while keeping data caching decoupled from user identities.

---

## 1. High-Level Architectural Flow

The application implements an **Agnostic Token Validation Architecture**. The React Single Page Application (SPA) client relies on native provider SDKs to execute direct authentication requests independently against Microsoft and Google cloud servers. 

Once a valid token string is acquired, it is packed inside a uniform session schema object and saved under a single, non-provider-specific global cache key (`current_session`) inside the browser's `localStorage`. The C# Web API backend registers two completely independent validation scheme middleware blocks side-by-side, verifying the incoming signatures interchangeably.

```text
       ┌───────────────────────────────┐
       │   React SPA Client Frontend   │
       │     (http://localhost:5173)   │
       └───────┬───────────────┬───────┘
               │               │
       Direct  │               │  Direct
      Redirect │               │  Overlay
               ▼               ▼
┌──────────────────────┐┌──────────────────────┐
│  Microsoft Entra ID  ││   Google OAuth 2.0   │
│   Identity Server    ││    Identity Server   │
└──────────────┬───────┘└───────┬──────────────┘
  Emits Microsoft               │ Emits Google
     Access Token               ▼ Identity JWT
               │         ┌──────────────────────┐
               └────────>│ Unified Session Cache│ (localStorage: "current_session")
                         └──────────┬───────────
                                    │
                       HTTP Request │ Authorization: Bearer <Token>
                                    ▼
       ┌────────────────────────────────────────┐
       │     ASP.NET Core Web API Backend       │
       │        (http://localhost:5000)         │
       │  ────────────────────────────────────  │
       │  Validate: [Scheme A: AzureAd]         │
       │            [Scheme B: GoogleAuth]     │
       └──────────────────────────────────────── Union Auth Policy
```

---

## 2. Package Dependency Index

To establish this architecture from scratch, a developer must install the following ecosystem packages in their respective directory environments:

### A. Frontend React Client (npm package installations)
Run these commands inside your `frontend-ui` project directory root:
```bash
# Core Microsoft Entra ID Authentication Framework Modules
npm install @azure/msal-browser @azure/msal-react

# Standalone Google OAuth Widget Library
npm install @react-oauth/google

# Client-Side JSON Web Token (JWT) Cryptographic Decoder
npm install jwt-decode

# Global State & Client Caching Engine
npm install @tanstack/react-query
```

### B. Backend ASP.NET Core API (dotnet package installations)
Run these commands inside your C# `backend-api` project workspace folder:
```bash
# Core Microsoft Identity Web Integration Suite
dotnet add package Microsoft.Identity.Web

# Native ASP.NET Core JWT Bearer Scheme Handler
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

---

## 3. External Infrastructure Configuration Requirements

Before running the application code, the active trust boundaries must be explicitly mapped inside the respective vendor cloud dashboards.

### 🔷 A. Microsoft Entra ID Portal Configurations
1. **Application Registration:** Log into the Azure Portal, open **Microsoft Entra ID**, and select **App Registrations** from the left-hand navigation panel. 
2. **Create Registrations:** Click **New Registration**. Create a registration named `financial-runway-ui` (for the React app) and a separate registration named `financial-runway-api` (for the C# API). Select *Accounts in this organizational directory only (Single tenant)*.
3. **Frontend Platform Setup:** Open the frontend (`financial-runway-ui`) registration menu. Select the **Authentication** blade, click **+ Add a platform**, and choose **Single-page application (SPA)**. Add `http://localhost:5173` as the Authorized Redirect URI. Ensure both checkboxes under the *Implicit grant and hybrid flows* section remain completely **unchecked**. Click **Configure**.
4. **Exposing the Custom API Scope:** Open the backend (`financial-runway-api`) registration menu, navigate to **Expose an API**. Click **Set** next to *Application ID URI* to define a URI matching the scheme: `api://<your-api-client-id>`. Click **+ Add a scope**, title it exactly `access_as_user`, fill out the display strings, and set it to authorized for both Admins and Users.
5. **Link Permissions:** Return to the frontend (`financial-runway-ui`) registration menu, click **API permissions** -> **+ Add a permission** -> **APIs my organization uses**. Paste your API's client GUID string into the search bar, select `access_as_user`, and click **Add permissions**.
6. **Grant Admin Consent:** Complete the step by clicking the **Grant admin consent for Default Directory** button next to the add button to turn the status warning triangles into green checkmarks.

### 🔴 B. Google Cloud Console Configurations
1. **Project Creation:** Open the Google Cloud Console, click the project dropdown menu in the top-left corner, and select **New Project**. Name it `FinancialRunwayApp` and click **Create**.
2. **OAuth Consent Screen Setup:** Navigate to **APIs & Services** -> **OAuth consent screen** on the left menu. Select the user type as **External** so any standard Gmail address can test the flow, and click **Create**. Input your app naming titles, support email addresses, and developer contact details. Click **Save and Continue** through the scopes screen.
3. **Credentials Matrix:** Go to the **Credentials** tab panel on the left sidebar, click **+ Create Credentials** at the top, and choose **OAuth client ID**. Set the application type parameter dropdown to **Web application**.
4. **Origins Whitelisting:** Scroll down to the **Authorized JavaScript Origins** panel, click **+ Add URI**, and enter precisely: `http://localhost:5173`. 
   * *CRITICAL NOTE: Do not append a trailing slash at the end of the URL (do not write `5173/`), or Google's token routing servers will reject the handshake request.* Click **Save**.
5. **Production Promotion:** Return to the *OAuth Consent Screen* dashboard panel. Under the *Publishing status* module block, click the **PUBLISH APP** action button to move it from "Testing" into **In Production**. Leaving the application in testing status causes Google to block external users with a generic `401 invalid_client` error code.

---

## 4. Component Implementation Roadmap

When onboarding a new engineer or standing up this dual-provider SSO identity network configuration completely from scratch, execute the following implementation roadmap sequentially:

### Phase I: Backend Security Perimeter Assembly
1. **Configuration Mapping:** The developer opens `appsettings.json` and inserts the specific Entra ID GUID tokens (`TenantId`, `ClientId`, `Instance`) into a standard `AzureAd` configuration section block.
2. **Multi-Scheme Registration:** Inside the configuration extensions files, the developer registers the base authentication service and mounts the Microsoft Identity web API parameters. Immediately below that, they attach a standard `AddJwtBearer` block named uniquely as `GoogleAuthScheme`, passing the Google Client ID string as the target audience and `https://google.com` as the authority.
3. **Authorization Union:** The developer overrides the global fallback authorization policy, requiring that an incoming request must successfully authenticate against **either** the default Microsoft scheme **or** the custom Google scheme before the API controllers can execute business logic.
4. **Middleware Pipeline Sequencing:** The developer organizes the server pipeline in `Program.cs` in a strict sequential order: CORS rules run first, followed by `UseAuthentication()`, followed by `UseAuthorization()`. This ensures that all requests are validated before hitting any database routing paths.

### Phase II: Frontend Environment Root Integration
1. **Parallel Provider Nesting:** Inside `main.tsx`, the developer wraps the application component tree inside both global provider context components back-to-back. The `GoogleOAuthProvider` and the `MsalProvider` are nested together at the very root wrapper level. Because they are separate memory layers, they run in parallel and share data downstream without causing type clashes or data leaks.
2. **Conditional Shell Gatekeeping:** Inside `App.tsx`, the developer removes all automatic template blocks and sets up a standard state variable that checks for the existence of the `"current_session"` storage item. If the storage key is missing, a custom landing view renders two independent login buttons side-by-side.

### Phase III: The Unified Caching Interceptor Flow
1. **Standardized Serialization:** 
   * When a user logs in via Microsoft, the MSAL callback triggers, fetches an access token silently, and saves the credentials into the `"current_session"` storage string.
   * When a user logs in via Google, the direct widget triggers, decodes the email parameters via `jwt-decode`, and writes the exact same object structure into the `"current_session"` storage string.
