
CREATE TABLE analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_url text NOT NULL,
  shortcode text NOT NULL,
  overall_score smallint NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  hook_strength smallint NOT NULL CHECK (hook_strength >= 0 AND hook_strength <= 100),
  audio_sync smallint NOT NULL CHECK (audio_sync >= 0 AND audio_sync <= 100),
  visual_quality smallint NOT NULL CHECK (visual_quality >= 0 AND visual_quality <= 100),
  caption_power smallint NOT NULL CHECK (caption_power >= 0 AND caption_power <= 100),
  trend_alignment smallint NOT NULL CHECK (trend_alignment >= 0 AND trend_alignment <= 100),
  analysis_cards jsonb NOT NULL DEFAULT '[]',
  dashboard_metrics jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_analyses_shortcode ON analyses (shortcode);
CREATE INDEX idx_analyses_created_at ON analyses (created_at DESC);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_analyses" ON analyses FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_analyses" ON analyses FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "update_analyses" ON analyses FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "delete_analyses" ON analyses FOR DELETE
  TO authenticated USING (true);
