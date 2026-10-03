-- Tabellen til henvendelser fra prisberegneren (Cloudflare D1: ovia-henvendelser).
-- Køres én gang i D1-konsollen. Workeren opretter den ikke selv; testen
-- (scripts/test-inquiry.mjs) kører præcis denne fil mod SQLite.
--
-- mail_status: pending (gemt, mail ikke sendt endnu) · sent · failed (sendes
-- igen af den daglige cron) · gave_up (3 genforsøg fejlede; står øverst i den
-- daglige opsummering). retries tæller genforsøg fra cron. reported_at: hvornår
-- en opgivet henvendelse kom med i en opsummering.
CREATE TABLE IF NOT EXISTS henvendelser (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  contact TEXT NOT NULL,
  name TEXT NOT NULL,
  link TEXT NOT NULL,
  subject TEXT NOT NULL,
  summary TEXT NOT NULL,
  mail_status TEXT NOT NULL CHECK (mail_status IN ('pending', 'sent', 'failed', 'gave_up')),
  retries INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  reported_at TEXT
);
CREATE INDEX IF NOT EXISTS henvendelser_status ON henvendelser (mail_status);
CREATE INDEX IF NOT EXISTS henvendelser_created ON henvendelser (created_at);
