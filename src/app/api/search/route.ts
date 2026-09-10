import { count, sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { entityTable } from '@/lib/db/schema'
import { GoogleSearchResponse, SearchDisplayType } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || ''
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    // "page" tells us which chunk of results to send back.
    // If the frontend doesn't send one (e.g. first load), we default to page 1.
    const page = Number(searchParams.get('page')) || 1
    const PAGE_SIZE = 12 // how many DB results per page — pick any number that looks good in the grid
    // How many rows to skip before we start collecting results.
    // e.g. page 1 → skip 0, page 2 → skip 12, page 3 → skip 24 (with PAGE_SIZE = 12)
    const offset = (page - 1) * PAGE_SIZE
    let totalMatches = 0 // default: assume no matches, until we actually check
    const apiKey = process.env.BACKEND_GOOGLE_MAPS_API_KEY
    // If the frontend already clicked "Next" once, it will send back the token
    // Google gave us last time. If this is missing, it means "give me page 1."
    const googlePageToken = searchParams.get('googlePageToken')

    // If the frontend is only paging the DB list (via Previous/Next),
    // it sets dbOnly=true — meaning "don't bother calling Google at all this time."
    const dbOnly = searchParams.get('dbOnly') === 'true'

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 500 })
    }

    // IMPORTANT beginner concept: when you have a page token, Google wants
    // ONLY the token + key — no query text, no location. Google already
    // remembers what you searched for and where, tied to that token.
    // Sending query/location again alongside a token actually confuses the request.
    let formattedGoogleResponse: SearchDisplayType[] = []
    let googleResponse: {
      status?: string
      results?: GoogleSearchResponse[]
      next_page_token?: string
    } = {}

    if (!dbOnly) {
      let url: string
      if (googlePageToken) {
        url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${encodeURIComponent(googlePageToken)}&key=${apiKey}`
      } else {
        url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
        if (latitude && longitude) {
          url += `&location=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}&radius=5000`
        }
      }

      async function fetchGooglePlaces(requestUrl: string) {
        const res = await fetch(requestUrl)
        const json = await res.json()
        return { res, json }
      }

      let { res: response, json: json1 } = await fetchGooglePlaces(url)
      googleResponse = json1

      if (googlePageToken && googleResponse.status === 'INVALID_REQUEST') {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const retry = await fetchGooglePlaces(url)
        response = retry.res
        googleResponse = retry.json
      }

      if (!response.ok) {
        return NextResponse.json(
          {
            error:
              '[api/search GET] error: Failed to fetch data from Google Places API',
          },
          { status: response.status },
        )
      }

      formattedGoogleResponse = (googleResponse.results ?? []).map(
        (place: GoogleSearchResponse) => ({
          googleId: place.place_id,
          name: place.name,
          address: place.formatted_address,
          type: place.types[0],
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        }),
      )
    }

    const formattedQuery = query.replace(/\s+/g, ' & ') + ':*'
    let formattedDbResponse: SearchDisplayType[] = []
    const dbCount = await db.select({ count: count() }).from(entityTable)
    if (dbCount[0].count !== 0) {
      const searchDbQuery = sql`(
        setweight(to_tsvector('english', ${entityTable.name}), 'A') ||
        setweight(to_tsvector('english', ${entityTable.city}), 'A') ||
        setweight(to_tsvector('english', ${entityTable.state || ''}), 'A') ||
        setweight(to_tsvector('english', ${entityTable.displayType}), 'A') ||
        setweight(to_tsvector('english', ${entityTable.type}), 'B') ||
        setweight(to_tsvector('english', ${entityTable.description || ''}), 'B')

        @@ to_tsquery('english', ${formattedQuery})
      )`

      const dbResponse = await db
        .select()
        .from(entityTable)
        .where(searchDbQuery)
        .limit(PAGE_SIZE) // <-- only grab this many rows
        .offset(offset) // <-- ...after skipping this many

      // We ALSO need to know the total number of matches (not just this page's worth),
      // so the frontend can tell whether a "Next" page actually exists.
      // Same filter (searchDbQuery), but counting rows instead of fetching them.
      const [{ count: matchCount }] = await db
        .select({ count: count() })
        .from(entityTable)
        .where(searchDbQuery)
      totalMatches = matchCount // assign to the outer variable, don't redeclare it

      formattedDbResponse = dbResponse.map((place) => ({
        id: place.id,
        googleId: place.googleId,
        name: place.name,
        address: `${place.address1} ${place.address2 || ''}, ${place.city}, ${place.state}, ${place.zip}`,
        type: place.displayType,
        lat: Number(place.lat),
        lng: Number(place.lon),
        aiScore: place.aiScore || 0,
      }))
    }

    const dbIds = new Set(formattedDbResponse.map((place) => place.googleId))
    const filteredGoogleResponse = formattedGoogleResponse.filter(
      (place) => !dbIds.has(place.googleId),
    )
    const combinedResponse = [
      {
        loc: 'database',
        data: formattedDbResponse,
        // true if there are still more matching rows after this page
        hasMore: offset + formattedDbResponse.length < totalMatches,
        // Exact number of DB result pages
        totalPages: Math.ceil(totalMatches / PAGE_SIZE),
      },
      {
        loc: 'google',
        data: filteredGoogleResponse,
        // If Google gave us a token for more results, pass it along.
        // If there's nothing left, Google won't include this field, so we default to null —
        // the frontend will use "is this null?" to decide whether to show a "Next" button.
        nextPageToken: googleResponse.next_page_token || null,
      },
    ]
    return NextResponse.json(combinedResponse, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: `[api/search GET] error: ${error}` })
  }
}
