# EduCore - AI Coding Agent Instructions

## Architecture Overview

EduCore is a full-stack Learning Management System (LMS) with clear separation between client and server:

- **Frontend**: Vite + React + Tailwind CSS with Radix UI components
- **Backend**: Node.js + Express + MongoDB with role-based access control
- **Roles**: `student`, `instructor`, `admin` with distinct dashboards and permissions

## Development Workflow

### Quick Start Commands
```bash
# Install all dependencies
npm run install-all

# Start both client and server in development mode
npm run dev

# Build for production
npm run build
```

The root `start-dev.js` concurrently runs:
- Client: `http://localhost:5173` (Vite dev server)
- Server: `http://localhost:5000` (Express API)

### Key Scripts
- `npm run dev` - Start both frontend and backend
- `npm run seed` - Populate database with sample data
- `npm run b:pt/mn/mj` - Bump version (patch/minor/major)

## Project Structure Patterns

### Authentication & Authorization
- **Context-based auth**: `client/src/context/auth-context/` manages global auth state
- **Route protection**: `RouteGuard` component redirects based on authentication + role
- **Token management**: JWT stored in localStorage, auto-attached via axios interceptor
- **Role redirects**: instructor→`/instructor`, student→`/home`, admin→`/admin/newsletters`

### API Architecture
- **Base URL**: Environment-aware (`localhost:5000/api/v1` in dev, `/api/v1` in prod)
- **Auth middleware**: `server/middleware/auth-middleware.js` validates JWT tokens
- **Route structure**: `/api/v1/{auth|instructor|student|admin}/{resource}`

### Component Organization
- **UI components**: Radix UI primitives in `client/src/components/ui/`
- **Feature components**: Organized by domain (`auth/`, `instructor-view/`, `student-view/`)
- **Context providers**: Separate contexts for auth, chat, instructor, student
- **Pages**: Route-mapped pages in `client/src/pages/` with role-based folders

### Database Models
All Mongoose models follow simple schemas:
- `User`: userName, userEmail, password, role, resetToken fields
- `Course`: Standard course fields with instructor references
- Models use ES6 imports: `export default model("ModelName", schema)`

## Development Patterns

### Environment Variables
- **Server**: Uses `process.env` for MongoDB, JWT secrets, email, payment configs
- **Client**: Uses `import.meta.env` for Vite environment variables
- **Development**: Client proxies API calls to `localhost:5000`

### Error Handling
- Controllers return standardized `{success: boolean, message: string}` responses
- Client-side toast notifications via `@/components/ui/toaster`
- Authentication errors trigger automatic redirects via RouteGuard

### Form Management
- Form configurations defined in `client/src/config/index.js`
- Consistent form control objects with `name`, `label`, `placeholder`, `type`
- Initial form data constants exported from config

### File Upload & Media
- Cloudinary integration for course media
- Multer middleware for file handling
- Video download service for student access

## Key Integrations

- **Payment**: PayPal integration in `server/helpers/paypal.js`
- **Email**: Nodemailer for OTP verification and password resets
- **Chat**: Real-time messaging system with dedicated context and routes
- **Newsletter**: Automated scheduler with subscription management
- **OAuth**: Google authentication support

## Common Tasks

### Adding New Routes
1. Create controller in `server/controllers/{role}-controller/`
2. Add route in `server/routes/{role}-routes/`
3. Register route in `server/server.js`
4. Create service function in `client/src/services/`
5. Add frontend components/pages as needed

### Adding New UI Components
- Use existing Radix UI patterns from `client/src/components/ui/`
- Follow shadcn/ui conventions for component structure
- Import via `@/` alias (configured in Vite)

### Database Operations
- Use ES6 import syntax: `import ModelName from "../models/ModelName.js"`
- Follow existing async/await error handling patterns
- Seed data available via `npm run seed`

## Debugging
- Server logs MongoDB connection status on startup
- Client uses axios interceptors for request/response logging
- Development mode includes detailed error messages and stack traces