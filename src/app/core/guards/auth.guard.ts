import { CanActivateFn } from '@angular/router';

/**
 * Authentication guard skeleton for Azure AD integration.
 *
 * TODO: Implement MSAL (Microsoft Authentication Library) integration:
 * 1. Install @azure/msal-angular and @azure/msal-browser
 * 2. Configure MsalGuard with BD's Azure AD tenant
 * 3. Check for valid access token and required roles
 * 4. Redirect to Azure AD login page if not authenticated
 *
 * BD will provide the Azure AD connection details and role(s) to check.
 */
export const authGuard: CanActivateFn = () => {
  // Placeholder: always allow access during development.
  // In production, this will verify Azure AD authentication.
  return true;
};
