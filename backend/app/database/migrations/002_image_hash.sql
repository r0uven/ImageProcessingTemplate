-- Add content hash and unique constraint for image deduplication
ALTER TABLE images ADD COLUMN content_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_images_content_hash
ON images(content_hash)
WHERE content_hash IS NOT NULL;
