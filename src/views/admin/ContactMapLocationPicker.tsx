"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react"
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet"
import { LoaderCircle, MapPin, Minus, Plus, Search, X } from "lucide-react"

type MapPoint = { lat: number; lng: number }
type GeocodeResult = {
  place_id: number
  lat: string
  lon: string
  display_name: string
  type?: string
  class?: string
}
type SearchState = "idle" | "loading" | "empty" | "error" | "limited"

const NOMINATIM_URL = "https://nominatim.openstreetmap.org"
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// This is only the initial map viewport, never a marker or a saved location.
const TOGO_VIEW_CENTER: MapPoint = { lat: 8.6, lng: 0.8 }
const TOGO_VIEW_ZOOM = 7
const GEOCODE_MIN_INTERVAL = 1100

class GeocoderError extends Error {
  constructor(readonly status: number) {
    super(`Geocoder returned ${status}`)
  }
}

// Serialize/cache end-user initiated requests so this browser session stays below Nominatim's public limit.
let geocodeQueue = Promise.resolve<unknown>(undefined)
let nextGeocodeRequestAt = 0
const geocodeCache = new Map<string, unknown>()

function requestGeocoder<T>(url: string, cacheKey: string): Promise<T> {
  const cached = geocodeCache.get(cacheKey)
  if (cached !== undefined) return Promise.resolve(cached as T)

  const request = geocodeQueue.then(async () => {
    const queuedCacheHit = geocodeCache.get(cacheKey)
    if (queuedCacheHit !== undefined) return queuedCacheHit as T

    const wait = Math.max(0, nextGeocodeRequestAt - Date.now())
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait))
    nextGeocodeRequestAt = Date.now() + GEOCODE_MIN_INTERVAL

    const response = await fetch(url, {
      headers: { "Accept-Language": "fr" },
      referrerPolicy: "strict-origin-when-cross-origin",
    })
    if (!response.ok) throw new GeocoderError(response.status)
    const value = (await response.json()) as T
    if (geocodeCache.size >= 100) geocodeCache.clear()
    geocodeCache.set(cacheKey, value)
    return value
  })
  geocodeQueue = request.then(() => undefined, () => undefined)
  return request
}

function validPoint(lat: string, lng: string): MapPoint | null {
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (
    lat.trim() === "" ||
    lng.trim() === "" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null
  }
  return { lat: latitude, lng: longitude }
}

function zoomForResult(result: GeocodeResult) {
  const type = result.type ?? result.class
  if (type === "city" || type === "administrative") return 14
  if (type === "town") return 15
  if (type === "village" || type === "hamlet") return 16
  return 17
}

function makeMarkerIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    className: "aptic-contact-map-marker",
    html: '<span class="aptic-contact-map-marker__pin"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5.25-8 12-8 12S4 15.25 4 10a8 8 0 1 1 16 0Z" fill="#003366" stroke="white" stroke-width="1.5"/><circle cx="12" cy="10" r="2.5" fill="white"/></svg></span>',
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    tooltipAnchor: [0, -42],
  })
}

