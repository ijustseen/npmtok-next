-- Create table for bookmarked packages
CREATE TABLE public.bookmarked_packages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    package jsonb NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT bookmarked_packages_pkey PRIMARY KEY (id),
    CONSTRAINT bookmarked_packages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create a unique index on user_id and package name
CREATE UNIQUE INDEX bookmarked_packages_user_id_package_name_idx ON public.bookmarked_packages (user_id, ((package ->> 'name'::text)));


-- Secure the table with Row Level Security
ALTER TABLE public.bookmarked_packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow users to manage their own bookmarks" ON public.bookmarked_packages
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 