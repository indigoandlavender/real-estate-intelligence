// TIFORT API - Scrape Endpoint
// Triggers scraping of Mubawab and Avito

import { NextRequest, NextResponse } from 'next/server';
import { scrapeMubawabListings } from '@/lib/scrapers/mubawab';
import { scrapeAvitoListings } from '@/lib/scrapers/avito';
import { addListings, addScrapeLog, updateScrapeLog } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      source = 'all', // 'mubawab', 'avito', or 'all'
      city = 'marrakech',
      propertyType = 'riads',
      maxPages = 3,
    } = body;

    const logId = `scrape_${Date.now()}`;
    const results: {
      source: string;
      found: number;
      added: number;
      updated: number;
      errors: string[];
    }[] = [];

    // Start log
    addScrapeLog({
      id: logId,
      source,
      city,
      startedAt: new Date(),
      totalFound: 0,
      newListings: 0,
      updatedListings: 0,
      errors: [],
      status: 'running',
    });

    // Scrape Mubawab
    if (source === 'all' || source === 'mubawab') {
      console.log(`[API] Starting Mubawab scrape for ${city}/${propertyType}`);

      const mubawabResult = await scrapeMubawabListings(city, propertyType, maxPages);
      const { added, updated } = addListings(mubawabResult.listings);

      results.push({
        source: 'mubawab',
        found: mubawabResult.totalFound,
        added,
        updated,
        errors: mubawabResult.errors,
      });

      console.log(`[API] Mubawab: Found ${mubawabResult.totalFound}, Added ${added}, Updated ${updated}`);
    }

    // Scrape Avito
    if (source === 'all' || source === 'avito') {
      console.log(`[API] Starting Avito scrape for ${city}`);

      const avitoResult = await scrapeAvitoListings(city, 'immobilier', maxPages);
      const { added, updated } = addListings(avitoResult.listings);

      results.push({
        source: 'avito',
        found: avitoResult.totalFound,
        added,
        updated,
        errors: avitoResult.errors,
      });

      console.log(`[API] Avito: Found ${avitoResult.totalFound}, Added ${added}, Updated ${updated}`);
    }

    // Calculate totals
    const totalFound = results.reduce((sum, r) => sum + r.found, 0);
    const totalAdded = results.reduce((sum, r) => sum + r.added, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);
    const allErrors = results.flatMap(r => r.errors);

    // Update log
    updateScrapeLog(logId, {
      completedAt: new Date(),
      totalFound,
      newListings: totalAdded,
      updatedListings: totalUpdated,
      errors: allErrors,
      status: 'completed',
    });

    return NextResponse.json({
      success: true,
      logId,
      summary: {
        totalFound,
        newListings: totalAdded,
        updatedListings: totalUpdated,
        errorCount: allErrors.length,
      },
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[API] Scrape error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Scraping failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'TIFORT Scrape API',
    usage: 'POST with { source, city, propertyType, maxPages }',
    sources: ['mubawab', 'avito', 'all'],
    defaultCity: 'marrakech',
  });
}
