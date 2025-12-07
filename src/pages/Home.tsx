import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_LOCATIONS, GET_CHARACTERS_INFO } from '@/lib/graphql/queries';
import { config } from '@/lib/config';

interface SearchResult {
  id: number;
  name: string;
  type: 'character' | 'location';
  status?: string;
  species?: string;
  image?: string;
  location?: string;
  dimension?: string;
  distance: number;
}

export default function Home() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { loading, error, data } = useQuery(GET_LOCATIONS, {
    variables: { page },
  });
  const { loading: loadingCharacters } = useQuery(GET_CHARACTERS_INFO);

  // Perform semantic search for autosuggest
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setShowSuggestions(false);
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(`${config.backendUrl}/api/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: searchQuery, limit: 8 }), // Limit to 8 for suggestions
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const result = await response.json();
        setSearchResults(result.results || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error performing search:', err);
        setSearchResults([]);
        setShowSuggestions(false);
      } finally {
        setSearchLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (loading || loadingCharacters) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rick-green mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading the multiverse...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-2">Error loading data</p>
          <p className="text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  const locations = data?.locations?.results || [];
  const info = data?.locations?.info;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            Rick & Morty Universe
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Explore the Multiverse
          </p>
          
          {/* Search Bar with Autosuggest */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative" ref={searchContainerRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                onBlur={(e) => {
                  // Check if the blur is caused by clicking inside the suggestions dropdown
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (searchContainerRef.current && relatedTarget && searchContainerRef.current.contains(relatedTarget)) {
                    return; // Don't hide if clicking inside the dropdown
                  }
                  // Delay hiding to allow clicks on suggestions
                  setTimeout(() => {
                    // Double-check that we're not clicking inside the container
                    if (!searchContainerRef.current?.contains(document.activeElement)) {
                      setShowSuggestions(false);
                    }
                  }, 200);
                }}
                placeholder="Search characters or locations..."
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rick-green focus:border-transparent text-lg"
              />
              {searchLoading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rick-green"></div>
                </div>
              )}
              
              {/* Autosuggest Dropdown */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/20 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                  {searchResults.map((result) => (
                    result.type === 'character' ? (
                      <Link
                        key={`char-${result.id}`}
                        to={`/character/${result.id}`}
                        className="flex items-center gap-3 p-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                        onMouseDown={(e) => {
                          // Prevent blur from firing before click
                          e.preventDefault();
                        }}
                        onClick={() => {
                          setSearchQuery('');
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={result.image}
                            alt={result.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{result.name}</p>
                          <p className="text-sm text-gray-400 truncate">
                            {result.species} • {result.status}
                          </p>
                        </div>
                        <span className="text-xs text-rick-green bg-rick-green/20 px-2 py-1 rounded">Character</span>
                      </Link>
                    ) : (
                      <Link
                        key={`loc-${result.id}`}
                        to={`/location/${result.id}`}
                        className="flex items-center gap-3 p-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                        onMouseDown={(e) => {
                          // Prevent blur from firing before click
                          e.preventDefault();
                        }}
                        onClick={() => {
                          setSearchQuery('');
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="w-12 h-12 rounded-lg bg-rick-green/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">📍</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{result.name}</p>
                          <p className="text-sm text-gray-400 truncate">
                            {(result as any).locationType || 'Unknown'} • {result.dimension || 'Unknown'}
                          </p>
                        </div>
                        <span className="text-xs text-rick-green bg-rick-green/20 px-2 py-1 rounded">Location</span>
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Regular Locations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {locations.map((location: any) => (
            <Link
              key={location.id}
              to={`/location/${location.id}`}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-2">{location.name}</h2>
              <div className="space-y-1 text-sm text-gray-300">
                <p><span className="font-semibold">Type:</span> {location.type || 'Unknown'}</p>
                <p><span className="font-semibold">Dimension:</span> {location.dimension || 'Unknown'}</p>
                <p className="text-rick-green font-semibold mt-2">
                  Residents: {location.residents?.length || 0}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {info && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!info.prev}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                info.prev
                  ? 'bg-rick-green text-white hover:bg-rick-green/80'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <span className="text-white font-semibold">
              Page {page} of {info.pages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!info.next}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                info.next
                  ? 'bg-rick-green text-white hover:bg-rick-green/80'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

