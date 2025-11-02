# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PETEL is an Angular 20+ pet hotel booking platform with three user roles: customers (users), merchants (sellers), and administrators. The frontend communicates with a Java Spring Boot backend at `http://localhost:8080`.

## Development Commands

### Essential Commands
- **Start dev server**: `npm start` or `ng serve` → http://localhost:4200
- **Build**: `npm run build` or `ng build`
- **Run tests**: `npm test` or `ng test` (Karma + Jasmine)
- **Watch mode**: `npm run watch` or `ng build --watch --configuration development`

### Angular CLI Scaffolding
- **Generate component**: `ng generate component component-name`
- **See all schematics**: `ng generate --help`

## Architecture

### Core Structure

```
src/app/
├── core/                      # Core application logic
│   ├── guards/               # Route guards (e.g., adminAuthGuard)
│   ├── interceptors/         # HTTP interceptors (auth.interceptor)
│   ├── interfaces/           # TypeScript interfaces for API contracts
│   └── services/             # Injectable services
├── pages/                     # Page components (routable)
├── shared/                    # Shared components, pipes
│   ├── sharedComponents/     # Reusable UI components
│   └── pipes/                # Custom pipes (e.g., price-pipe)
└── app.routes.ts             # Application routing configuration
```

### API Communication Pattern

All backend APIs follow a standardized request/response wrapper format:

**Request Format**:
```typescript
{
  "MWHEADER": { "MSGID": "API-CODE" },
  "TRANRQ": { /* actual request data */ }
}
```

**Response Format**:
```typescript
{
  "MWHEADER": {
    "RETURNCODE": "0000",  // "0000" = success
    "RETURNDESC": "成功"
  },
  "TRANRS": { /* actual response data */ }
}
```

Interfaces are named with the pattern `{API_CODE}{Req|Res}.interface.ts` (e.g., `AUTH001Req`, `AUTH001Res`).

### Service Layer

**Key Services**:

- **`auth.service.ts`**: Authentication with JWT access tokens + HTTP-only refresh tokens
  - Bootstrap function runs on app initialization to refresh token if available
  - Provides `isLoggedIn$` and `role$` observables for auth state
  - Token auto-refresh via `auth.interceptor.ts` on 401 responses

- **`notification.service.ts`**: Real-time notifications via Server-Sent Events (SSE)
  - Auto-reconnect logic with exponential backoff
  - Manages unread count via `unreadCount$` observable
  - See `NOTIFICATION_API_DOCS.md` for detailed API specs

- **`ws.service.ts`**: WebSocket chat using STOMP over SockJS
  - Real-time messaging with auto-reconnect
  - Uses access token in STOMP headers
  - Provides `messages$` and `threadUpdates$` observables

- **`hotel-service.ts`**: Hotel/property search and details
- **`book-service.ts`**: Booking operations
- **`merch-service.ts`**: Merchant/seller operations
- **`admin.service.ts`**: Admin panel operations
- **`user.service.ts`**: User profile management
- **`media.service.ts`**: Image upload/management
- **`property-state.service.ts`**: Property state management for merchant flows

### Authentication Flow

1. **Login**: POST to `/auth/login` → receives `accessToken` in response body + `refreshToken` in HTTP-only cookie
2. **Auto-refresh**: `auth.interceptor.ts` catches 401 errors → calls `/auth/refresh` → retries original request with new token
3. **Bootstrap**: On app startup, tries to refresh token silently to restore logged-in state
4. **Logout**: POST to `/auth/logout` → clears tokens and auth state

### Routing Structure

Three main user journeys:

1. **Customer Routes** (`/`):
   - Home → Hotel List → Hotel Details → Booking → Payment → Order History

2. **Merchant Routes** (`/merchants/`):
   - Login/Register → Property Management → Room Management → Order Management → Reviews

3. **Admin Routes** (`/admin/`):
   - Protected by `adminAuthGuard`
   - User/Seller/Hotel/Order tables

### UI Framework

- **PrimeNG** (v20+): Primary UI component library
- **Bootstrap** (v5.3+): Layout and utilities
- **Custom Theme**: `petel-theme.ts` for PrimeNG theming
- **Services**: Uses PrimeNG's `MessageService` for toasts and `ConfirmationService` for dialogs

### Real-Time Features

1. **Notifications** (SSE):
   - Connect via `NotificationService.connectSSE()`
   - Types: SYSTEM, ORDER, PAYMENT
   - Auto-reconnect with missed event resend

2. **Chat** (WebSocket):
   - Connect via `WsService.connect()`
   - STOMP protocol over `/ws-native` endpoint
   - Subscribes to `/user/queue/chat` and `/user/queue/thread-updates`

### State Management

- **RxJS BehaviorSubjects**: Used for reactive state (auth, notifications, etc.)
- **Service-based state**: No external state management library
- **Property State**: `property-state.service.ts` manages merchant property context

## Important Implementation Notes

### API Error Handling

Always check `MWHEADER.RETURNCODE`:
- `"0000"` indicates success
- `"USER_NOT_LOGIN"` requires re-authentication
- `"9999"` indicates system error

### Image Uploads

Use `media.service.ts` for uploading images. The upload components include:
- `upload-img` (shared component)
- `upload-property-image` (property-specific uploader)

### Notification System Integration

Refer to `NOTIFICATION_API_DOCS.md` for complete notification API specifications including:
- SSE connection setup with auto-reconnect
- Marking notifications as read
- Handling unread counts
- Resending missed events after reconnection

### WebSocket Chat Pattern

```typescript
// Initialize in component
await this.wsService.connect();

// Subscribe to messages
this.wsService.messages$.subscribe(msg => {
  // handle incoming message
});

// Send message
this.wsService.sendMessage(threadId, content);

// Cleanup
ngOnDestroy() {
  this.wsService.disconnect();
}
```

### Guards and Protection

- Use `adminAuthGuard` for admin-only routes
- Check `Auth.isLoggedIn$` observable for logged-in state
- Check `Auth.role$` for role-based UI rendering

## Code Style

- **Prettier configured** in `package.json`:
  - `printWidth: 100`
  - `singleQuote: true`
  - Angular parser for HTML files

## Environment Configuration

- Development base URL: `http://localhost:8080` (defined in `src/environment.ts`)
- All API services use `environment.BASE_URL` for endpoints
- Backend must support CORS for `http://localhost:4200`

## Testing

- **Framework**: Karma + Jasmine
- **Run tests**: `ng test`
- Test files follow pattern: `*.spec.ts`
