CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), full_name VARCHAR(160) NOT NULL, email VARCHAR(320) UNIQUE NOT NULL, phone VARCHAR(32) NOT NULL, password_hash TEXT NOT NULL, role VARCHAR(16) NOT NULL CHECK (role IN ('BUYER','SELLER','BOTH')), aadhaar_verified BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS properties (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), seller_id UUID NOT NULL REFERENCES users(id), transaction_type VARCHAR(8) NOT NULL CHECK (transaction_type IN ('RENT','SALE')), category VARCHAR(8) NOT NULL CHECK (category IN ('FLAT','HOUSE','PLOT')), title VARCHAR(240) NOT NULL, description TEXT NOT NULL, price NUMERIC(15,2) NOT NULL CHECK (price >= 0), token_amount NUMERIC(15,2) NOT NULL CHECK (token_amount >= 0 AND token_amount <= price), carpet_area_sqft NUMERIC(12,2), survey_number VARCHAR(120), zone VARCHAR(120), address_text TEXT NOT NULL, location geometry(Point,4326) NOT NULL, boundary_polygon geometry(Polygon,4326), document_url TEXT, document_type VARCHAR(32) CHECK (document_type IN ('7_12_SADBARA','LIGHT_BILL','INDEX_II','TAX_RECEIPT')), is_verified BOOLEAN NOT NULL DEFAULT FALSE, composite_risk_score INT NOT NULL DEFAULT 100 CHECK (composite_risk_score BETWEEN 0 AND 100), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT plot_boundary_only CHECK (category = 'PLOT' OR boundary_polygon IS NULL));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_name VARCHAR(160);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(32);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_email VARCHAR(320);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_id_number VARCHAR(80);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_media JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS physical_proof_video_url TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS proof_latitude DOUBLE PRECISION;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS proof_longitude DOUBLE PRECISION;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS proof_address_distance_metres DOUBLE PRECISION;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS verification_status VARCHAR(24) NOT NULL DEFAULT 'DRAFT';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS verification_checks JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS verification_issues JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS external_listing_urls JSONB NOT NULL DEFAULT '[]'::jsonb;
CREATE TABLE IF NOT EXISTS physical_verification_proofs (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), seller_id UUID NOT NULL REFERENCES users(id), property_id UUID REFERENCES properties(id) ON DELETE SET NULL, video_url TEXT NOT NULL, latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS escrow_transactions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), property_id UUID NOT NULL REFERENCES properties(id), buyer_id UUID NOT NULL REFERENCES users(id), seller_id UUID NOT NULL REFERENCES users(id), amount NUMERIC(15,2) NOT NULL CHECK (amount > 0), status VARCHAR(32) NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED','HELD_IN_ESCROW','RELEASED_TO_SELLER','REFUNDED_TO_BUYER')), qr_secret VARCHAR(128), qr_expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS properties_location_gist_idx ON properties USING GIST(location);
CREATE INDEX IF NOT EXISTS properties_boundary_gist_idx ON properties USING GIST(boundary_polygon);
CREATE INDEX IF NOT EXISTS properties_verification_status_idx ON properties(verification_status);
-- Application query: polygon area in square metres.
-- SELECT ST_Area(geography(boundary_polygon)) AS area_square_metres
-- FROM properties
-- WHERE id = $1 AND boundary_polygon IS NOT NULL;
--
-- Application query: verified listings within radius $3 metres of latitude $1
-- and longitude $2. Execute this through a parameterized database call.
-- SELECT p.*,
--   ST_Distance(
--     p.location::geography,
--     ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
--   ) AS distance_metres
-- FROM properties p
-- WHERE p.is_verified = TRUE
--   AND ST_DWithin(
--     p.location::geography,
--     ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
--     $3
--   )
-- ORDER BY distance_metres;
