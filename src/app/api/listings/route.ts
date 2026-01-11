// TIFORT API - Listings Endpoint
// Get and manage property listings

import { NextRequest, NextResponse } from 'next/server';
import { getListings, getListingsByCity, calculateMarketStats, getScrapeLog } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const neighborhood = searchParams.get('neighborhood');
    const propertyType = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const source = searchParams.get('source');
    const includeStats = searchParams.get('stats') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get all listings
    let listings = city ? getListingsByCity(city) : getListings();

    // Apply filters
    if (neighborhood) {
      listings = listings.filter(l =>
        l.neighborhood.toLowerCase().includes(neighborhood.toLowerCase())
      );
    }

    if (propertyType) {
      listings = listings.filter(l => l.propertyType === propertyType);
    }

    if (minPrice) {
      listings = listings.filter(l => l.price >= parseInt(minPrice));
    }

    if (maxPrice) {
      listings = listings.filter(l => l.price <= parseInt(maxPrice));
    }

    if (source) {
      listings = listings.filter(l => l.source === source);
    }

    // Only active listings by default
    listings = listings.filter(l => l.isActive);

    // Sort by most recent
    listings.sort((a, b) =>
      new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime()
    );

    // Pagination
    const total = listings.length;
    const paginatedListings = listings.slice(offset, offset + limit);

    // Build response
    const response: Record<string, unknown> = {
      success: true,
      total,
      count: paginatedListings.length,
      offset,
      limit,
      listings: paginatedListings,
    };

    // Include market stats if requested
    if (includeStats && city) {
      response.stats = calculateMarketStats(city);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('[API] Listings error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch listings',
      },
      { status: 500 }
    );
  }
}

// Get stats endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, city = 'marrakech' } = body;

    if (action === 'stats') {
      const stats = calculateMarketStats(city);
      return NextResponse.json({ success: true, stats });
    }

    if (action === 'logs') {
      const logs = getScrapeLog();
      return NextResponse.json({ success: true, logs });
    }

    if (action === 'summary') {
      const listings = getListings();
      const cities = [...new Set(listings.map(l => l.city))];
      const sources = [...new Set(listings.map(l => l.source))];
      const types = [...new Set(listings.map(l => l.propertyType))];

      return NextResponse.json({
        success: true,
        summary: {
          totalListings: listings.length,
          activeListings: listings.filter(l => l.isActive).length,
          cities,
          sources,
          propertyTypes: types,
          lastScraped: listings.length > 0
            ? listings.reduce((latest, l) =>
              new Date(l.scrapedAt) > new Date(latest.scrapedAt) ? l : latest
            ).scrapedAt
            : null,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('[API] Action error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Action failed',
      },
      { status: 500 }
    );
  }
}
