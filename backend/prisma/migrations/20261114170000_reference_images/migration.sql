-- Add reference galleries without removing existing shade names, stock, or colors.
ALTER TABLE "Shade" ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Shade" ALTER COLUMN "hex" SET DEFAULT '#ffffff';
