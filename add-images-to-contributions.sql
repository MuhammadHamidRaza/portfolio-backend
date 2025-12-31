-- Migration: Add images field to contributions table
-- Date: 2025-12-27
-- Purpose: Support multiple images like projects table

-- Add images column if it doesn't exist
ALTER TABLE contributions
ADD COLUMN IF NOT EXISTS images TEXT;

-- Optionally, if image column doesn't exist, add it too
ALTER TABLE contributions
ADD COLUMN IF NOT EXISTS image TEXT;

-- Update existing records (optional - sets images to empty string)
UPDATE contributions
SET images = ''
WHERE images IS NULL;
