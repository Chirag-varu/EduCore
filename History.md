# HISTORY.md

# 1.15.6 / 2025-11-04
- Added: Logout confirmation dialog using Radix AlertDialog; unified client-side logout via AuthContext and consistent redirect to `/auth`
- Changed: Auth login flow on `client/src/pages/auth/index.jsx` now uses AuthContext for state + role-based redirects (student → `/home`, instructor → `/instructor`, admin → `/admin/newsletters`)
- Added: Google OAuth success now redirects by role
- Added: Seeder now creates demo accounts (student/instructor/admin) with secure hashed passwords
- Docs: README updated with Demo Accounts & Auth Flow section (credentials, redirects, token behavior)
- QA: Server test suites passing (31/31)

Recent commits snapshot:
- dc3c75f (2025-11-03) feat(header): add hoverable user avatar dropdown with role-based links (My Learning, Cart, Dashboards, Logout)
- c8813ea (2025-11-03) fix(cart): normalize courseId for remove action and validate ObjectId on server
- aa5a52f (2025-11-01) cart: use real course price, prevent duplicates, auto-clean dupes on fetch
- 3799230 (2025-11-01) auth: middleware supports both token formats (_id or userId) for compatibility
- 9969288 (2025-10-31) dev: allow 5174 port for Vite proxy alignment to prevent blocked requests
- 4e907a3 (2025-10-31) patch update
- 46207f8 (2025-10-31) file adjusted
- 3b3c5bc (2025-10-31) made it dynamic
- 47dfd1e (2025-10-31) feature: add to cart
- ac8a8bb (2025-10-31) UX: dashboard polish with loading, errors, skeletons
- 6d108a9 (2025-10-30) loading updated at frontend
- 3b4f990 (2025-10-30) final fix for frontend and packages

# 1.15.5 / 2025-10-28
- Security: JWT security hardening (no fallback secrets; stricter config)
- Security: Password complexity enforcement with real-time strength indicator
- Security: Brute-force protection with advanced rate limiting on auth endpoints
- Security: Comprehensive env var validation on server startup
- UX: Client-side password feedback (requirements + strength bar)
- Docs/Testing: Updated README; expanded testing guidance and security notes

# 1.15.4 / 2025-10-25
- Security: **CRITICAL FIX** - Removed hardcoded JWT secret fallback in authentication middleware
- Security: Added comprehensive environment variable validation on server startup
- Security: Implemented rate limiting for authentication, API, and upload endpoints
- Security: Added Helmet.js for security headers (CSP, HSTS, XSS protection)
- Database: Enhanced User model with proper validation, indexing, and data integrity
- Validation: Created comprehensive input validation utilities for secure data handling
- Code Quality: Fixed React PropTypes validation issues in auth context
- Code Quality: Restored StrictMode in React application for better development experience
- Dependencies: Added security packages (express-rate-limit, helmet, prop-types)
- Documentation: Created comprehensive security audit report and testing plan

# 1.15.3 / 2025-10-25
- Documentation: Comprehensive project status report and todo list created
- Documentation: Updated README files for improved accuracy and completeness  
- Maintenance: Project health assessment completed - clean working tree confirmed
- Architecture: Documented role-based access control and API structure
- Development: Environment configuration verified and development workflow optimized

# 1.15.2 / 2025-08-17
- Change: instructor page improved 
- Added hamburger and logout dialog box
- Change: Home page UI Improved
- Add: Footer added

# 1.5.1 / 2025-08-16
- Fix: raute handling fixed

# 1.5.0 / 2025-08-15
- Auth: Improved authentication, instructor can now view the other courses
- Fix: Typos corrected
- Feature: Google OAuth made working

# 1.4.3 / 2025-08-14
- UI/UX: User name added in header for better user experience

# 1.4.2 / 2025-08-13
- Security: Safety and security improvements added and proper README file added in client folder

# 1.4.1 / 2025-08-12
- Deployment: Deployment changes made

# 1.4.0 / 2025-08-11
- Feature: Shadcn auth implemented

# 1.3.4 / 2025-08-10
- Feature: Google AuthO-2 added, shadcn auth page added, minor UI changes and bug fixes

# 1.3.3 / 2025-08-09
- Feature: Terms and conditions added

# 1.3.2 / 2025-08-08
- Fix: Admin route fixed at '/'

# 1.3.2 / 2025-08-07
- Server: Implemented DB connection pooling to decrease latency, handle multiple users simultaneously

# 1.3.1 / 2025-08-06
- Added Compression 
- added Rate Limiting to backend API
- Bug Fix: Deployment bug fix jet token and csrf Protection
- Bug Fix: Logout Bug Fix
- Merge: Integrated branch changes into `master`

# 1.3.1 / 2025-08-05
- Bug Fix: Fixed user authentication issue  
- Merge: Pulled latest changes from `master` branch  

# 1.3.0 / 2025-08-04
- Merge: Integrated branch changes into `master`  
- Feature: Added essential npm packages for new features  
- Feature: Implemented Auth and Login modules  
- Improvement: Prevented automatic re-login on session expiration  
- Feature: Started implementation of Access Token logic  

# 1.2.2 / 2025-08-03
- Bug Fix: Token validation fix  
- Dependency: Added `node-cron` to dependencies  

# 1.2.1 / 2025-08-02
- Bug Fix: Small UI and logic issues resolved  

# 1.2.0 / 2025-08-01
- Bug Fix: Logout functionality issue resolved  
- Version: Updated package version  
- Data: Updated seed data for database initialization  

# 1.1.1 / 2025-07-31
- Bug Fix: Fixed login page UI issue  
- Maintenance: Removed `combined.log` and `error.log` from repo  

# 1.1.0 / 2025-07-30
- Merge: Pulled changes from `master` branch  
- Config: Updated `.gitignore` for better file exclusions  

# 1.0.0 / 2025-07-29
- Release: First major stable release of EduCore  
>>>>>>> f62a6a276ddd269684be87c8979d69c4a24bff03

# 0.1.0 / 2025-07-28
- Server: `start` logic added in server  
- Client: `build` and `dist` folders added  
- Deployment: Project deployed on Render  

# 0.0.6 / 2025-07-27
- Bug Fix: Fixed small UI bug  
- Branding: Added new EduCore logo  
- Config: Added `.env.example` for environment variable reference  
- Code Cleanup: General bug cleanup (`Bug;'s Removed`)  

# 0.0.5 / 2025-07-26
- Integration: Connected frontend and backend (Demo version)  
- Bug Fixes: Quick fix and major bug fix - 1  
- Release: Pushed a new patch release  

# 0.0.4 / 2025-07-25
- Scripts: Added `run.sh` and `setup.sh` for environment setup and .env files

# 0.0.3 / 2025-07-24
- Added EduCore logo in different compatibility
- Frontend Fix: Login Page Error Fix

# 0.0.2 / 2025-07-23
- Added Login page  
- ShadCN components added (Button, Card, input, label, tabs)
- Added DarkMode to App
- Added CSS template in index.css 
- set up Start-dev.js and install-dev.js for windows to install and run faster
- updated README (Improved Setup Instructions Documentation)

# 0.0.1 / 2025-07-21
- Initial release - (beta)