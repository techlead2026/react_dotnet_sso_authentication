// src/components/authConfig.ts
import type { Configuration, RedirectRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "1d2a34a2-2a44-4d3f-9eac-a8ff3d0f64c2", // Use the ID from the UI app registration
    authority:
      "https://login.microsoftonline.com/4e9ae7df-86a4-4cbc-a80d-47eadf75612a", // Your Tenant ID
    redirectUri: "http://localhost:5173", // Must match your app registration redirect URI exactly
  },
  cache: {
    cacheLocation: "sessionStorage", // Safe in-memory browser session cache window target storage
  },
};

// Coordinate Scope Target requested across port network queries
export const loginRequest: RedirectRequest = {
  scopes: ["api://9a73f770-56c3-497f-916d-eaf0c73c8d70/access_as_user"], // Your API scope URI string definition
};
