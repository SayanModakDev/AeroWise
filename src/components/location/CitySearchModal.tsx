'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  X,
  Navigation,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { GeoLocation } from '@/types/air-quality';
import { POPULAR_CITIES, searchCities } from '@/lib/air-quality/open-meteo';

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: GeoLocation) => void;
  currentLocation: GeoLocation;
}

export function CitySearchModal({
  isOpen,
  onClose,
  onSelectLocation,
  currentLocation,
}: CitySearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const cities = await searchCities(query);
        setResults(cities);
        if (cities.length === 0) {
          setError('No matching cities found. Try another search query.');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to search cities. Please check your network connection.'
        );
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle explicit Geolocation request
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser geolocation is not supported by your current browser.');
      return;
    }

    setIsDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected: GeoLocation = {
          id: Date.now(),
          name: 'Your Current Location',
          latitude: Number(position.coords.latitude.toFixed(4)),
          longitude: Number(position.coords.longitude.toFixed(4)),
          country: 'Local Device',
          countryCode: 'GPS',
          timezone: 'auto',
        };
        setIsDetectingLocation(false);
        onSelectLocation(detected);
        onClose();
      },
      (geoErr) => {
        setIsDetectingLocation(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setError('Location permission was denied. Please select a city manually below.');
        } else {
          setError('Could not determine your GPS location. Please choose a city manually.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-search-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h2 id="city-search-title" className="text-lg font-semibold text-slate-900">
              Select City
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input & GPS button */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city name (e.g., Delhi, London)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-900"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 text-teal-600 animate-spin absolute right-3.5 top-3" />
            )}
          </div>

          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs sm:text-sm font-medium border border-teal-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDetectingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>
              {isDetectingLocation ? 'Determining GPS coordinates...' : 'Detect my current location (Browser GPS)'}
            </span>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 text-rose-800 rounded-xl text-xs border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {results.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Search Results
              </p>
              <div className="space-y-1">
                {results.map((city) => (
                  <button
                    key={`${city.id}-${city.latitude}`}
                    onClick={() => {
                      onSelectLocation(city);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-center justify-between border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-900">
                        {city.name}
                      </span>
                      {city.admin1 && (
                        <span className="text-xs text-slate-500 ml-1.5">
                          {city.admin1}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-400 ml-2">
                        {city.country}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : query.trim().length === 0 ? (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Popular Cities (India)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {POPULAR_CITIES.map((city) => {
                  const isCurrent = city.name === currentLocation.name;
                  return (
                    <button
                      key={city.name}
                      onClick={() => {
                        onSelectLocation(city);
                        onClose();
                      }}
                      className={`text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-teal-50 border-teal-300 text-teal-900'
                          : 'bg-white border-slate-200 hover:border-teal-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="font-semibold">{city.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {city.admin1}, {city.country}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
