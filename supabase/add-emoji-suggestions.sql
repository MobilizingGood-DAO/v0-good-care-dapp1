-- Add emoji rating and suggestion fields to checkins table
ALTER TABLE checkins 
ADD COLUMN IF NOT EXISTS emoji_rating INTEGER,
ADD COLUMN IF NOT EXISTS suggestion TEXT;

-- Add index for emoji rating queries
CREATE INDEX IF NOT EXISTS idx_checkins_emoji_rating ON checkins(emoji_rating);

-- Update existing records to have emoji ratings based on emoji (1-5 scale)
UPDATE checkins 
SET emoji_rating = CASE 
  WHEN emoji = '😢' THEN 1
  WHEN emoji = '😕' THEN 2  
  WHEN emoji = '😐' THEN 3
  WHEN emoji = '😊' THEN 4
  WHEN emoji = '😄' THEN 5
  ELSE 3
END
WHERE emoji_rating IS NULL;

-- Add constraint to ensure emoji_rating is between 1-5
ALTER TABLE checkins 
ADD CONSTRAINT check_emoji_rating_range 
CHECK (emoji_rating >= 1 AND emoji_rating <= 5);
