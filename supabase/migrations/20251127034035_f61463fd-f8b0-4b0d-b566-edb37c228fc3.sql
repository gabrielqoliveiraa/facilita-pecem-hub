-- Create projetos_sociais table
CREATE TABLE public.projetos_sociais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_info TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projetos_sociais ENABLE ROW LEVEL SECURITY;

-- RLS policies for projetos_sociais
CREATE POLICY "Anyone authenticated can view active projetos"
  ON public.projetos_sociais
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage projetos"
  ON public.projetos_sociais
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_projetos_sociais table (user enrollments)
CREATE TABLE public.user_projetos_sociais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  projeto_id UUID NOT NULL REFERENCES public.projetos_sociais(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inscrito',
  inscrito_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, projeto_id)
);

-- Enable RLS
ALTER TABLE public.user_projetos_sociais ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_projetos_sociais
CREATE POLICY "Users can view their own inscricoes"
  ON public.user_projetos_sociais
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inscricoes"
  ON public.user_projetos_sociais
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inscricoes"
  ON public.user_projetos_sociais
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inscricoes"
  ON public.user_projetos_sociais
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all inscricoes"
  ON public.user_projetos_sociais
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at on projetos_sociais
CREATE TRIGGER update_projetos_sociais_updated_at
  BEFORE UPDATE ON public.projetos_sociais
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add trigger for updated_at on user_projetos_sociais
CREATE TRIGGER update_user_projetos_sociais_updated_at
  BEFORE UPDATE ON public.user_projetos_sociais
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();