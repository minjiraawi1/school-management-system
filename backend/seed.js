/**
 * Database Seeding Script
 * Populates the PostgreSQL database with test data for all roles
 * Usage: node seed.js
 */

const pool = require('./config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data (in reverse order of foreign key dependencies)
    console.log('Clearing existing data...');
    await client.query('TRUNCATE TABLE results CASCADE;');
    await client.query('TRUNCATE TABLE teacher_assignments CASCADE;');
    await client.query('TRUNCATE TABLE teachers CASCADE;');
    await client.query('TRUNCATE TABLE students CASCADE;');
    await client.query('TRUNCATE TABLE subjects CASCADE;');
    await client.query('TRUNCATE TABLE classes CASCADE;');
    await client.query('TRUNCATE TABLE users CASCADE;');
    console.log('✓ Cleared all tables\n');

    // ============ CREATE USERS ============
    console.log('Creating users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedAdminPass = await bcrypt.hash('admin123', 10);
    const hashedTeacherPass = await bcrypt.hash('teacher123', 10);
    const hashedStudentPass = await bcrypt.hash('student123', 10);

    // Admin user
    const adminRes = await client.query(
      'INSERT INTO users (username, password, email, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
      ['admin', hashedAdminPass, 'admin@school.com', 'Admin', 'User', 'admin']
    );
    const adminId = adminRes.rows[0].id;
    console.log('✓ Created admin user (username: admin, password: admin123)');

    // Teacher users
    const teacher1Res = await client.query(
      'INSERT INTO users (username, password, email, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
      ['teacher1', hashedTeacherPass, 'john.doe@school.com', 'John', 'Doe', 'teacher']
    );
    const teacher1Id = teacher1Res.rows[0].id;
    console.log('✓ Created teacher 1 (username: teacher1, password: teacher123)');

    const teacher2Res = await client.query(
      'INSERT INTO users (username, password, email, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
      ['teacher2', hashedTeacherPass, 'jane.smith@school.com', 'Jane', 'Smith', 'teacher']
    );
    const teacher2Id = teacher2Res.rows[0].id;
    console.log('✓ Created teacher 2 (username: teacher2, password: teacher123)');

    const teacher3Res = await client.query(
      'INSERT INTO users (username, password, email, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
      ['teacher3', hashedTeacherPass, 'mike.johnson@school.com', 'Mike', 'Johnson', 'teacher']
    );
    const teacher3Id = teacher3Res.rows[0].id;
    console.log('✓ Created teacher 3 (username: teacher3, password: teacher123)');

    // Student users
    const student1Res = await client.query(
      'INSERT INTO users (username, password, email, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
      ['student1', hashedStudentPass, 'alice.brown@school.com', 'Alice', 'Brown', 'student']
    );
    const student1Id = student1Res.rows[0].id;
    console.log('✓ Created student 1 (username: student1, password: student123)');

    const student2Res = await client.query(
      'INSERT INTO users (username, password, email, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
      ['student2', hashedStudentPass, 'bob.wilson@school.com', 'Bob', 'Wilson', 'student']
    );
    const student2Id = student2Res.rows[0].id;
    console.log('✓ Created student 2 (username: student2, password: student123)');

    const student3Res = await client.query(
      'INSERT INTO users (username, password, email, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
      ['student3', hashedStudentPass, 'carol.davis@school.com', 'Carol', 'Davis', 'student']
    );
    const student3Id = student3Res.rows[0].id;
    console.log('✓ Created student 3 (username: student3, password: student123)');

    console.log();

    // ============ CREATE CLASSES ============
    console.log('Creating classes...');
    
    const class1Res = await client.query(
      'INSERT INTO classes (name, grade_level, academic_year) VALUES ($1, $2, $3) RETURNING id;',
      ['Class 10-A', 10, '2024-2025']
    );
    const class1Id = class1Res.rows[0].id;
    console.log('✓ Created Class 10-A');

    const class2Res = await client.query(
      'INSERT INTO classes (name, grade_level, academic_year) VALUES ($1, $2, $3) RETURNING id;',
      ['Class 10-B', 10, '2024-2025']
    );
    const class2Id = class2Res.rows[0].id;
    console.log('✓ Created Class 10-B');

    const class3Res = await client.query(
      'INSERT INTO classes (name, grade_level, academic_year) VALUES ($1, $2, $3) RETURNING id;',
      ['Class 11-A', 11, '2024-2025']
    );
    const class3Id = class3Res.rows[0].id;
    console.log('✓ Created Class 11-A');

    console.log();

    // ============ CREATE SUBJECTS ============
    console.log('Creating subjects...');
    
    const mathRes = await client.query(
      'INSERT INTO subjects (name, code, description) VALUES ($1, $2, $3) RETURNING id;',
      ['Mathematics', 'MATH', 'Mathematics and algebra fundamentals']
    );
    const mathId = mathRes.rows[0].id;
    console.log('✓ Created Mathematics subject');

    const englishRes = await client.query(
      'INSERT INTO subjects (name, code, description) VALUES ($1, $2, $3) RETURNING id;',
      ['English', 'ENG', 'English language and literature']
    );
    const englishId = englishRes.rows[0].id;
    console.log('✓ Created English subject');

    const scienceRes = await client.query(
      'INSERT INTO subjects (name, code, description) VALUES ($1, $2, $3) RETURNING id;',
      ['Science', 'SCI', 'General Science including Physics and Chemistry']
    );
    const scienceId = scienceRes.rows[0].id;
    console.log('✓ Created Science subject');

    const historyRes = await client.query(
      'INSERT INTO subjects (name, code, description) VALUES ($1, $2, $3) RETURNING id;',
      ['History', 'HIST', 'World history and civilization']
    );
    const historyId = historyRes.rows[0].id;
    console.log('✓ Created History subject');

    console.log();

    // ============ CREATE TEACHERS ============
    console.log('Creating teacher records...');
    
    const t1Res = await client.query(
      'INSERT INTO teachers (user_id, employee_id, specialization, qualification, experience_years, hire_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
      [teacher1Id, 'T001', 'Mathematics', 'M.Sc. Mathematics', 8, '2016-08-15']
    );
    const teacher1RecId = t1Res.rows[0].id;
    console.log('✓ Created John Doe (Mathematics)');

    const t2Res = await client.query(
      'INSERT INTO teachers (user_id, employee_id, specialization, qualification, experience_years, hire_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
      [teacher2Id, 'T002', 'English', 'M.A. English Literature', 6, '2018-09-10']
    );
    const teacher2RecId = t2Res.rows[0].id;
    console.log('✓ Created Jane Smith (English)');

    const t3Res = await client.query(
      'INSERT INTO teachers (user_id, employee_id, specialization, qualification, experience_years, hire_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
      [teacher3Id, 'T003', 'Science', 'B.Sc. Physics', 5, '2019-07-01']
    );
    const teacher3RecId = t3Res.rows[0].id;
    console.log('✓ Created Mike Johnson (Science)');

    console.log();

    // ============ CREATE STUDENTS ============
    console.log('Creating student records...');
    
    const s1Res = await client.query(
      'INSERT INTO students (user_id, student_id, class_id, date_of_birth, parent_name, parent_phone, parent_email, enrollment_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;',
      [student1Id, 'STU001', class1Id, '2006-05-15', 'Mr. Brown', '555-0101', 'parent1@email.com', '2024-06-01']
    );
    const student1RecId = s1Res.rows[0].id;
    console.log('✓ Created Alice Brown (Class 10-A, STU001)');

    const s2Res = await client.query(
      'INSERT INTO students (user_id, student_id, class_id, date_of_birth, parent_name, parent_phone, parent_email, enrollment_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;',
      [student2Id, 'STU002', class1Id, '2006-08-22', 'Mrs. Wilson', '555-0102', 'parent2@email.com', '2024-06-01']
    );
    const student2RecId = s2Res.rows[0].id;
    console.log('✓ Created Bob Wilson (Class 10-A, STU002)');

    const s3Res = await client.query(
      'INSERT INTO students (user_id, student_id, class_id, date_of_birth, parent_name, parent_phone, parent_email, enrollment_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;',
      [student3Id, 'STU003', class2Id, '2006-03-10', 'Mr. Davis', '555-0103', 'parent3@email.com', '2024-06-01']
    );
    const student3RecId = s3Res.rows[0].id;
    console.log('✓ Created Carol Davis (Class 10-B, STU003)');

    console.log();

    // ============ CREATE TEACHER ASSIGNMENTS ============
    console.log('Creating teacher assignments...');
    
    // John (Math) teaches Math to Class 10-A
    await client.query(
      'INSERT INTO teacher_assignments (teacher_id, subject_id, class_id, academic_year) VALUES ($1, $2, $3, $4);',
      [teacher1RecId, mathId, class1Id, '2024-2025']
    );
    console.log('✓ Assigned John Doe to teach Mathematics in Class 10-A');

    // Jane (English) teaches English to Class 10-A and 10-B
    await client.query(
      'INSERT INTO teacher_assignments (teacher_id, subject_id, class_id, academic_year) VALUES ($1, $2, $3, $4);',
      [teacher2RecId, englishId, class1Id, '2024-2025']
    );
    console.log('✓ Assigned Jane Smith to teach English in Class 10-A');

    await client.query(
      'INSERT INTO teacher_assignments (teacher_id, subject_id, class_id, academic_year) VALUES ($1, $2, $3, $4);',
      [teacher2RecId, englishId, class2Id, '2024-2025']
    );
    console.log('✓ Assigned Jane Smith to teach English in Class 10-B');

    // Mike (Science) teaches Science to Class 10-B
    await client.query(
      'INSERT INTO teacher_assignments (teacher_id, subject_id, class_id, academic_year) VALUES ($1, $2, $3, $4);',
      [teacher3RecId, scienceId, class2Id, '2024-2025']
    );
    console.log('✓ Assigned Mike Johnson to teach Science in Class 10-B');

    // John also teaches Math to Class 11-A
    await client.query(
      'INSERT INTO teacher_assignments (teacher_id, subject_id, class_id, academic_year) VALUES ($1, $2, $3, $4);',
      [teacher1RecId, mathId, class3Id, '2024-2025']
    );
    console.log('✓ Assigned John Doe to teach Mathematics in Class 11-A');

    console.log();

    // ============ CREATE RESULTS ============
    console.log('Creating sample results...');
    
    // Results for Alice (Math and English)
    await client.query(
      'INSERT INTO results (student_id, subject_id, teacher_id, first_monthly_score, second_monthly_score, midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, academic_year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
      [student1RecId, mathId, teacher1RecId, 18, 19, 35, 17, 18, 32, '2024-2025']
    );
    console.log('✓ Created Math results for Alice Brown');

    await client.query(
      'INSERT INTO results (student_id, subject_id, teacher_id, first_monthly_score, second_monthly_score, midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, academic_year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
      [student1RecId, englishId, teacher2RecId, 17, 18, 34, 18, 19, 35, '2024-2025']
    );
    console.log('✓ Created English results for Alice Brown');

    // Results for Bob (Math and English)
    await client.query(
      'INSERT INTO results (student_id, subject_id, teacher_id, first_monthly_score, second_monthly_score, midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, academic_year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
      [student2RecId, mathId, teacher1RecId, 16, 17, 32, 15, 16, 30, '2024-2025']
    );
    console.log('✓ Created Math results for Bob Wilson');

    await client.query(
      'INSERT INTO results (student_id, subject_id, teacher_id, first_monthly_score, second_monthly_score, midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, academic_year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
      [student2RecId, englishId, teacher2RecId, 15, 16, 31, 17, 18, 33, '2024-2025']
    );
    console.log('✓ Created English results for Bob Wilson');

    // Results for Carol (English and Science)
    await client.query(
      'INSERT INTO results (student_id, subject_id, teacher_id, first_monthly_score, second_monthly_score, midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, academic_year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
      [student3RecId, englishId, teacher2RecId, 19, 20, 36, 19, 20, 37, '2024-2025']
    );
    console.log('✓ Created English results for Carol Davis');

    await client.query(
      'INSERT INTO results (student_id, subject_id, teacher_id, first_monthly_score, second_monthly_score, midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, academic_year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
      [student3RecId, scienceId, teacher3RecId, 18, 19, 35, 18, 19, 36, '2024-2025']
    );
    console.log('✓ Created Science results for Carol Davis');

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('='.repeat(60));
    console.log('TEST CREDENTIALS:');
    console.log('='.repeat(60));
    console.log('\n📌 ADMIN:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n📌 TEACHERS:');
    console.log('   Username: teacher1, teacher2, teacher3');
    console.log('   Password: teacher123 (for all)');
    console.log('\n📌 STUDENTS:');
    console.log('   Username: student1, student2, student3');
    console.log('   Password: student123 (for all)');
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

// Run seeding
seed();
