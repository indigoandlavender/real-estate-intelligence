-- ============================================
-- TIFORT: Forensic Real Estate Intelligence
-- Supabase PostgreSQL Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS (The Controlled Vocabulary)
-- ============================================

CREATE TYPE ownership_type AS ENUM ('titre_foncier', 'melkia', 'requisition', 'unknown');
CREATE TYPE wall_composition AS ENUM ('tabia', 'brick', 'reinforced_concrete', 'mixed', 'unknown');
CREATE TYPE property_type AS ENUM ('riad', 'dar', 'apartment', 'villa', 'terrain', 'commerce', 'other');
CREATE TYPE transaction_type AS ENUM ('sale', 'rent');
CREATE TYPE property_condition AS ENUM ('new', 'renovated', 'habitable', 'to_renovate', 'ruin');
CREATE TYPE data_source AS ENUM ('mubawab', 'avito', 'field_audit', 'manual', 'agent', 'owner_direct');
CREATE TYPE deal_status AS ENUM ('prospect', 'contacted', 'visiting', 'negotiating', 'due_diligence', 'offer_made', 'under_contract', 'closed', 'rejected', 'lost');

-- ============================================
-- CATEGORY A: LEGAL "RED-TAPE" (Trust Layer)
-- ============================================

CREATE TABLE legal_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL,

  -- Ownership
  ownership_type ownership_type DEFAULT 'unknown',
  titre_foncier_number VARCHAR(50),
  melkia_reference VARCHAR(100),

  -- Heir Risk
  heir_count INTEGER DEFAULT 1,
  heir_coordination_risk BOOLEAN GENERATED ALWAYS AS (heir_count > 5) STORED,
  heir_notes TEXT,

  -- VNA (Vocation Non-Agricole)
  vna_status BOOLEAN DEFAULT FALSE,
  vna_application_date DATE,
  vna_notes TEXT,

  -- Chain of Truth
  legal_chain_complete BOOLEAN DEFAULT FALSE,
  chain_gap_years TEXT, -- e.g., "1987-1992 missing"
  moulkia_scroll_notes TEXT,

  -- Disputes
  has_active_dispute BOOLEAN DEFAULT FALSE,
  dispute_details TEXT,

  -- Encumbrances
  has_mortgage BOOLEAN DEFAULT FALSE,
  mortgage_amount DECIMAL(15,2),
  has_liens BOOLEAN DEFAULT FALSE,

  -- Trust Score Components (0-100)
  ownership_score INTEGER GENERATED ALWAYS AS (
    CASE ownership_type
      WHEN 'titre_foncier' THEN 100
      WHEN 'requisition' THEN 70
      WHEN 'melkia' THEN 50
      ELSE 20
    END
  ) STORED,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATEGORY B: STRUCTURAL "SORE POINTS" (Construction Layer)
-- ============================================

CREATE TABLE structural_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL,
  audit_date DATE DEFAULT CURRENT_DATE,
  auditor_name VARCHAR(100),

  -- Wall Composition
  wall_composition wall_composition DEFAULT 'unknown',
  wall_thickness_cm INTEGER,
  wall_notes TEXT,

  -- Seismic (2026 Norms)
  has_seismic_chaining BOOLEAN DEFAULT FALSE,
  chainage_score INTEGER CHECK (chainage_score >= 0 AND chainage_score <= 10),
  porteur_score INTEGER CHECK (porteur_score >= 0 AND porteur_score <= 10),
  fissure_score INTEGER CHECK (fissure_score >= 0 AND fissure_score <= 10),
  seismic_notes TEXT,

  -- Dampness
  dampness_level INTEGER CHECK (dampness_level >= 0 AND dampness_level <= 10),
  capillary_rise_height_cm INTEGER,
  dampness_renovation_buffer DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN dampness_level > 7 THEN 0.20 ELSE 0.00 END
  ) STORED,
  dampness_notes TEXT,

  -- Verticality
  verticality_degrees DECIMAL(4,2), -- Lean in degrees
  verticality_critical BOOLEAN GENERATED ALWAYS AS (verticality_degrees > 2.0) STORED,

  -- Foundations
  foundation_depth_cm INTEGER,
  foundation_type VARCHAR(50),
  tassement_score INTEGER CHECK (tassement_score >= 0 AND tassement_score <= 10),

  -- Roof/Terrace
  terrace_waterproof BOOLEAN DEFAULT FALSE,
  terrace_score INTEGER CHECK (terrace_score >= 0 AND terrace_score <= 10),

  -- Utilities
  electrical_conformity BOOLEAN DEFAULT FALSE,
  electrical_score INTEGER CHECK (electrical_score >= 0 AND electrical_score <= 10),
  water_pressure_score INTEGER CHECK (water_pressure_score >= 0 AND water_pressure_score <= 10),
  plumbing_age_years INTEGER,

  -- SHS (Structural Health Score) - Weighted calculation
  shs_score INTEGER GENERATED ALWAYS AS (
    COALESCE(chainage_score, 5) * 3 +  -- 30%
    COALESCE(porteur_score, 5) * 2 +   -- 20%
    COALESCE(fissure_score, 5) * 2 +   -- 20%
    COALESCE((10 - dampness_level), 5) * 2 + -- 20%
    COALESCE(terrace_score, 5) * 1     -- 10%
  ) STORED,

  -- Photos
  photo_urls TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATEGORY C: FINANCIAL "COLD TRUTH" (Yield Layer)
