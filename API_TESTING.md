# API Testing Guide

This guide provides cURL examples and Postman setup for testing all API endpoints.

## Prerequisites

- Backend running on `http://localhost:5000`
- Database seeded with test data
- cURL installed (built-in on most systems)

## Authentication Flow

### Step 1: Login to Get Token

**Admin Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response** (example):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@school.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  }
}
```

Save the token for use in subsequent requests:
```bash
TOKEN="your_token_here"
```

### Step 2: Use Token in Requests

All protected endpoints require the token in the Authorization header:
```bash
-H "Authorization: Bearer $TOKEN"
```

---

## Health & Status Endpoints

### Health Check (No Auth Required)
```bash
curl -X GET http://localhost:5000/health
```

**Response**:
```json
{
  "status": "ok",
  "db": "connected"
}
```

### API Status
```bash
curl -X GET http://localhost:5000/
```

---

## Classes API

### Get All Classes
```bash
curl -X GET http://localhost:5000/api/classes \
  -H "Authorization: Bearer $TOKEN"
```

### Get Single Class
```bash
curl -X GET http://localhost:5000/api/classes/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Create New Class
```bash
curl -X POST http://localhost:5000/api/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Class 12-A",
    "grade_level": 12,
    "academic_year": "2024-2025"
  }'
```

### Update Class
```bash
curl -X PUT http://localhost:5000/api/classes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Class 12-A Updated",
    "grade_level": 12,
    "academic_year": "2024-2025"
  }'
```

### Delete Class
```bash
curl -X DELETE http://localhost:5000/api/classes/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Subjects API

### Get All Subjects
```bash
curl -X GET http://localhost:5000/api/subjects \
  -H "Authorization: Bearer $TOKEN"
```

### Create Subject
```bash
curl -X POST http://localhost:5000/api/subjects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Physics",
    "code": "PHY",
    "description": "Physics fundamentals and concepts"
  }'
```

### Update Subject
```bash
curl -X PUT http://localhost:5000/api/subjects/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Physics Updated",
    "code": "PHY",
    "description": "Updated description"
  }'
```

### Delete Subject
```bash
curl -X DELETE http://localhost:5000/api/subjects/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Teachers API

### Get All Teachers
```bash
curl -X GET http://localhost:5000/api/teachers \
  -H "Authorization: Bearer $TOKEN"
```

### Get Single Teacher
```bash
curl -X GET http://localhost:5000/api/teachers/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Create Teacher
```bash
curl -X POST http://localhost:5000/api/teachers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "teacher_new",
    "password": "password123",
    "email": "newteacher@school.com",
    "first_name": "David",
    "last_name": "Brown",
    "employee_id": "T004",
    "specialization": "Physics",
    "qualification": "M.Sc. Physics",
    "experience_years": 3,
    "hire_date": "2021-08-15"
  }'
```

### Update Teacher
```bash
curl -X PUT http://localhost:5000/api/teachers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "updated@school.com",
    "first_name": "John",
    "last_name": "Doe",
    "specialization": "Advanced Mathematics",
    "experience_years": 9
  }'
```

### Delete Teacher
```bash
curl -X DELETE http://localhost:5000/api/teachers/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Students API

### Get All Students
```bash
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer $TOKEN"
```

### Get Students in Specific Class
```bash
curl -X GET http://localhost:5000/api/students/class/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Get Single Student
```bash
curl -X GET http://localhost:5000/api/students/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Create Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "student_new",
    "password": "password123",
    "email": "newstudent@school.com",
    "first_name": "Emma",
    "last_name": "Williams",
    "student_id": "STU004",
    "class_id": 1,
    "date_of_birth": "2007-03-20",
    "parent_name": "Mrs. Williams",
    "parent_phone": "555-0104",
    "parent_email": "parent@email.com"
  }'
```

### Update Student
```bash
curl -X PUT http://localhost:5000/api/students/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "updated@school.com",
    "class_id": 2,
    "parent_name": "Mr. Brown"
  }'
```

### Delete Student
```bash
curl -X DELETE http://localhost:5000/api/students/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Assignments API

### Get All Assignments
```bash
curl -X GET http://localhost:5000/api/assignments \
  -H "Authorization: Bearer $TOKEN"
```

### Get Teacher's Assignments
```bash
curl -X GET http://localhost:5000/api/assignments/teacher/me \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

### Create Assignment
```bash
curl -X POST http://localhost:5000/api/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "teacher_id": 1,
    "subject_id": 1,
    "class_id": 1,
    "academic_year": "2024-2025"
  }'
```

### Delete Assignment
```bash
curl -X DELETE http://localhost:5000/api/assignments/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Results API

### Submit/Update Result
```bash
curl -X POST http://localhost:5000/api/results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "student_id": 1,
    "subject_id": 1,
    "first_monthly_score": 18,
    "second_monthly_score": 19,
    "midterm_exam_score": 35,
    "third_monthly_score": 17,
    "fourth_monthly_score": 18,
    "final_exam_score": 32,
    "academic_year": "2024-2025"
  }'
```

### Get Class Results by Subject
```bash
curl -X GET "http://localhost:5000/api/results/class/1/subject/1/2024-2025" \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

### Get Student's Own Results
```bash
curl -X GET "http://localhost:5000/api/results/student/me/2024-2025" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Response** includes:
```json
{
  "student_id": 1,
  "academic_year": "2024-2025",
  "term_1_grand_total": 72.5,
  "term_2_grand_total": 67.3,
  "annual_grand_total": 139.8,
  "annual_average": 69.9,
  "subjects": [
    {
      "subject_id": 1,
      "subject_name": "Mathematics",
      "scores": {
        "first_monthly_score": 18,
        "second_monthly_score": 19,
        "midterm_exam_score": 35,
        "term_1_total": 72,
        "third_monthly_score": 17,
        "fourth_monthly_score": 18,
        "final_exam_score": 32,
        "term_2_total": 67
      }
    }
  ]
}
```

