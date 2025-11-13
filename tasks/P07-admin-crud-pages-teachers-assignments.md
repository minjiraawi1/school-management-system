Title: Frontend — Admin Pages (Teachers & Assignments)

**Status: COMPLETED** ✓

Objective
- Create admin UI for managing teachers and subject/class assignments.

Prerequisites
- Backend teachers/students/assignments endpoints operational.
- Frontend auth and base admin UI available.

Completed Implementations

**ManageTeachers Component** (`frontend/src/pages/admin/ManageTeachers.jsx`)
- Full CRUD functionality: list, create, update, delete teachers
- Form fields: username, password, email, first_name, last_name, employee_id, specialization, qualification, experience_years, hire_date
- Validation: required fields, experience_years as non-negative number, password required on creation
- Table display: shows teacher name, employee_id, specialization, qualification, experience years
- Edit/Delete actions for each teacher record
- Success/error messaging with auto-dismissal

**ManageAssignments Component** (`frontend/src/pages/admin/ManageAssignments.jsx`)
- Dual section UI: assignment creation form + current assignments table
- Assignment creation form with dropdowns for: Teacher, Subject, Class, and academic_year input
- "Assign" button calls POST `/api/assignments` endpoint
- Current assignments table displays: Teacher name, Subject name, Class name, Academic Year
- Delete functionality with confirmation dialog
- Success/error messaging with proper backend error handling

**API Services**
- `teachersService.js`: listTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher
- `assignmentsService.js`: listAssignments, getTeacherAssignments, createAssignment, deleteAssignment

Acceptance Criteria Met
- ✓ Assignment create/delete functions reliably
- ✓ Unique constraint violations surfaced to user via error messages
- ✓ Clear error handling on all operations
- ✓ Teachers page includes all required fields and validation
