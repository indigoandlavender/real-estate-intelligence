// TIFORT API - Scrape Endpoint
// Disabled until Supabase is connected

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'Scraping is disabled. Connect Supabase to enable.',
    instructions: [
      '1. Create a Supabase project',
      '2. Run the schema.sql in Supabase SQL editor',
      '3. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel',
    ],
  }, { status: 503 });
}

export async function GET() {
  return NextResponse.json({
    message: 'TIFORT Scrape API',
    status: 'Disabled - Connect Supabase to enable',
    usage: 'POST with { source, city, propertyType, maxPages }',
    sources: ['mubawab', 'avito', 'all'],
  });
}
