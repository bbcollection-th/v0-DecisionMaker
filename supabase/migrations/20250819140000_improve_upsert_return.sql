-- Migration: Improve upsert_decision to return actual argument data
-- Date: 2025-08-19
-- Description: Modify upsert_decision to return actual argument IDs and timestamps from database

-- Enhanced upsert function that returns full argument data with real IDs
CREATE OR REPLACE FUNCTION upsert_decision_with_arguments(
    p_user_id UUID,
    p_title VARCHAR(255),
    p_description TEXT,
    p_arguments JSONB,
    p_existing_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_decision_id UUID;
    v_existing_version INTEGER;
    v_is_new BOOLEAN := FALSE;
    v_decision_data JSONB;
    v_arguments_data JSONB;
    v_result JSONB;
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
        WHERE decisions.id = v_decision_id;
        
        v_is_new := FALSE;
        
        -- Delete existing arguments
        DELETE FROM arguments WHERE decision_id = v_decision_id;
    ELSE
        -- Create new decision
        INSERT INTO decisions (user_id, title, description)
        VALUES (p_user_id, p_title, p_description)
        RETURNING decisions.id INTO v_decision_id;
        
        v_is_new := TRUE;
    END IF;
    
    -- Insert arguments and collect their real data
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
    
    -- Get the complete decision data with real argument IDs and timestamps
    SELECT jsonb_build_object(
        'id', decisions.id,
        'title', decisions.title,
        'description', decisions.description,
        'version', decisions.version,
        'created_at', decisions.created_at,
        'updated_at', decisions.updated_at
    ) INTO v_decision_data
    FROM decisions
    WHERE decisions.id = v_decision_id;
    
    -- Get the arguments with real IDs and timestamps
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', arguments.id,
            'text', arguments.text,
            'note', arguments.note,
            'created_at', arguments.created_at,
            'updated_at', arguments.created_at -- arguments table doesn't have updated_at
        )
    ), '[]'::jsonb) INTO v_arguments_data
    FROM arguments
    WHERE arguments.decision_id = v_decision_id;
    
    -- Build the final result
    SELECT jsonb_build_object(
        'decision', v_decision_data,
        'arguments', v_arguments_data,
        'isNew', v_is_new
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION upsert_decision_with_arguments TO authenticated;
