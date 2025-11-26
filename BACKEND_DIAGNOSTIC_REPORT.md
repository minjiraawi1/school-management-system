# Mobile App Backend Issues - Diagnostic Report

## Issues Identified

### 1. SafeAreaView Deprecation ✅ ALREADY FIXED
The app is already using `react-native-safe-area-context` from context7 MCP documentation.
- Using: `SafeAreaProvider` wrapper at app root
- Using: `SafeAreaView` component with proper edge configuration
- Status: Modern implementation, no warnings expected

### 2. "No Subject Data Available" - Root Causes

#### A. Student Profile Missing
**Problem**: If no student record exists in the `students` table for the logged-in user, results won't fetch.

**Evidence from code**:
```javascript
// In resultsController.js getMyResultsNormalized()
const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId]);

if (studentResult.rows.length === 0) {
  // Returns empty results if student profile doesn't exist
  return res.json({
    subjects: [],
  });
}
```

**Why it matters**: 
- User exists in `users` table ✅
- But NO record in `students` table ❌
- Results query needs `student_id` from `students` table
- Without it, returns empty subjects array

#### B. Results Table May Be Empty
**Problem**: Even if student profile exists, no results records for that academic year exist.

**Current academic year logic**:
```javascript
// In ResultsScreen.tsx
const year = new Date().getFullYear().toString() // Returns "2024"
```

**Database expects**: Exact match in `academic_year` column (e.g., "2024-2025")

#### C. Database Schema Mismatch
**Problem**: `academic_year` in database might be in different format.

**Seed data creates**: "2024-2025" (year range)
**Mobile app queries**: "2024" (current year only)

These won't match!

---

## Solution

### Step 1: Verify Student Profile Exists

Check if student profiles are created for all test users:

```bash
# Connect to PostgreSQL
psql -h localhost -p 5432 -U postgres -d school_db

# Run query:
SELECT 
  u.id, u.username, u.role,
  s.id as student_id, s.student_id as student_code
FROM users u
LEFT JOIN students s ON u.id = s.user_id
WHERE u.role = 'student'
ORDER BY u.username;
```

**Expected output** - all students should have student_id values:
```
 id | username | role    | student_id | student_code
----+----------+---------+------------+--------------
  4 | student1 | student |          1 | STU001
  5 | student2 | student |          2 | STU002
  6 | student3 | student |          3 | STU003
```

### Step 2: Verify Results Records Exist

```bash
SELECT 
  r.id, 
  s.id as student_id,
  u.username,
  subj.name as subject_name,
  r.academic_year,
  r.first_monthly_score,
  r.term_1_total
FROM results r
JOIN students s ON r.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN subjects subj ON r.subject_id = subj.id
WHERE u.username = 'student1'
ORDER BY r.academic_year, subj.name;
```

**Expected output** - should show results for student1:
```
 id | student_id | username | subject_name | academic_year | first_monthly_score | term_1_total
----+------------+----------+--------------+---------------+---------------------+--------------
  1 |          1 | student1 | Mathematics  | 2024-2025     |              85.00  |       255.00
  2 |          1 | student1 | English      | 2024-2025     |              88.00  |       265.00
```

### Step 3: Fix Academic Year Format Mismatch

**Option A: Update Mobile App** (Recommended)
Change the academic year query to match database format:

File: `my-expo-app/screens/ResultsScreen.tsx`
```typescript
// BEFORE
const year = new Date().getFullYear().toString() // "2024"

// AFTER
const year = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` // "2024-2025"
```

**Option B: Update Backend** (Alternative)
Modify the results query to be flexible:

File: `backend/controllers/resultsController.js`
```javascript
// In getMyResultsNormalized()
// Add logic to find matching academic year if current doesn't exist

const academicYearParam = academicYear || 
  `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
```

---

## Debugging Steps

### 1. Check API Response
Test the backend endpoint directly:

```bash
# Get token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"student123"}'

# You'll get something like:
# {"token":"eyJhbGc...","message":"Login successful","user":{...}}

# Use token to get results
curl http://localhost:5001/api/results/student/me/2024-2025 \
  -H "Authorization: Bearer eyJhbGc..."
```

### 2. Check Database State
```bash
# Run seed to populate test data
node seed.js

# Verify results were created
psql -h localhost -p 5432 -U postgres -d school_db \
  -c "SELECT COUNT(*) FROM results;"
```

### 3. Check Mobile App Logs
When running the app, check the console for:
- API endpoint being called
- Response status code
- Actual response body

### 4. Enable Backend Debug Logging
Update results controller to log queries:

