
-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: admins can read all roles, users can read their own
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create listing_logos table
CREATE TABLE public.listing_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on listing_logos
ALTER TABLE public.listing_logos ENABLE ROW LEVEL SECURITY;

-- Anyone can read active listings (public site)
CREATE POLICY "Anyone can read active listings"
  ON public.listing_logos FOR SELECT
  USING (is_active = true);

-- Only admins can read all listings (including inactive)
CREATE POLICY "Admins can read all listings"
  ON public.listing_logos FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert listings
CREATE POLICY "Admins can insert listings"
  ON public.listing_logos FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update listings
CREATE POLICY "Admins can update listings"
  ON public.listing_logos FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete listings
CREATE POLICY "Admins can delete listings"
  ON public.listing_logos FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for listing logos
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-logos', 'listing-logos', true);

-- Storage policies for listing logos
CREATE POLICY "Logo images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-logos');

CREATE POLICY "Admins can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listing-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'listing-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listing-logos' AND public.has_role(auth.uid(), 'admin'));
