-- AI Generations Table
-- Stores all AI-generated content (roasts, hype, narratives, personality profiles)

-- Create the ai_generations table
CREATE TABLE IF NOT EXISTS ai_generations (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Generation type
  type TEXT NOT NULL CHECK (type IN ('roast', 'hype', 'narrative', 'personality')),

  -- Optional style/variant
  style TEXT,

  -- Optional activity reference (for narratives)
  activity_id TEXT,

  -- Input context (for personality profiles, stores structured data)
  input_context JSONB,

  -- The prompt sent to the AI
  prompt TEXT NOT NULL,

  -- The AI's response
  response TEXT NOT NULL,

  -- Tracking for repetition avoidance
  key_phrases_used TEXT[],
  data_points_referenced TEXT[],

  -- Usage tracking
  tokens_used INTEGER,
  model_used TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id
  ON ai_generations(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_generations_type
  ON ai_generations(type);

CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at
  ON ai_generations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_type
  ON ai_generations(user_id, type);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_created
  ON ai_generations(user_id, created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_generations_updated_at
  BEFORE UPDATE ON ai_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_generations_updated_at();

-- Enable Row Level Security
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can only read their own generations
CREATE POLICY "Users can view own generations"
  ON ai_generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own generations
CREATE POLICY "Users can create own generations"
  ON ai_generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own generations (if needed)
CREATE POLICY "Users can update own generations"
  ON ai_generations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own generations
CREATE POLICY "Users can delete own generations"
  ON ai_generations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can do everything (for admin tasks)
CREATE POLICY "Service role has full access"
  ON ai_generations
  USING (auth.jwt()->>'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE ai_generations IS 'Stores AI-generated content for users';
COMMENT ON COLUMN ai_generations.id IS 'Unique identifier for each generation';
COMMENT ON COLUMN ai_generations.user_id IS 'Reference to the user who owns this generation';
COMMENT ON COLUMN ai_generations.type IS 'Type of generation: roast, hype, narrative, or personality';
COMMENT ON COLUMN ai_generations.style IS 'Optional style variant (e.g., savage, gym-bro)';
COMMENT ON COLUMN ai_generations.activity_id IS 'Optional reference to a specific activity (for narratives)';
COMMENT ON COLUMN ai_generations.input_context IS 'Structured data about the generation (for personality profiles)';
COMMENT ON COLUMN ai_generations.prompt IS 'The full prompt sent to the AI model';
COMMENT ON COLUMN ai_generations.response IS 'The AI model response/content';
COMMENT ON COLUMN ai_generations.key_phrases_used IS 'Array of key phrases used in this generation (for repetition avoidance)';
COMMENT ON COLUMN ai_generations.data_points_referenced IS 'Array of data points referenced (for repetition avoidance)';
COMMENT ON COLUMN ai_generations.tokens_used IS 'Number of tokens consumed by this generation';
COMMENT ON COLUMN ai_generations.model_used IS 'AI model used (e.g., claude-3-5-sonnet, gpt-4o)';
COMMENT ON COLUMN ai_generations.created_at IS 'When this generation was created';
COMMENT ON COLUMN ai_generations.updated_at IS 'When this generation was last updated';
