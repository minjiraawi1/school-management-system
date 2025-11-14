# Mobile App Login Troubleshooting Guide

## ✅ Issues Fixed

### 1. **API URL Port Mismatch** 
**Problem**: Mobile app was trying to connect to `http://localhost:5000/api` but backend runs on port `5001`
**Solution**: Updated `lib/api.ts` to use port `5001`
**Status**: ✅ FIXED

### 2. **Missing Environment Configuration**
**Problem**: Mobile app had no `.env` file to store API URL
**Solution**: Created `.env` file with `EXPO_PUBLIC_API_URL=http://localhost:5001/api`
**Status**: ✅ FIXED

### 3. **Database Seeding**
**Problem**: Uncertain if test data (student1 user) existed in database
**Solution**: Ran seed script which created all test users and data
**Status**: ✅ VERIFIED

---

## 🔐 Correct Login Credentials

### Student Accounts
```
Username: student1
Password: student123

Username: student2
Password: student123

Username: student3
Password: student123
```

### Other Accounts
```
Admin:
  Username: admin
  Password: admin123

Teachers:
  Username: teacher1 | teacher2 | teacher3
  Password: teacher123 (for all)
```

⚠️ **Note**: Password is `student123` (lowercase), NOT `student123` with capital S.

---

## 🚀 How to Test Login

### Step 1: Verify Backend is Running
```bash
# In backend directory
npm start
# Should show: "Server is running on port 5001"
```

### Step 2: Verify Database Connection
The backend will automatically connect to PostgreSQL using:
- **Host**: localhost
- **Port**: 5432
- **Database**: school_db
- **User**: postgres
- **Password**: ahmadek

### Step 3: Reload Mobile App
1. Press `Ctrl+C` in Expo terminal to stop
2. Run: `npx expo start --clear`
3. Scan QR code with Expo Go or simulator

### Step 4: Try Login
- Username: `student1`
- Password: `student123`

---

## 🔍 Debugging Steps

### If Login Still Fails:

#### 1. Check Network Connectivity
```bash
# Test if backend is responding
curl http://localhost:5001/health

# Expected response:
# {"status":"ok","db":"connected"}
```

#### 2. Check API URL in App
The mobile app should be using:
```
http://localhost:5001/api
```

For physical Android/iOS devices on your network:
```
http://YOUR_MACHINE_IP:5001/api
```

#### 3. Check Database Connection
The backend logs should show:
```
Connected to PostgreSQL database
```

If not, verify `.env` in backend:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_db
DB_USER=postgres
DB_PASSWORD=ahmadek
```

#### 4. Check Backend Logs
The backend console should show login attempts:
```
POST /api/auth/login
username: student1
```

If you see errors like `Invalid credentials`, the password hash doesn't match.

---

## 📱 For Physical Devices

If testing on an actual phone:

1. **Find your machine's IP address**:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. **Update `.env` in mobile app**:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:5001/api
   ```

3. **Restart Expo server**:
   ```bash
   npx expo start --clear
   ```

4. **Make sure phone and computer are on same WiFi**

---

## 🛠️ Files Modified

### Backend
- `backend/.env` - Database and JWT configuration
- `backend/server.js` - Running on port 5001

### Mobile App
- `my-expo-app/lib/api.ts` - Updated API_URL to port 5001
- `my-expo-app/.env` - Created with API URL

### Database
- Seeded with test data (3 students, 3 teachers, 1 admin)

---

## ✨ Expected Behavior After Fix

1. **Mobile app loads**: Expo Go shows login screen
2. **Enter credentials**: `student1` / `student123`
3. **API call**: Mobile app sends POST to `http://localhost:5001/api/auth/login`
4. **Backend validates**: Checks password hash against database
5. **Login success**: Returns JWT token
6. **Token stored**: Secure store saves token
7. **Navigation**: App navigates to Results screen
8. **Results fetched**: Shows academic data from database

---

## 🧪 Quick Test

Run this to test the API manually:

```bash
cd backend
node -e "
const pool = require('./config/db');
pool.query('SELECT username, role FROM users WHERE username = \$1', ['student1'])
  .then(res => {
    console.log('User found:', res.rows[0]);
    process.exit(0);
  })
  .catch(err => {
    console.log('Error:', err.message);
    process.exit(1);
  });
"
```

---

## 📋 Checklist

- [ ] Backend running on port 5001
- [ ] Database has student1 user (password: student123)
- [ ] Mobile app `.env` has `EXPO_PUBLIC_API_URL=http://localhost:5001/api`
- [ ] Expo app restarted with `npx expo start --clear`
- [ ] Trying login with correct credentials (student1 / student123)
- [ ] No typos in username/password
- [ ] Network connection working

---

## 💡 Common Mistakes

| Mistake | Solution |
|---------|----------|
| Using `student123` with capital S | Use lowercase: `student123` |
| Trying password `student123` | Correct password is `student123` |
| API URL still on port 5000 | Change to port 5001 in `lib/api.ts` |
| Haven't restarted Expo | Run `npx expo start --clear` |
| Database not seeded | Run `node seed.js` in backend folder |
| Backend not running | Run `npm start` in backend folder |

---

## 🆘 Still Not Working?

If you've followed all steps and login still fails:

1. **Check mobile app console** (press `j` in Expo terminal)
2. **Check backend console** for error messages
3. **Verify network tab** in browser/debugger shows request to correct URL
4. **Check database directly** if student1 user exists:

```sql
SELECT * FROM users WHERE username = 'student1';
```

---

**Summary**: Backend port was `5001`, mobile app was trying `5000`. Now both are aligned!
