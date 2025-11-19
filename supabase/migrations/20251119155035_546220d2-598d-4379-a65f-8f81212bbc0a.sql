-- Create storage bucket for curriculum PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'curriculos',
  'curriculos',
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf']::text[]
);

-- Allow authenticated users to upload their own curriculum
CREATE POLICY "Users can upload their own curriculum"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'curriculos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own curriculum
CREATE POLICY "Users can view their own curriculum"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'curriculos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own curriculum
CREATE POLICY "Users can update their own curriculum"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'curriculos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own curriculum
CREATE POLICY "Users can delete their own curriculum"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'curriculos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table to track curriculum metadata
CREATE TABLE IF NOT EXISTS public.curriculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.curriculos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for curriculos table
CREATE POLICY "Users can view their own curriculum metadata"
ON public.curriculos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own curriculum metadata"
ON public.curriculos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own curriculum metadata"
ON public.curriculos
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own curriculum metadata"
ON public.curriculos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_curriculos_updated_at
BEFORE UPDATE ON public.curriculos
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();