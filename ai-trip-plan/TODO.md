# TODO - Global Error Handling System

## Step 1 (Backend): Add custom error handlers
- Create `backend/trip_backend/error_handlers.py` with DRF exception handler + Django 404/500 handlers.
- Ensure user-facing responses contain only short, friendly `detail` messages.
- Ensure detailed errors are logged server-side only.

## Step 2 (Backend): Wire handlers
- Update `backend/trip_backend/settings.py` to set `REST_FRAMEWORK['EXCEPTION_HANDLER']`.
- Update `backend/trip_backend/urls.py` to set `handler404` and `handler500`.

## Step 3 (Backend): Add error templates
- Create templates:
  - `backend/templates/errors/400.html`
  - `backend/templates/errors/401.html`
  - `backend/templates/errors/403.html`
  - `backend/templates/errors/404.html`
  - `backend/templates/errors/429.html`
  - `backend/templates/errors/500.html`
- Each should include Home + Retry buttons.

## Step 4 (Frontend): Map API errors to user-friendly messages
- Update `frontend/src/lib/apiClient.ts` to map status codes to the required short messages.
- Ensure thrown errors never expose raw HTTP status codes as user messages.

## Step 5 (Frontend): Create global error UI
- Add `frontend/src/components/ErrorState.tsx` (message + Home + Retry).
- Add `frontend/src/components/AppErrorBoundary.tsx` to catch render errors and show 500 UI.

## Step 6 (Frontend): Route fallback for 404 + error page
- Update `frontend/src/App.tsx` (or router) to show a clean 404 screen for unknown routes.
- Add an error page route used when API failures occur.

## Step 7: Testing
- Backend: verify 404/500 return friendly pages and API JSON has friendly `detail`.
- Frontend: verify UI shows friendly messages for 400/401/403/404/429/500 and Retry works.