-- ============================================

CREATE TABLE financial_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL,
  analysis_date DATE DEFAULT CURRENT_DATE,

  -- Asking Price
  asking_price DECIMAL(15,2),
  asking_price_per_sqm DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'MAD',

  -- Target Metrics
  target_adr DECIMAL(10,2), -- Average Daily Rate for suite
  target_occupancy_rate DECIMAL(5,2) DEFAULT 65.00,
  suite_count INTEGER,

  -- Renovation
  renovation_estimate_per_sqm DECIMAL(10,2),
  total_renovation_estimate DECIMAL(15,2),
  renovation_timeline_months INTEGER,

  -- Acquisition Costs (Morocco 2026)
  notary_fees_rate DECIMAL(5,4) DEFAULT 0.0600,
  registration_tax_rate DECIMAL(5,4) DEFAULT 0.0400,
  total_acquisition_cost DECIMAL(15,2),

  -- Yield Calculations
  gross_annual_income DECIMAL(15,2),
  net_operating_income DECIMAL(15,2),
  gross_yield DECIMAL(5,2),
  net_yield DECIMAL(5,2),
  cash_on_cash_return DECIMAL(5,2),
  payback_years DECIMAL(5,2),

  -- Exit Strategy
  exit_multiplier DECIMAL(4,2) DEFAULT 1.20, -- Value increase after Trust Gap closed
  projected_exit_value DECIMAL(15,2),
  titre_conversion_cost DECIMAL(15,2), -- Cost to convert Melkia to Titre

  -- World Cup 2030 Factor
  distance_to_infrastructure_m INTEGER,
  wc2030_appreciation_factor DECIMAL(5,4) GENERATED ALWAYS AS (
    CASE
      WHEN distance_to_infrastructure_m < 500 THEN 0.0500
      WHEN distance_to_infrastructure_m < 1000 THEN 0.0300
      WHEN distance_to_infrastructure_m < 2000 THEN 0.0150
      ELSE 0.0000
    END
  ) STORED,

  -- Taxes (Morocco 2026)
  vat_rate DECIMAL(5,4) DEFAULT 0.2000,
  igt_rate DECIMAL(5,4) DEFAULT 0.1500,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MASTER PROPERTIES TABLE
-- ============================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Source Tracking
  source data_source NOT NULL,
  source_id VARCHAR(100),
  source_url TEXT,

  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type property_type DEFAULT 'other',
  transaction_type transaction_type DEFAULT 'sale',
  condition property_condition DEFAULT 'to_renovate',

  -- Location
  city VARCHAR(100) DEFAULT 'Marrakech',
  neighborhood VARCHAR(100),
  address TEXT,
  derb VARCHAR(100), -- Specific alley name
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),

  -- Access (Critical for renovation costs)
  alley_width_m DECIMAL(4,2),
  alley_labor_buffer DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN alley_width_m < 1.5 THEN 0.15 ELSE 0.00 END
  ) STORED,
  distance_to_parking_m INTEGER,

  -- Size
  surface_total_sqm DECIMAL(10,2),
  surface_habitable_sqm DECIMAL(10,2),
  surface_terrain_sqm DECIMAL(10,2),
  floors INTEGER DEFAULT 1,

  -- Features
  bedrooms INTEGER,
  bathrooms INTEGER,
  suites INTEGER,
  has_pool BOOLEAN DEFAULT FALSE,
  has_terrace BOOLEAN DEFAULT TRUE,
  has_patio BOOLEAN DEFAULT TRUE,
  has_parking BOOLEAN DEFAULT FALSE,

  -- Pricing
  price DECIMAL(15,2),
  price_per_sqm DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN surface_total_sqm > 0 THEN price / surface_total_sqm ELSE NULL END
  ) STORED,
  currency VARCHAR(3) DEFAULT 'MAD',
  is_negotiable BOOLEAN DEFAULT TRUE,

  -- Deal Pipeline
  deal_status deal_status DEFAULT 'prospect',
  deal_notes TEXT,
  rejection_reason TEXT,

  -- Media
  images TEXT[],

  -- Timestamps
  listed_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Active Status
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TRUST SCORE VIEW (The Intelligence Layer)
-- ============================================

