-- Migration: Fix JSONB validation in existing functions
-- Date: 2025-08-19
-- Description: Add proper jsonb_typeof validation to prevent runtime errors

-- Create a helper function to check for non-empty JSONB arrays
CREATE OR REPLACE FUNCTION is_nonempty_jsonb_array(p_jsonb JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN p_jsonb IS NOT NULL 
           AND jsonb_typeof(p_jsonb) = 'array' 
           AND jsonb_array_length(p_jsonb) > 0;
END;
$$;

-- Update the upsert_decision function to use safer JSONB validation
CREATE OR REPLACE FUNCTION upsert_decision(
    p_user_id UUID,
    p_title VARCHAR(255),
    p_description TEXT,
    p_arguments JSONB,
    p_existing_id UUID DEFAULT NULL
) RETURNS TABLE(
    id UUID,
    title VARCHAR(255),
    description TEXT,
    version INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    is_new BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_decision_id UUID;
    v_existing_version INTEGER;
    v_is_new BOOLEAN := FALSE;
BEGIN
    -- Verify user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Verify user ownership
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only manage your own decisions';
    END IF;
    
    -- Try to find existing decision
    IF p_existing_id IS NOT NULL THEN
        -- Update existing decision by ID
        SELECT decisions.version INTO v_existing_version
        FROM decisions 
        WHERE decisions.id = p_existing_id AND decisions.user_id = p_user_id;
        
        IF FOUND THEN
            v_decision_id := p_existing_id;
        END IF;
    END IF;
    
    -- If no existing decision found by ID, try by title
    IF v_decision_id IS NULL THEN
        SELECT decisions.id, decisions.version 
        INTO v_decision_id, v_existing_version
        FROM decisions 
        WHERE decisions.user_id = p_user_id AND decisions.title = p_title;
    END IF;
    
    -- Update existing or create new
    IF v_decision_id IS NOT NULL THEN
        -- Update existing decision
        UPDATE decisions 
        SET 
            title = p_title,
            description = p_description,
            version = decisions.version + 1,
            updated_at = NOW()
        WHERE decisions.id = v_decision_id
        RETURNING 
            decisions.id,
            decisions.title,
            decisions.description,
            decisions.version,
            decisions.created_at,
            decisions.updated_at
        INTO id, title, description, version, created_at, updated_at;
        
        v_is_new := FALSE;
        
        -- Update arguments atomically
        DELETE FROM arguments WHERE decision_id = v_decision_id;
    ELSE
        -- Create new decision
        INSERT INTO decisions (user_id, title, description)
        VALUES (p_user_id, p_title, p_description)
        RETURNING 
            decisions.id,
            decisions.title,
            decisions.description,
            decisions.version,
            decisions.created_at,
            decisions.updated_at
        INTO id, title, description, version, created_at, updated_at;
        
        v_decision_id := id;
        v_is_new := TRUE;
    END IF;
    
    -- Insert arguments - use the helper function for safer validation
    IF is_nonempty_jsonb_array(p_arguments) THEN
        INSERT INTO arguments (decision_id, text, note)
        SELECT 
            v_decision_id,
            (arg->>'text')::TEXT,
            (arg->>'note')::INTEGER
        FROM jsonb_array_elements(p_arguments) AS arg
        WHERE (arg->>'text')::TEXT IS NOT NULL 
          AND (arg->>'text')::TEXT != ''
          AND (arg->>'note')::INTEGER BETWEEN -10 AND 10;
    END IF;
    
    is_new := v_is_new;
    RETURN NEXT;
END;
$$;

-- Update the update_decision_with_arguments function as well
CREATE OR REPLACE FUNCTION update_decision_with_arguments(
    p_decision_id UUID,
    p_title VARCHAR(255),
    p_description TEXT,
    p_expected_version INTEGER,
    p_arguments JSONB
) RETURNS TABLE(
    id UUID,
    title VARCHAR(255),
    description TEXT,
    version INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_version INTEGER;
    v_user_id UUID;
BEGIN
    -- Get current version and verify ownership
    SELECT decisions.version, decisions.user_id 
    INTO v_current_version, v_user_id
    FROM decisions 
    WHERE decisions.id = p_decision_id;
    
    -- Check if decision exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Decision not found: %', p_decision_id;
    END IF;
    
    -- Verify user ownership
    IF v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only update your own decisions';
    END IF;
    
    -- Check version for optimistic locking
    IF v_current_version != p_expected_version THEN
        RAISE EXCEPTION 'Decision was modified by another process. Expected version %, got %', p_expected_version, v_current_version;
    END IF;
    
    -- Update decision with new version
    UPDATE decisions 
    SET 
        title = p_title,
        description = p_description,
        version = decisions.version + 1,
        updated_at = NOW()
    WHERE decisions.id = p_decision_id
    RETURNING 
        decisions.id,
        decisions.title,
        decisions.description,
        decisions.version,
        decisions.created_at,
        decisions.updated_at
    INTO id, title, description, version, created_at, updated_at;
    
    -- Delete existing arguments
    DELETE FROM arguments WHERE decision_id = p_decision_id;
    
    -- Insert new arguments if provided - use helper function
    IF is_nonempty_jsonb_array(p_arguments) THEN
        INSERT INTO arguments (decision_id, text, note)
        SELECT 
            p_decision_id,
            (arg->>'text')::TEXT,
            (arg->>'note')::INTEGER
        FROM jsonb_array_elements(p_arguments) AS arg;
    END IF;
    
    RETURN NEXT;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_nonempty_jsonb_array TO authenticated;
