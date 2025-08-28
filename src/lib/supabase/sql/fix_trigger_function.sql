-- Fix trigger function
DROP FUNCTION IF EXISTS trigger_set_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at_yl_approval_logs ON public.yl_approval_logs;
CREATE TRIGGER set_updated_at_yl_approval_logs
  BEFORE UPDATE ON public.yl_approval_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_yl_channels ON public.yl_channels;
CREATE TRIGGER set_updated_at_yl_channels
  BEFORE UPDATE ON public.yl_channels
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();