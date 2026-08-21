CREATE TYPE public.archive_audit_action AS ENUM ('requested', 'ready', 'accessed');

CREATE TABLE public.archive_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action public.archive_audit_action NOT NULL,
  footage_date date NOT NULL,
  site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  actor_name text NOT NULL DEFAULT 'Unknown',
  actor_email text,
  actor_role text,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.archive_audit_logs TO anon;
GRANT SELECT, INSERT ON public.archive_audit_logs TO authenticated;
GRANT ALL ON public.archive_audit_logs TO service_role;

ALTER TABLE public.archive_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read archive audit" ON public.archive_audit_logs FOR SELECT USING (true);
CREATE POLICY "public write archive audit" ON public.archive_audit_logs FOR INSERT WITH CHECK (true);

CREATE INDEX archive_audit_logs_created_at_idx ON public.archive_audit_logs (created_at DESC);