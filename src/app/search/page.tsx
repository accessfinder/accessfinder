'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import MapComponent from '@/components/map'
import Location from '@/components/search/location'
import SearchDisplay from '@/components/search/search-display'
import SearchSkeleton from '@/components/skeletons/search-skeleton'
import { useLocation } from '@/contexts/location-context'
import type { PointOfInterest, SearchDisplayProps } from '@/lib/types'

function SearchResults() {
  const [googleResponse, setGoogleResponse] = useState<SearchDisplayProps[]>([])
  const [dbResponse, setDbResponse] = useState<SearchDisplayProps[]>([])
  const [isLoading, setIsLoading] = useState(false)
  // Which DB page we're currently showing (starts at 1)
  const [dbPage, setDbPage] = useState(1)
  // Total DB pages returned by the API
  const [dbTotalPages, setDbTotalPages] = useState(1)

  // The token Google gave us to fetch its NEXT batch of results.
  // null means "no more Google results" (or we haven't searched yet).
  const [googleNextToken, setGoogleNextToken] = useState<string | null>(null)
  // A separate loading flag just for the "Load More" button,
  // so clicking it doesn't trigger the big full-page skeleton loader.
  const [isLoadingMoreGoogle, setIsLoadingMoreGoogle] = useState(false)
  const searchParams = useSearchParams()
  const query = searchParams.get('query')
  const { latitude, longitude, isLocationChecked } = useLocation()
  const [locations, setLocations] = useState<PointOfInterest[]>([])

  useEffect(() => {
    if (!query || !isLocationChecked) {
      return
    }

    setIsLoading(true)

    const params = new URLSearchParams({ query, page: '1' })
    if (latitude !== null && longitude !== null) {
      params.append('latitude', latitude.toString())
      params.append('longitude', longitude.toString())
    }

    fetch(`/api/search/?${params.toString()}`)
      .then((response) => {
        if (!response.ok) {
          console.error(`[search] error calling /api/search`)
        }
        return response.json()
      })
      .then((data) => {
        setGoogleResponse(data[1].data)
        setDbResponse(data[0].data)
        // Fresh search — reset paging trackers for BOTH lists back to "page 1"
        setDbPage(1)
        setDbTotalPages(data[0].totalPages)
        setGoogleNextToken(data[1].nextPageToken ?? null)

        const tempLocations: PointOfInterest[] = [
          ...data[0].data.map(
            (place: {
              name: string
              address: string
              lat: number
              lng: number
            }) => ({
              key: place.address,
              name: place.name,
              address: place.address,
              location: { lat: place.lat, lng: place.lng },
            }),
          ),
          ...data[1].data.map(
            (place: {
              name: string
              address: string
              lat: number
              lng: number
            }) => ({
              key: place.name,
              name: place.name,
              address: place.address,
              location: { lat: place.lat, lng: place.lng },
            }),
          ),
        ]
        setLocations(tempLocations)
      })
      .catch((error) => {
        console.error(`[search] error ${error}`)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [query, latitude, longitude, isLocationChecked])

  function goToDbPage(newPage: number) {
    if (!query) return

    setDbPage(newPage)

    const params = new URLSearchParams({
      query,
      page: newPage.toString(),
      dbOnly: 'true',
    })
    if (latitude !== null && longitude !== null) {
      params.append('latitude', latitude.toString())
      params.append('longitude', longitude.toString())
    }

    fetch(`/api/search/?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        // We ONLY touch the database part here.
        // (This request also re-fetches Google's first page in the background,
        // as a side effect of the two being one shared API route — we simply
        // ignore that part so we don't disturb the Google list on screen.)
        setDbResponse(data[0].data)
        setDbTotalPages(data[0].totalPages)
      })
      .catch((error) =>
        console.error(`[search] error changing DB page: ${error}`),
      )
  }

  function loadMoreGoogleResults() {
    if (!query || !googleNextToken) return

    setIsLoadingMoreGoogle(true)

    const params = new URLSearchParams({
      query,
      googlePageToken: googleNextToken,
    })

    fetch(`/api/search/?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        // APPEND new results to the existing list, don't replace it —
        // this is the natural pattern for token/cursor pagination:
        // you're extending one continuous list, not jumping to a numbered page.
        setGoogleResponse((prev) => [...prev, ...data[1].data])
        setGoogleNextToken(data[1].nextPageToken ?? null)
      })
      .catch((error) =>
        console.error(`[search] error loading more Google results: ${error}`),
      )
      .finally(() => setIsLoadingMoreGoogle(false))
  }

  return (
    <div>
      <Location />

      {isLoading ? (
        <SearchSkeleton />
      ) : (
        <div>
          {/* Compact map for small screens, shown above results */}
          <div className="mt-6 lg:hidden">
            <MapComponent locations={locations} compact />
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <h2 className="mt-8 mb-4">Catalogued Results</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dbResponse.map((place) => (
                  <SearchDisplay
                    displayType="db"
                    key={place.googleId + place.address}
                    id={place.id}
                    googleId={place.googleId}
                    name={place.name}
                    type={place.type}
                    address={place.address}
                    aiScore={place.aiScore || 0}
                  />
                ))}
              </div>

              {/* Pagination controls */}
              <div className="mt-6 flex items-center justify-center gap-2">
                {/* Current page */}
                <span className="mr-3 font-medium text-sm text-white">
                  Page {dbPage} of {dbTotalPages}
                </span>

                {/* First page */}
                <button
                  onClick={() => goToDbPage(1)}
                  disabled={dbPage === 1}
                  aria-label="First page"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/2 text-lg text-white transition-all duration-200 hover:cursor-pointer hover:border-white/20 hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  «
                </button>

                {/* Previous page */}
                <button
                  onClick={() => goToDbPage(dbPage - 1)}
                  disabled={dbPage === 1}
                  aria-label="Previous page"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/2 text-lg text-white transition-all duration-200 hover:cursor-pointer hover:border-white/20 hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ‹
                </button>

                {/* Next page */}
                <button
                  onClick={() => goToDbPage(dbPage + 1)}
                  disabled={dbPage >= dbTotalPages}
                  aria-label="Next page"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/2 text-lg text-white transition-all duration-200 hover:cursor-pointer hover:border-white/20 hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ›
                </button>

                {/* Last page */}
                <button
                  onClick={() => goToDbPage(dbTotalPages)}
                  disabled={dbPage >= dbTotalPages}
                  aria-label="Last page"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/2 text-lg text-white transition-all duration-200 hover:cursor-pointer hover:border-white/20 hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  »
                </button>
              </div>

              <h2 className="mt-8 mb-4">All Results</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {googleResponse.map((place) => (
                  <SearchDisplay
                    displayType="google"
                    key={place.googleId + place.address}
                    googleId={place.googleId}
                    name={place.name}
                    type={place.type}
                    address={place.address}
                    aiScore={0}
                  />
                ))}
              </div>

              {googleNextToken && (
                <button
                  onClick={loadMoreGoogleResults}
                  disabled={isLoadingMoreGoogle}
                  className="mt-4 rounded border px-3 py-1 disabled:opacity-40"
                >
                  {isLoadingMoreGoogle ? 'Loading…' : 'Load More'}
                </button>
              )}
            </div>

            {/* Sidebar map for large screens */}
            <div className="sticky top-4 hidden h-fit lg:block">
              <MapComponent locations={locations} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  )
}
