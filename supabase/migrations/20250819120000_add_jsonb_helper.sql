-- Migration: Add helper function for JSONB validation
-- Date: 2025-08-19

-- Create a reusable helper function for JSONB array validation
CREATE OR REPLACE FUNCTION is_nonempty_jsonb_array(input_jsonb JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN input_jsonb IS NOT NULL 
       AND jsonb_typeof(input_jsonb) = 'array' 
       AND jsonb_array_length(input_jsonb) > 0;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_nonempty_jsonb_array TO authenticated;
