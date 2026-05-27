-- ==========================================
-- COMPAWSS AI SUPABASE DATABASE MIGRATION SCRIPT
-- Copy-paste this script into the Supabase SQL Editor to provision tables.
-- ==========================================

-- Enable PostGIS extension for high performance spatial queries if desired
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. REGISTERED ANIMAL NGOs
CREATE TABLE IF NOT EXISTS ngos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'NGO Stray Shelter',
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    emergency_available BOOLEAN DEFAULT TRUE,
    opening_hours TEXT DEFAULT 'Open 24/7',
    verified_status TEXT DEFAULT 'Verified', -- 'Verified', 'Approved', 'Pending'
    service_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ngos;

-- 2. VETERINARIANS & SPECIALTY CLINICS
CREATE TABLE IF NOT EXISTS veterinarians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    clinic_name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    emergency_available BOOLEAN DEFAULT TRUE,
    opening_hours TEXT DEFAULT 'Open 24/7 (Emergency Service)',
    verified_status TEXT DEFAULT 'Verified',
    service_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE veterinarians;

-- 3. TEMPORARY ANIMAL SHELTERS
CREATE TABLE IF NOT EXISTS shelters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Temporary Recovery Center',
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone TEXT,
    email TEXT,
    emergency_available BOOLEAN DEFAULT TRUE,
    opening_hours TEXT,
    verified_status TEXT DEFAULT 'Verified',
    service_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE shelters;

-- 4. ACTIVE VOLUNTEERS
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    skills TEXT[] DEFAULT '{}',
    active_hours INTEGER DEFAULT 0,
    verified_status TEXT DEFAULT 'Verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE volunteers;

-- 5. HEAVY FIELD RESPONDERS (NGO DISPATCH TEAMS)
CREATE TABLE IF NOT EXISTS responders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'NGO Field Responder',
    phone TEXT,
    city TEXT,
    state TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    service_tags TEXT[] DEFAULT '{}',
    emergency_available BOOLEAN DEFAULT TRUE,
    verified_status TEXT DEFAULT 'Verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE responders;

-- 6. ACTIVE FOSTER HOMES
CREATE TABLE IF NOT EXISTS foster_homes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    preferences TEXT[] DEFAULT '{}',
    capacity INTEGER DEFAULT 2,
    emergency_available BOOLEAN DEFAULT TRUE,
    verified_status TEXT DEFAULT 'Verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE foster_homes;

-- 7. ANIMAL AMBULANCE CARS
CREATE TABLE IF NOT EXISTS animal_ambulances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    emergency_available BOOLEAN DEFAULT TRUE,
    verified_status TEXT DEFAULT 'Verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE animal_ambulances;

-- 8. CITIZEN EMERGENCY INCIDENT REPORTS
CREATE TABLE IF NOT EXISTS emergency_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_name TEXT NOT NULL,
    reporter_contact TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    animal_name TEXT DEFAULT 'Unnamed Street Animal',
    species TEXT NOT NULL DEFAULT 'Dog',
    breed TEXT DEFAULT 'Indie Mix',
    incident_type TEXT NOT NULL DEFAULT 'Injured Stray',
    location_text TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    urgency_level TEXT DEFAULT 'High', -- 'Critical', 'High', 'Standard'
    audio_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_reports;

-- 9. DYNAMIC CASUALTY WORKFLOW CASES
CREATE TABLE IF NOT EXISTS rescue_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_name TEXT NOT NULL,
    species TEXT NOT NULL DEFAULT 'Dog',
    breed TEXT DEFAULT 'Indian Pariah',
    age TEXT DEFAULT 'Sighted Stray',
    gender TEXT DEFAULT 'Unknown',
    image TEXT,
    type TEXT NOT NULL DEFAULT 'Injured Stray',
    location TEXT NOT NULL,
    region TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    reporter_name TEXT,
    reporter_contact TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'Reported', -- 'Reported', 'Assigned', 'Rescue in Progress', 'Veterinary Care', 'Foster Care', 'Resolved'
    priority TEXT NOT NULL DEFAULT 'Standard', -- 'Critical', 'High', 'Standard'
    assigned_responder_id TEXT,
    assigned_ngo_id TEXT,
    assigned_vet_id TEXT,
    assigned_foster_id TEXT,
    medical_diagnostics TEXT,
    medical_severity TEXT DEFAULT 'Observation',
    medical_prescription TEXT[] DEFAULT '{}',
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rescue_cases;

-- Feed some real, high quality test records for India major centers
INSERT INTO ngos (id, name, type, city, state, address, latitude, longitude, phone, emergency_available, verified_status, service_tags)
VALUES 
('c1000000-0000-0000-0000-000000000001', 'Stray Relief India (SRI)', 'NGO Stray Shelter', 'Mumbai', 'Maharashtra', 'Andheri West, Near Azad Nagar Metro Station, Mumbai 400053', 19.1200, 72.8284, '+91 22 2673 0912', TRUE, 'Verified', '{"Andheri", "Bandra", "Juhu", "Khar"}'),
('c1000000-0000-0000-0000-000000000002', 'CUPA Rehabilitation Centre', 'NGO Wildlife & Pet Recovery', 'Bangalore', 'Karnataka', 'RT Nagar, Veterinary College Campus, Bangalore 560032', 12.9840, 77.7516, '+91 80 2294 7300', TRUE, 'Verified', '{"Koramangala", "Indiranagar", "RT Nagar"}'),
('c1000000-0000-0000-0000-000000000003', 'RESQ Charitable Trust', 'NGO Rescue Ops', 'Pune', 'Maharashtra', 'Bavdhan, Pune-Bengaluru Highway, Pune 411021', 18.5132, 73.7825, '+91 91722 21212', TRUE, 'Verified', '{"Bavdhan", "Kothrud", "Aundh"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO veterinarians (id, name, clinic_name, address, city, state, latitude, longitude, phone, emergency_available, verified_status, service_tags)
VALUES 
('d1000000-0000-0000-0000-000000000001', 'Dr. Shalini Mukherji', 'Crown Veterinary Hospital', 'Bandra West, Link Road, Mumbai, Maharashtra 400050', 'Mumbai', 'Maharashtra', 19.0544, 72.8402, '+91 22 6123 0000', TRUE, 'Verified', '{"Orthopedic Surgery", "Trauma", "Stray Triage"}'),
('d1000000-0000-0000-0000-000000000002', 'Dr. Rohan Desai', 'Koramangala Pet Care Clinic', '8th Block, Koramangala, Bangalore, Karnataka 560095', 'Bangalore', 'Karnataka', 12.9352, 77.6245, '+91 80 4353 1212', FALSE, 'Verified', '{"Rehabilitation", "Internal Medicine"}'),
('d1000000-0000-0000-0000-000000000003', 'Dr. Amit Sharma', 'Friendicoes SECA Emergency Clinic', 'No. 270, Defence Colony Flyover Market, New Delhi 110024', 'New Delhi', 'Delhi', 28.5724, 77.2345, '+91 11 2432 0270', TRUE, 'Verified', '{"Critical Care", "Burn Recovery", "Quarantine"}')
ON CONFLICT (id) DO NOTHING;