CREATE VIEW property_intelligence AS
SELECT
  p.id,
  p.title,
  p.neighborhood,
  p.price,
  p.price_per_sqm,
  p.surface_total_sqm,
  p.deal_status,

  -- Legal Score (40% weight)
  COALESCE(l.ownership_score, 50) AS legal_score,
  l.ownership_type,
  l.heir_coordination_risk,
  l.vna_status,

  -- Structural Score (35% weight)
  COALESCE(s.shs_score, 50) AS structural_score,
  s.dampness_renovation_buffer,
  s.verticality_critical,

  -- Financial Score (25% weight)
  COALESCE(f.net_yield, 0) AS net_yield,
  f.payback_years,
  f.wc2030_appreciation_factor,

  -- TRUST SCORE (Composite)
  ROUND(
    (COALESCE(l.ownership_score, 50) * 0.40) +
    (COALESCE(s.shs_score, 50) * 0.35) +
    (LEAST(COALESCE(f.net_yield, 5) * 10, 100) * 0.25)
  ) AS trust_score,

  -- INTELLIGENCE FLAGS
  CASE
    WHEN p.neighborhood = 'Laksour' AND p.price_per_sqm < 18000
    THEN TRUE ELSE FALSE
  END AS flag_underpriced_arbitrage,

  CASE
    WHEN p.alley_width_m < 1.5
    THEN TRUE ELSE FALSE
  END AS flag_access_cost_buffer,

  CASE
    WHEN COALESCE(f.distance_to_infrastructure_m, 9999) < 500
    THEN TRUE ELSE FALSE
  END AS flag_wc2030_proximity,

  CASE
    WHEN l.heir_count > 5
    THEN TRUE ELSE FALSE
  END AS flag_heir_risk,

  CASE
    WHEN COALESCE(s.dampness_level, 5) > 7
    THEN TRUE ELSE FALSE
  END AS flag_dampness_critical,

  CASE
    WHEN l.ownership_type = 'melkia' AND p.price_per_sqm < 15000
    THEN TRUE ELSE FALSE
  END AS flag_titre_conversion_opportunity

FROM properties p
LEFT JOIN legal_profiles l ON l.property_id = p.id
LEFT JOIN structural_assessments s ON s.property_id = p.id
LEFT JOIN financial_analyses f ON f.property_id = p.id;

-- ============================================
-- NEIGHBORHOODS REFERENCE
-- ============================================

CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_ar VARCHAR(100),
  city VARCHAR(100) DEFAULT 'Marrakech',

  -- Location
  center_lat DECIMAL(10,7),
  center_lng DECIMAL(10,7),

  -- Classification
  tier VARCHAR(20) CHECK (tier IN ('premium', 'mid', 'budget', 'emerging')),
  medina BOOLEAN DEFAULT TRUE,

  -- Benchmarks
  avg_price_per_sqm DECIMAL(10,2),
  median_price_per_sqm DECIMAL(10,2),
  listing_count INTEGER DEFAULT 0,

  -- Investment Factors
  tourist_density VARCHAR(20), -- 'high', 'medium', 'low'
  renovation_difficulty VARCHAR(20), -- 'easy', 'moderate', 'difficult'
  access_rating INTEGER CHECK (access_rating >= 1 AND access_rating <= 5),

  -- World Cup 2030
  distance_to_stadium_m INTEGER,
  distance_to_train_m INTEGER,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Marrakech neighborhoods
INSERT INTO neighborhoods (name, center_lat, center_lng, tier, medina, tourist_density, access_rating) VALUES
('Laksour', 31.6295, -7.9811, 'premium', true, 'high', 3),
('Riad Zitoun', 31.6248, -7.9856, 'premium', true, 'high', 4),
('Mouassine', 31.6312, -7.9892, 'premium', true, 'high', 3),
('Kasbah', 31.6180, -7.9930, 'premium', true, 'high', 4),
('Mellah', 31.6210, -7.9820, 'mid', true, 'medium', 4),
('Kennaria', 31.6330, -7.9850, 'mid', true, 'medium', 3),
('Bab Doukkala', 31.6350, -7.9950, 'mid', true, 'medium', 5),
('Sidi Ben Slimane', 31.6380, -7.9780, 'mid', true, 'low', 3),
('Derb Dabachi', 31.6300, -7.9870, 'mid', true, 'medium', 3),
('Gueliz', 31.6380, -8.0100, 'premium', false, 'high', 5),
('Hivernage', 31.6220, -8.0150, 'premium', false, 'high', 5),
('Palmeraie', 31.6700, -7.9600, 'premium', false, 'medium', 5);

-- ============================================
-- SCRAPE LOG
-- ============================================

CREATE TABLE scrape_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source data_source NOT NULL,
  city VARCHAR(100),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_found INTEGER DEFAULT 0,
  new_listings INTEGER DEFAULT 0,
  updated_listings INTEGER DEFAULT 0,
  errors TEXT[],
  status VARCHAR(20) DEFAULT 'running'
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_deal_status ON properties(deal_status);
CREATE INDEX idx_properties_source ON properties(source);
CREATE INDEX idx_properties_active ON properties(is_active);
CREATE INDEX idx_legal_property ON legal_profiles(property_id);
CREATE INDEX idx_structural_property ON structural_assessments(property_id);
CREATE INDEX idx_financial_property ON financial_analyses(property_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER legal_updated_at BEFORE UPDATE ON legal_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER structural_updated_at BEFORE UPDATE ON structural_assessments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER financial_updated_at BEFORE UPDATE ON financial_analyses
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
