-- Create all portfolio tables

-- Home table
CREATE TABLE IF NOT EXISTS home (
    id SERIAL PRIMARY KEY,
    greeting TEXT NOT NULL DEFAULT 'Hello, I''m',
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    typed_roles TEXT NOT NULL,
    bio TEXT NOT NULL,
    cv_link TEXT,
    github_link TEXT,
    linkedin_link TEXT,
    email TEXT,
    phone TEXT,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- About table
CREATE TABLE IF NOT EXISTS about (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'About Me',
    subtitle TEXT NOT NULL,
    bio_text TEXT NOT NULL,
    values TEXT NOT NULL,
    background_image_url TEXT,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT 'primary',
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    technologies TEXT NOT NULL,
    category TEXT,
    live_demo TEXT,
    github_link TEXT,
    featured BOOLEAN DEFAULT FALSE,
    color TEXT DEFAULT 'primary',
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    project_name TEXT,
    issuer TEXT,
    type TEXT NOT NULL,
    link TEXT,
    image TEXT,
    images TEXT,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Experience table
CREATE TABLE IF NOT EXISTS experience (
    id SERIAL PRIMARY KEY,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    duration TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT NOT NULL,
    icon TEXT DEFAULT 'fas fa-briefcase',
    color TEXT DEFAULT 'primary',
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Education table
CREATE TABLE IF NOT EXISTS education (
    id SERIAL PRIMARY KEY,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT NOT NULL,
    highlights_title TEXT,
    highlights TEXT NOT NULL,
    icon TEXT DEFAULT 'fas fa-university',
    color TEXT DEFAULT 'primary',
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    color TEXT DEFAULT 'primary',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Contact table
CREATE TABLE IF NOT EXISTS contact (
    id SERIAL PRIMARY KEY,
    contact_items TEXT NOT NULL,
    social_links TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT,
    size TEXT,
    related_type TEXT NOT NULL,
    related_id TEXT,
    alt_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default admin user (change password in production!)
INSERT INTO admins (email, password, name) VALUES
('admin@hamidraza.com', 'Hamid@123', 'Muhammad Hamid Raza')
ON CONFLICT (email) DO NOTHING;
