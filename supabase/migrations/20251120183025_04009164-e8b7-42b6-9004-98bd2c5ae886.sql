-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Admins can view all candidaturas" ON public.candidaturas;
DROP POLICY IF EXISTS "Users can view their own candidaturas" ON public.candidaturas;

-- Recreate SELECT policies as PERMISSIVE (they will be combined with OR logic)
CREATE POLICY "Admins can view all candidaturas"
ON public.candidaturas
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own candidaturas"
ON public.candidaturas
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Also update UPDATE policies to be PERMISSIVE
DROP POLICY IF EXISTS "Admins can update candidaturas status" ON public.candidaturas;
DROP POLICY IF EXISTS "Users can update their own candidaturas" ON public.candidaturas;

CREATE POLICY "Admins can update candidaturas status"
ON public.candidaturas
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own candidaturas"
ON public.candidaturas
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);