---

## Error Responses

### Unauthorized (No Token)
```bash
curl -X GET http://localhost:5000/api/classes

# Response 401:
{
  "error": "No token provided"
}
```

### Forbidden (Wrong Role)
```bash
# Using student token on admin endpoint
curl -X GET http://localhost:5000/api/classes \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Response 403:
{
  "error": "Admin access required"
}
```

### Invalid Input
```bash
curl -X POST http://localhost:5000/api/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "",
    "grade_level": "invalid"
  }'

# Response 400:
{
  "errors": [
    {
      "field": "name",
      "message": "Class name is required"
    }
  ]
}
```

### Unique Constraint Violation
```bash
# Creating teacher with duplicate employee_id
curl -X POST http://localhost:5000/api/teachers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "t_new",
    "password": "pass123",
    "email": "new@school.com",
    "first_name": "New",
    "last_name": "Teacher",
    "employee_id": "T001",  # Already exists
    "specialization": "Math",
    "qualification": "M.Sc.",
    "experience_years": 5,
    "hire_date": "2023-01-01"
  }'

# Response 400:
{
  "error": "Employee ID already exists"
}
```

---

## Postman Collection

### Import to Postman

1. Create new Postman collection
2. Set up environment variables:
   - `BASE_URL` = `http://localhost:5000`
   - `TOKEN` = (populated after login)

### Sample Requests to Add

1. **Auth → Login Admin** (POST) - No auth needed
   - Saves response token to `{{TOKEN}}`

2. **Classes → Get All** (GET)
   - Header: `Authorization: Bearer {{TOKEN}}`

3. **Classes → Create** (POST)
   - Header: `Authorization: Bearer {{TOKEN}}`
   - Body: JSON with class data

4. **Teachers → Create** (POST)
   - Header: `Authorization: Bearer {{TOKEN}}`
   - Body: JSON with teacher data

5. **Results → Submit** (POST)
   - Header: `Authorization: Bearer {{TOKEN}}`
   - Body: JSON with result scores

6. **Results → Get My Results** (GET)
   - Header: `Authorization: Bearer {{TOKEN}}`

### Postman Pre-request Script (for Auth)

```javascript
// Run this before Login request to set the URL
pm.variables.set("BASE_URL", "http://localhost:5000");
```

### Postman Post-request Script (Save Token)

```javascript
// Run this after Login to save token
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.variables.set("TOKEN", jsonData.token);
    console.log("Token saved: " + jsonData.token.substring(0, 20) + "...");
}
```

---

## Testing Workflow

### 1. Full Admin Workflow
```bash
# 1. Login as admin
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

echo "Token: $TOKEN"

# 2. Create a new class
curl -X POST http://localhost:5000/api/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Class 9-C","grade_level":9,"academic_year":"2024-2025"}'

# 3. View all classes
curl -X GET http://localhost:5000/api/classes \
  -H "Authorization: Bearer $TOKEN"

# 4. Create a teacher
curl -X POST http://localhost:5000/api/teachers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username":"new_teacher","password":"pass123",
    "email":"newteach@school.com","first_name":"Alex","last_name":"Smith",
    "employee_id":"T005","specialization":"Chemistry",
    "qualification":"B.Sc.","experience_years":2,"hire_date":"2023-01-01"
  }'
```

### 2. Teacher Results Submission
```bash
# 1. Login as teacher
TEACHER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher1","password":"teacher123"}' | jq -r '.token')

# 2. Get my assignments
curl -X GET http://localhost:5000/api/assignments/teacher/me \
  -H "Authorization: Bearer $TEACHER_TOKEN"

# 3. Submit results for a student
curl -X POST http://localhost:5000/api/results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "student_id":1,"subject_id":1,"academic_year":"2024-2025",
    "first_monthly_score":20,"second_monthly_score":20,"midterm_exam_score":40,
    "third_monthly_score":19,"fourth_monthly_score":20,"final_exam_score":38
  }'
```

### 3. Student View Results
```bash
# 1. Login as student
STUDENT_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"student123"}' | jq -r '.token')

# 2. View my results
curl -X GET http://localhost:5000/api/results/student/me/2024-2025 \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.'
```

---

## Debugging Tips

### Pretty Print JSON
Add `| jq '.'` to any curl command:
```bash
curl ... | jq '.'
```

### Save Response to File
```bash
curl ... > response.json
```

### View Response Headers
```bash
curl -i -X GET http://localhost:5000/api/classes \
  -H "Authorization: Bearer $TOKEN"
```

### Verbose Output (see all details)
```bash
curl -v -X GET http://localhost:5000/api/classes \
  -H "Authorization: Bearer $TOKEN"
```

### Check Token Validity
```bash
# Decode JWT token (requires `jq`)
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq '.'
```

---

## Common Issues

### "No token provided"
- Solution: Make sure you're using the correct token in Authorization header
- Check token hasn't expired (24 hour expiration)

### "Admin access required"
- Solution: Use admin token, not student/teacher token

### "Employee ID already exists"
- Solution: Use unique employee ID, or delete existing teacher first

### "Port 5000 in use"
- Solution: Change PORT in .env or kill process: `lsof -ti:5000 | xargs kill -9`

---

## Notes

- All timestamps are in UTC
- Passwords are minimum 8 characters in production
- Tokens expire after 24 hours
- Database changes are persistent (unless seeding script is rerun)
- Test credentials are only for development/testing
