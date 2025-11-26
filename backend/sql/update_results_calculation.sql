-- Drop old generated columns
ALTER TABLE results DROP COLUMN term_1_total;
ALTER TABLE results DROP COLUMN term_2_total;

-- Add new generated columns with correct logic
ALTER TABLE results ADD COLUMN term_1_total NUMERIC(5,2) GENERATED ALWAYS AS (
    COALESCE(first_monthly_score, 0) + 
    COALESCE(midterm_exam_score, 0)
) STORED;

ALTER TABLE results ADD COLUMN term_2_total NUMERIC(5,2) GENERATED ALWAYS AS (
    COALESCE(second_monthly_score, 0) + 
    COALESCE(final_exam_score, 0)
) STORED;
