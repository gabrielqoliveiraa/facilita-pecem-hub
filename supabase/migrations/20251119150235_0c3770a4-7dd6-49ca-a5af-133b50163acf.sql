-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for permission management
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create vagas table
CREATE TABLE public.vagas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  salary text NOT NULL,
  description text,
  requirements text,
  posted_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

-- RLS policies for vagas
CREATE POLICY "Anyone authenticated can view active vagas"
  ON public.vagas
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage vagas"
  ON public.vagas
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create noticias table
CREATE TABLE public.noticias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text,
  image_url text,
  published_at timestamp with time zone DEFAULT now() NOT NULL,
  is_published boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;

-- RLS policies for noticias
CREATE POLICY "Anyone authenticated can view published noticias"
  ON public.noticias
  FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage noticias"
  ON public.noticias
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trilhas table
CREATE TABLE public.trilhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  lessons_count integer DEFAULT 0 NOT NULL,
  is_recommended boolean DEFAULT false NOT NULL,
  color_class text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.trilhas ENABLE ROW LEVEL SECURITY;

-- RLS policies for trilhas
CREATE POLICY "Anyone authenticated can view active trilhas"
  ON public.trilhas
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage trilhas"
  ON public.trilhas
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create user_trilhas table (user progress in trails)
CREATE TABLE public.user_trilhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  trilha_id uuid REFERENCES public.trilhas(id) ON DELETE CASCADE NOT NULL,
  progress integer DEFAULT 0 NOT NULL CHECK (progress >= 0 AND progress <= 100),
  started_at timestamp with time zone DEFAULT now() NOT NULL,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, trilha_id)
);

ALTER TABLE public.user_trilhas ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_trilhas
CREATE POLICY "Users can view their own trilhas"
  ON public.user_trilhas
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trilhas"
  ON public.user_trilhas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trilhas"
  ON public.user_trilhas
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trilhas"
  ON public.user_trilhas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create candidaturas table (job applications)
CREATE TABLE public.candidaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vaga_id uuid REFERENCES public.vagas(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pendente' NOT NULL,
  mensagem text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, vaga_id)
);

ALTER TABLE public.candidaturas ENABLE ROW LEVEL SECURITY;

-- RLS policies for candidaturas
CREATE POLICY "Users can view their own candidaturas"
  ON public.candidaturas
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own candidaturas"
  ON public.candidaturas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidaturas"
  ON public.candidaturas
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all candidaturas"
  ON public.candidaturas
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update candidaturas status"
  ON public.candidaturas
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_vagas_updated_at
  BEFORE UPDATE ON public.vagas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_noticias_updated_at
  BEFORE UPDATE ON public.noticias
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_trilhas_updated_at
  BEFORE UPDATE ON public.trilhas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_trilhas_updated_at
  BEFORE UPDATE ON public.user_trilhas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_candidaturas_updated_at
  BEFORE UPDATE ON public.candidaturas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();