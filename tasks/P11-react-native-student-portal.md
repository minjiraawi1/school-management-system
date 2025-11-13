Title: Mobile — React Native (Expo) Student Portal

**Status: COMPLETED** ✓ (with bug fix)

Objective
- Build mobile login and results views consuming secured backend APIs.

Prerequisites
- Expo project (`my-expo-app`) initialized.
- Backend auth and student results endpoints available.

Completed Implementations

**LoginScreen** (`my-expo-app/screens/LoginScreen.tsx`)
- Form with username and password inputs
- Calls `POST /api/auth/login` with credentials
- Stores JWT token in expo-secure-store for persistence
- Navigates to ResultsScreen on successful login
- Error messaging and loading states

**ResultsScreen** (`my-expo-app/screens/ResultsScreen.tsx`)
- Protected screen requiring authentication
- Calls `GET /api/results/student/me/:academicYear` endpoint
- Displays grand totals (term_1, term_2, annual_grand_total, annual_average)
- Per-subject breakdown with individual scores and term totals
- Loading and error state handling
- Token-based authorization via axios interceptor

**AuthContext** (`my-expo-app/context/AuthContext.tsx`)
- Token management using expo-secure-store
- Login/logout methods
- Protected navigation state

**API Integration** (`my-expo-app/lib/api.ts`)
- Axios instance with token interceptor
- Auth and Results API methods

**Bug Fix Applied**
- **Issue**: ResultsScreen API call used query parameter for academicYear
- **Backend Route**: `/api/results/student/me/:academicYear` expects path parameter
- **Fix**: Changed `api.get('/results/student/me', { params: { academicYear } })` to `api.get('/results/student/me/${academicYear}')`
- **File Modified**: `my-expo-app/lib/api.ts` in `getMyResults()` method

Acceptance Criteria Met
- ✓ Login persists token in secure storage and routes correctly
- ✓ Results screen renders per plan on mobile
- ✓ API calls now match backend route definitions
- ✓ Token expiration handled (401 clears token)