```javascript
// In getMyResultsNormalized()
console.log('Fetching results for:');
console.log('- userId:', userId);
console.log('- studentId:', studentId);
console.log('- academicYear:', academicYear);

const rows = await pool.query(
  `SELECT ... WHERE r.student_id = $1 AND r.academic_year = $2`,
  [studentId, academicYear]
);

console.log('Found results:', rows.rows.length);
```

---

## Complete Fix Implementation

### Fix #1: Update Academic Year Format in Mobile App

**File**: `my-expo-app/screens/ResultsScreen.tsx`

Change line that gets current academic year from "2024" to "2024-2025":

```typescript
// FIND THIS:
const year = new Date().getFullYear().toString()

// CHANGE TO THIS:
const year = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
```

### Fix #2: Add Fallback to Backend (Optional)

**File**: `backend/controllers/resultsController.js`

Make the backend more resilient if wrong year format is passed:

```javascript
// Add fallback logic to getMyResultsNormalized()
let finalAcademicYear = academicYear;

// If provided year doesn't match expected format, use current academic year
if (academicYear && !academicYear.includes('-')) {
  const currentYear = new Date().getFullYear();
  finalAcademicYear = `${currentYear}-${currentYear + 1}`;
  console.log(`Academic year format corrected: ${academicYear} -> ${finalAcademicYear}`);
}
```

### Fix #3: Add Better Error Logging

**File**: `backend/controllers/resultsController.js`

Update the query logging:

```javascript
const rows = await pool.query(
  `SELECT ... WHERE r.student_id = $1 AND r.academic_year = $2`,
  [studentId, finalAcademicYear]
);

console.log(`Results query: student_id=${studentId}, academic_year=${finalAcademicYear}`);
console.log(`Found ${rows.rows.length} subject records`);

if (rows.rows.length === 0) {
  console.warn(`⚠️  No results found for student ${studentId} in year ${finalAcademicYear}`);
  console.log('Available academic years:', 
    await pool.query(`SELECT DISTINCT academic_year FROM results ORDER BY academic_year`)
  );
}
```

---

## Checklist to Fix "No Subject Data Available"

- [ ] **1. Seed Database**: Run `node seed.js` in backend folder to populate test data
- [ ] **2. Verify Student Profiles**: Ensure students table has entries for all test users
- [ ] **3. Verify Results**: Check results table has entries for academic year "2024-2025"
- [ ] **4. Fix Academic Year Format**: Update mobile app to use "2024-2025" format
- [ ] **5. Restart Backend**: Kill and restart `node server.js`
- [ ] **6. Login & Test**: Try logging in as student1 (password: student123)
- [ ] **7. Check Results**: Should now see all subjects and scores

---

## Expected Data Flow

```
Mobile App (ResultsScreen.tsx)
  │
  ├─ User logs in with credentials
  │
  ├─ Token stored securely
  │
  ├─ Get current academic year: "2024-2025"
  │
  └─→ API Call: GET /api/results/student/me/2024-2025
       │
       └─→ Backend Middleware (checkStudent.js)
           │
           ├─ Verify token is valid
           ├─ Get user from token
           ├─ Check user role is "student"
           │
           └─→ Controller (resultsController.js - getMyResultsNormalized)
               │
               ├─ Get studentId from students table
               │
               ├─ Query results for that student + academic year
               │
               ├─ Join with subjects table
               │
               ├─ Calculate term & annual totals
               │
               └─→ Return normalized data:
                   {
                     student_id: 1,
                     academic_year: "2024-2025",
                     term_1_grand_total: 500,
                     term_2_grand_total: 510,
                     annual_grand_total: 1010,
                     annual_average: 85.5,
                     subjects: [
                       {
                         subject_id: 1,
                         subject_name: "Mathematics",
                         scores: {...},
                         term_1_total: 255,
                         term_2_total: 260,
                         annual_total: 515
                       },
                       ...
                     ]
                   }
```

If `subjects` array is empty, it means:
1. Student profile doesn't exist, OR
2. No results records for that academic year, OR
3. Academic year format doesn't match

---

## SafeAreaView Status

✅ **Already Properly Implemented**

Your app is using the modern approach from context7 documentation:

- ✅ `SafeAreaProvider` wraps the entire app in `App.tsx`
- ✅ `SafeAreaView` components in LoginScreen and ResultsScreen
- ✅ Proper `edges` configuration for each screen
- ✅ Using `react-native-safe-area-context` v5.6.0
- ✅ No deprecated APIs

**No changes needed for SafeAreaView!**

---

## Summary

**Two Issues**:
1. SafeAreaView: ✅ Already fixed (not deprecated anymore)
2. No subject data: ❌ Needs academic year format fix

**Quick Fix**:
Change mobile app academic year from "2024" to "2024-2025" to match database

**Time to fix**: < 5 minutes
