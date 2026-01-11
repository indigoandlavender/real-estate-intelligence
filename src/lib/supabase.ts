// ============================================
// TIFORT: Supabase Client Configuration
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types matching schema.sql
export interface DBProperty {
  id: string;
  source: 'mubawab' | 'avito' | 'field_audit' | 'manual' | 'agent' | 'owner_direct';
  source_id?: string;
  source_url?: string;
  title: string;
  description?: string;
  property_type: 'riad' | 'dar' | 'apartment' | 'villa' | 'terrain' | 'commerce' | 'other';
  transaction_type: 'sale' | 'rent';
  condition: 'new' | 'renovated' | 'habitable' | 'to_renovate' | 'ruin';
  city: string;
  neighborhood: string;
  address?: string;
  derb?: string;
  latitude?: number;
  longitude?: number;
  alley_width_m?: number;
  alley_labor_buffer?: number;
  distance_to_parking_m?: number;
  surface_total_sqm?: number;
  surface_habitable_sqm?: number;
  surface_terrain_sqm?: number;
  floors: number;
  bedrooms?: number;
  bathrooms?: number;
  suites?: number;
  has_pool: boolean;
  has_terrace: boolean;
  has_patio: boolean;
  has_parking: boolean;
  price: number;
  price_per_sqm?: number;
  currency: string;
  is_negotiable: boolean;
  deal_status: 'prospect' | 'contacted' | 'visiting' | 'negotiating' | 'due_diligence' | 'offer_made' | 'under_contract' | 'closed' | 'rejected' | 'lost';
  deal_notes?: string;
  rejection_reason?: string;
  images: string[];
  listed_at?: string;
  scraped_at: string;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface DBLegalProfile {
  id: string;
  property_id: string;
  ownership_type: 'titre_foncier' | 'melkia' | 'requisition' | 'unknown';
  titre_foncier_number?: string;
  melkia_reference?: string;
  heir_count: number;
  heir_coordination_risk?: boolean;
  heir_notes?: string;
  vna_status: boolean;
  vna_application_date?: string;
  vna_notes?: string;
  legal_chain_complete: boolean;
  chain_gap_years?: string;
  moulkia_scroll_notes?: string;
  has_active_dispute: boolean;
  dispute_details?: string;
  has_mortgage: boolean;
  mortgage_amount?: number;
  has_liens: boolean;
  ownership_score?: number;
  created_at: string;
  updated_at: string;
}

export interface DBStructuralAssessment {
  id: string;
  property_id: string;
  audit_date: string;
  auditor_name?: string;
  wall_composition: 'tabia' | 'brick' | 'reinforced_concrete' | 'mixed' | 'unknown';
  wall_thickness_cm?: number;
  wall_notes?: string;
  has_seismic_chaining: boolean;
  chainage_score?: number;
  porteur_score?: number;
  fissure_score?: number;
  seismic_notes?: string;
  dampness_level?: number;
  capillary_rise_height_cm?: number;
  dampness_renovation_buffer?: number;
  dampness_notes?: string;
  verticality_degrees?: number;
  verticality_critical?: boolean;
  foundation_depth_cm?: number;
  foundation_type?: string;
  tassement_score?: number;
  terrace_waterproof: boolean;
  terrace_score?: number;
  electrical_conformity: boolean;
  electrical_score?: number;
  water_pressure_score?: number;
  plumbing_age_years?: number;
  shs_score?: number;
  photo_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface DBFinancialAnalysis {
  id: string;
  property_id: string;
  analysis_date: string;
  asking_price: number;
  asking_price_per_sqm: number;
  currency: string;
  target_adr: number;
  target_occupancy_rate: number;
  suite_count: number;
  renovation_estimate_per_sqm: number;
  total_renovation_estimate: number;
  renovation_timeline_months: number;
  notary_fees_rate: number;
  registration_tax_rate: number;
  total_acquisition_cost: number;
  gross_annual_income: number;
  net_operating_income: number;
  gross_yield: number;
  net_yield: number;
  cash_on_cash_return: number;
  payback_years: number;
  exit_multiplier: number;
  projected_exit_value: number;
  titre_conversion_cost?: number;
  distance_to_infrastructure_m?: number;
  wc2030_appreciation_factor?: number;
  vat_rate: number;
  igt_rate: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Helper functions
export async function getProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as DBProperty[];
}

export async function getPropertyWithForensics(propertyId: string) {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      legal_profiles(*),
      structural_assessments(*),
      financial_analyses(*)
    `)
    .eq('id', propertyId)
    .single();

  if (error) throw error;
  return data;
}

export async function getPropertyIntelligence() {
  const { data, error } = await supabase
    .from('property_intelligence')
    .select('*');

  if (error) throw error;
  return data;
}

export async function upsertProperty(property: Partial<DBProperty>) {
  const { data, error } = await supabase
    .from('properties')
    .upsert(property)
    .select()
    .single();

  if (error) throw error;
  return data as DBProperty;
}

export async function upsertLegalProfile(legal: Partial<DBLegalProfile>) {
  const { data, error } = await supabase
    .from('legal_profiles')
    .upsert(legal)
    .select()
    .single();

  if (error) throw error;
  return data as DBLegalProfile;
}

export async function upsertStructuralAssessment(structural: Partial<DBStructuralAssessment>) {
  const { data, error } = await supabase
    .from('structural_assessments')
    .upsert(structural)
    .select()
    .single();

  if (error) throw error;
  return data as DBStructuralAssessment;
}

export async function upsertFinancialAnalysis(financial: Partial<DBFinancialAnalysis>) {
  const { data, error } = await supabase
    .from('financial_analyses')
    .upsert(financial)
    .select()
    .single();

  if (error) throw error;
  return data as DBFinancialAnalysis;
}
