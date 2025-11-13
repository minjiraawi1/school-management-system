-- Results table
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    first_monthly_score NUMERIC(5,2),
    second_monthly_score NUMERIC(5,2),
    midterm_exam_score NUMERIC(5,2),
    third_monthly_score NUMERIC(5,2),
    fourth_monthly_score NUMERIC(5,2),
    final_exam_score NUMERIC(5,2),
    term_1_total NUMERIC(5,2) GENERATED ALWAYS AS (
        COALESCE(first_monthly_score, 0) + 
        COALESCE(second_monthly_score, 0) + 
        COALESCE(midterm_exam_score, 0)
    ) STORED,
    term_2_total NUMERIC(5,2) GENERATED ALWAYS AS (
        COALESCE(third_monthly_score, 0) + 
        COALESCE(fourth_monthly_score, 0) + 
        COALESCE(final_exam_score, 0)
    ) STORED,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id, academic_year)
);

-- Add updated_at trigger
CREATE TRIGGER update_results_updated_at 
    BEFORE UPDATE ON results 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();