export default function ContactMapLocationPicker({
  latitude,
  longitude,
  zoom,
  onClose,
  onConfirm,
}: {
  latitude: string
  longitude: string
  zoom: string
  onClose: () => void
  onConfirm: (point: MapPoint, locationName?: string) => void
}) {
  const initialPosition = validPoint(latitude, longitude)
  const [position, setPosition] = useState<MapPoint | null>(initialPosition)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [searchState, setSearchState] = useState<SearchState>("idle")
  const [selectedAddress, setSelectedAddress] = useState("")
  const [positionNameDraft, setPositionNameDraft] = useState<string | null>(null)
  const [positionChanged, setPositionChanged] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState("")
  const [tileError, setTileError] = useState(false)
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const leafletRef = useRef<typeof import("leaflet") | null>(null)
  const addressRequestId = useRef(0)
  const searchRequestId = useRef(0)
  const mapClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lookupAddress = useCallback(async (point: MapPoint, updateNameDraft = false) => {
    const requestId = ++addressRequestId.current
    setAddressLoading(true)
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(point.lat),
      lon: String(point.lng),
      zoom: "18",
      addressdetails: "1",
    })
    try {
      const result = await requestGeocoder<GeocodeResult>(
        `${NOMINATIM_URL}/reverse?${params}`,
        `reverse:${point.lat.toFixed(6)},${point.lng.toFixed(6)}`,
      )
      if (requestId !== addressRequestId.current) return
      const resolvedName = result.display_name?.trim() || ""
      setSelectedAddress(resolvedName || "Lieu sélectionné")
      if (updateNameDraft) setPositionNameDraft(resolvedName || null)
    } catch {
      if (requestId !== addressRequestId.current) return
      // A reverse-geocoding failure must never prevent saving the selected coordinates.
      setSelectedAddress("Lieu sélectionné")
      if (updateNameDraft) setPositionNameDraft(null)
    } finally {
      if (requestId === addressRequestId.current) setAddressLoading(false)
    }
  }, [])

  const updateMarkerPosition = useCallback(
    (point: MapPoint, address = "") => {
      setPosition(point)
      setSelectedAddress(address)
      setAddressLoading(false)
      if (markerRef.current) markerRef.current.setLatLng([point.lat, point.lng])
    },
    [],
  )

  const attachMarkerEvents = useCallback(
    (marker: LeafletMarker) => {
      marker.on("drag", () => {
        const point = marker.getLatLng()
        addressRequestId.current += 1
        setPositionChanged(true)
        setPositionNameDraft(null)
        setPosition({ lat: point.lat, lng: point.lng })
        setSelectedAddress("")
        setAddressLoading(false)
      })
      marker.on("dragend", () => {
        const point = marker.getLatLng()
        void lookupAddress({ lat: point.lat, lng: point.lng }, true)
      })
    },
    [lookupAddress],
  )

  useEffect(() => {
    let cancelled = false
    let resizeObserver: ResizeObserver | undefined

    const initializeMap = async () => {
      try {
        const L = await import("leaflet")
        if (cancelled || !mapElement.current) return
        leafletRef.current = L

        const existingZoom = Number(zoom)
        const initialZoom = initialPosition
          ? Number.isFinite(existingZoom) && existingZoom >= 13 && existingZoom <= 19
            ? Math.round(existingZoom)
            : 15
          : TOGO_VIEW_ZOOM
        const initialCenter = initialPosition ?? TOGO_VIEW_CENTER
        const map = L.map(mapElement.current, {
          center: [initialCenter.lat, initialCenter.lng],
          zoom: initialZoom,
          minZoom: 2,
          maxZoom: 19,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true,
          touchZoom: true,
        })
        mapRef.current = map
        setMapReady(true)

        const tileLayer = L.tileLayer(OSM_TILE_URL, {
          maxZoom: 19,
          subdomains: "abc",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
          crossOrigin: true,
        })
        let failedTiles = 0
        tileLayer.on("tileerror", () => {
          failedTiles += 1
          setTileError(true)
        })
        tileLayer.on("tileload", () => {
          if (failedTiles === 0) setTileError(false)
        })
        tileLayer.addTo(map)

        L.control.attribution({ prefix: false, position: "bottomright" }).addTo(map)

        const markerIcon = makeMarkerIcon(L)
        const addMarker = (point: MapPoint) => {
          const marker = L.marker([point.lat, point.lng], {
            icon: markerIcon,
            draggable: true,
            keyboard: true,
            title: "Position sélectionnée — déplacer le marqueur",
            alt: "Marqueur de localisation déplaçable",
            autoPan: true,
          }).addTo(map)
          markerRef.current = marker
          attachMarkerEvents(marker)
        }

        if (initialPosition) addMarker(initialPosition)

        map.on("click", (event) => {
          const point = { lat: event.latlng.lat, lng: event.latlng.lng }
          if (mapClickTimer.current) clearTimeout(mapClickTimer.current)
          mapClickTimer.current = setTimeout(() => {
            addressRequestId.current += 1
            setPositionChanged(true)
            setPositionNameDraft(null)
            updateMarkerPosition(point)
            if (!markerRef.current) addMarker(point)
            void lookupAddress(point, true)
            mapClickTimer.current = null
          }, 240)
        })
        map.on("dblclick", () => {
          if (mapClickTimer.current) clearTimeout(mapClickTimer.current)
          mapClickTimer.current = null
        })

        resizeObserver = new ResizeObserver(() => map.invalidateSize({ pan: false }))
        resizeObserver.observe(mapElement.current)
        requestAnimationFrame(() => map.invalidateSize({ pan: false }))

        if (initialPosition) void lookupAddress(initialPosition)
      } catch {
        if (!cancelled) {
          setMapError("La carte n’a pas pu être chargée. Vérifiez votre connexion puis réessayez.")
        }
      }
    }

    void initializeMap()
    return () => {
      cancelled = true
      if (mapClickTimer.current) clearTimeout(mapClickTimer.current)
      resizeObserver?.disconnect()
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
      leafletRef.current = null
    }
    // Map setup is intentionally done once for this modal instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const searchPlaces = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const searchTerm = query.trim()
    if (!searchTerm || searchState === "loading") return
    const requestId = ++searchRequestId.current
    setSearchState("loading")
    setResults([])
    const params = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      limit: "5",
      countrycodes: "tg",
      q: searchTerm,
    })

    try {
      const found = await requestGeocoder<GeocodeResult[]>(
        `${NOMINATIM_URL}/search?${params}`,
        `search:${searchTerm.toLocaleLowerCase("fr")}`,
      )
      if (requestId !== searchRequestId.current) return
      setResults(found)
      setSearchState(found.length ? "idle" : "empty")
    } catch (error) {
      if (requestId !== searchRequestId.current) return
      setSearchState(error instanceof GeocoderError && error.status === 429 ? "limited" : "error")
    }
  }

  const selectResult = (result: GeocodeResult) => {
    const point = { lat: Number(result.lat), lng: Number(result.lon) }
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return
    addressRequestId.current += 1
    setPositionChanged(true)
    setPositionNameDraft(result.display_name?.trim() || null)
    updateMarkerPosition(point, result.display_name)
    setResults([])
    setQuery(result.display_name)
    setSearchState("idle")

    const map = mapRef.current
    const L = leafletRef.current
    if (!map || !L) return
    map.setView([point.lat, point.lng], zoomForResult(result), { animate: true })
    if (!markerRef.current) {
      const marker = L.marker([point.lat, point.lng], {
        icon: makeMarkerIcon(L),
        draggable: true,
        keyboard: true,
        title: "Position sélectionnée — déplacer le marqueur",
        alt: "Marqueur de localisation déplaçable",
        autoPan: true,
      }).addTo(map)
      markerRef.current = marker
      attachMarkerEvents(marker)
    }
    markerRef.current.setLatLng([point.lat, point.lng])
  }

  const recenterOnMarker = () => {
    if (!position || !mapRef.current) return
    mapRef.current.panTo([position.lat, position.lng], { animate: true })
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-2 sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="flex h-[96dvh] max-h-[96dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-map-picker-title"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-4 py-3 sm:px-6">
          <div>
            <h2 id="contact-map-picker-title" className="text-base font-bold text-slate-900">
              Positionner le lieu sur la carte
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Recherchez un lieu ou déplacez le marqueur pour définir précisément la position.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="relative z-30 shrink-0 border-b border-slate-100 bg-white p-3 sm:px-5">
          <form onSubmit={searchPlaces} className="flex gap-2">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setResults([])
                  searchRequestId.current += 1
                  setSearchState("idle")
                }}
                placeholder="Rechercher une ville, une adresse ou un lieu..."
                aria-label="Rechercher une ville, une adresse ou un lieu"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15"
              />
            </label>
            <button
              type="submit"
              disabled={!query.trim() || searchState === "loading"}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#003366] px-4 text-sm font-semibold text-white hover:bg-[#00264d] disabled:opacity-60"
            >
              {searchState === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="hidden sm:inline">Rechercher</span>
            </button>
          </form>
          {results.length > 0 && (
            <div className="absolute left-3 right-3 top-[calc(100%-4px)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:left-5 sm:right-5">
              {results.map((result) => (
                <button
                  type="button"
                  key={result.place_id}
                  onClick={() => selectResult(result)}
                  className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#003366]" />
                  <span className="text-sm text-slate-700">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}
          {searchState === "empty" && (
            <p className="px-1 pt-2 text-xs text-slate-500">Aucun lieu trouvé pour cette recherche.</p>
          )}
          {searchState === "limited" && (
            <p className="px-1 pt-2 text-xs text-amber-700">
              Le service de recherche est temporairement limité. Vous pouvez déplacer le marqueur manuellement.
            </p>
          )}
          {searchState === "error" && (
            <p className="px-1 pt-2 text-xs text-red-600">
              Le service de recherche est temporairement indisponible. Vous pouvez déplacer le marqueur manuellement.
            </p>
          )}
        </div>

        <div className="relative min-h-[220px] flex-1 bg-slate-100 sm:min-h-[360px]">
          <div ref={mapElement} className="aptic-contact-map h-full min-h-[220px] w-full sm:min-h-[360px]" />
          {mapError && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-slate-100/95 p-6 text-center text-sm text-red-700">
              {mapError}
            </div>
          )}
          {tileError && !mapError && (
            <p className="absolute left-3 top-3 z-[500] max-w-sm rounded-lg bg-white/95 px-3 py-2 text-xs text-amber-800 shadow">
              Certaines tuiles OpenStreetMap n’ont pas pu charger. Vérifiez votre connexion.
            </p>
          )}
          {!mapReady && !mapError && (
            <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center bg-slate-100/70 text-sm text-slate-600">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Chargement de la carte…
            </div>
          )}
          {position && (
            <button
              type="button"
              onClick={recenterOnMarker}
              className="absolute bottom-8 left-3 z-[500] inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-md hover:bg-slate-50"
            >
              <MapPin className="h-4 w-4 text-[#003366]" />
              Recentrer sur le marqueur
            </button>
          )}
          <div className="absolute right-3 top-3 z-[500] flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
            <button
              type="button"
              onClick={() => mapRef.current?.zoomIn()}
              aria-label="Zoom avant"
              className="h-10 w-10 text-slate-700 hover:bg-slate-50"
            >
              <Plus className="mx-auto h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => mapRef.current?.zoomOut()}
              aria-label="Zoom arrière"
              className="h-10 w-10 border-t border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Minus className="mx-auto h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Position sélectionnée</p>
          <p className="mt-1 min-h-5 truncate text-sm text-slate-800">
            {!position
              ? "Aucun lieu sélectionné"
              : addressLoading
                ? "Recherche de l’adresse…"
                : selectedAddress || "Lieu sélectionné"}
          </p>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!position}
            onClick={() =>
              position &&
              onConfirm(
                position,
                positionChanged ? positionNameDraft ?? "" : undefined,
              )
            }
            className="rounded-xl bg-[#003366] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#00264d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirmer la position
          </button>
        </footer>
      </section>
    </div>
  )
}
