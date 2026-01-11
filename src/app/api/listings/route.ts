// TIFORT API - Listings Endpoint
// Disabled until Supabase is connected

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Listings API ready. Connect Supabase for data.',
    total: 0,
    listings: [],
    instructions: [
      '1. Create a Supabase project',
      '2. Run the schema.sql in Supabase SQL editor',
      '3. Add environment variables to Vercel',
    ],
  });
}

export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'Connect Supabase to enable listings management.',
  }, { status: 503 });
}
