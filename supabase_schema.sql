-- Create students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  grade TEXT NOT NULL,
  diagnosis TEXT,
  resolution TEXT,
  "accommodationType" TEXT NOT NULL,
  "photoUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
-- Allow public read (No Auth Required)
CREATE POLICY "Allow public read" ON students
  FOR SELECT USING (true);

-- Allow only specific super user to write/update/delete
-- Replace 'hluengo.ro@gmail.com' with your actual admin email
CREATE POLICY "Allow admin all" ON students
  FOR ALL USING (auth.jwt() ->> 'email' = 'hluengo.ro@gmail.com');

-- Create cases table
CREATE TABLE cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "studentId" UUID REFERENCES students(id) ON DELETE CASCADE,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read cases" ON cases
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all cases" ON cases
  FOR ALL USING (auth.jwt() ->> 'email' = 'hluengo.ro@gmail.com');
