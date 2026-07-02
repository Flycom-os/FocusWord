-- Migration: add_user_theme
-- Adds themeMode column to User table with default 'light'

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "themeMode" TEXT DEFAULT 'light';
