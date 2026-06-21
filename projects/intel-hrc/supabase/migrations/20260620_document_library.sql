-- Document library for AP team file management
CREATE TABLE IF NOT EXISTS library_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other',
  tags text[] NOT NULL DEFAULT '{}',
  document_date date,
  file_format text,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  entity_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  uploaded_by text DEFAULT 'Tina-Randa',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_library_documents_category ON library_documents(category);
CREATE INDEX IF NOT EXISTS idx_library_documents_document_date ON library_documents(document_date DESC);
CREATE INDEX IF NOT EXISTS idx_library_documents_tags ON library_documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_library_documents_created_at ON library_documents(created_at DESC);

CREATE TABLE IF NOT EXISTS library_document_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
  shared_with_email text NOT NULL,
  shared_by text NOT NULL DEFAULT 'Tina-Randa',
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_library_document_shares_document ON library_document_shares(document_id);
