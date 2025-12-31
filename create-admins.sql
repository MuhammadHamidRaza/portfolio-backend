-- Create admins table
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
