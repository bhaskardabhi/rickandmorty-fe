import { useQuery } from '@apollo/client';
import { GET_LOCATION } from '@/lib/graphql/queries';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { config } from '@/lib/config';

export default function LocationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [description, setDescription] = useState<string | null>(null);
  const [descriptionLoading, setDescriptionLoading] = useState(true);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const { loading, error, data } = useQuery(GET_LOCATION, {
    variables: { id },
  });

  // Fetch location description from backend with frontend caching
  useEffect(() => {
    const fetchDescription = async () => {
      if (!id) return;

      const cacheKey = `location_description_${id}`;
      
      // Check frontend cache first
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setDescription(cached);
          setDescriptionLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Error reading from cache:', err);
      }

      // If not in cache, fetch from backend
      try {
        setDescriptionLoading(true);
        setDescriptionError(null);
        const response = await fetch(`${config.backendUrl}/api/location/${id}/description`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch description');
        }

        const result = await response.json();
        setDescription(result.description);
        
        // Cache the description in localStorage
        try {
          localStorage.setItem(cacheKey, result.description);
        } catch (err) {
          console.warn('Error saving to cache:', err);
        }
      } catch (err) {
        console.error('Error fetching description:', err);
        setDescriptionError(err instanceof Error ? err.message : 'Failed to load description');
      } finally {
        setDescriptionLoading(false);
      }
    };

    fetchDescription();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rick-green mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading location...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-2">Error loading location</p>
          <p className="text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  const location = data?.location;
  if (!location) return <div className="flex justify-center items-center min-h-screen text-white">Location not found</div>;

  const residents = location.residents || [];
  const totalPages = Math.ceil(residents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResidents = residents.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          ← Back to Locations
        </button>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-4">{location.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <p className="text-sm text-gray-300">Type</p>
              <p className="text-lg font-semibold">{location.type || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Dimension</p>
              <p className="text-lg font-semibold">{location.dimension || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Location Description Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">About This Location</h2>
          {descriptionLoading ? (
            <div className="flex items-center gap-3 text-white">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rick-green"></div>
              <p className="text-gray-300">Generating description...</p>
            </div>
          ) : descriptionError ? (
            <div className="text-red-400">
              <p className="mb-2">Error loading description</p>
              <p className="text-sm text-red-300">{descriptionError}</p>
            </div>
          ) : description ? (
            <div className="text-white">
              <p className="text-lg leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          ) : (
            <p className="text-gray-400">No description available</p>
          )}
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Residents ({residents.length})</h2>
        
        {residents.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center text-white">
            <p className="text-xl">No residents in this location</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {currentResidents.map((character: any) => (
                <Link
                  key={character.id}
                  to={`/character/${character.id}`}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20"
                >
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={character.image}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{character.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300">
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={`${
                        character.status === 'Alive' ? 'text-green-400' :
                        character.status === 'Dead' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {character.status}
                      </span>
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Species:</span> {character.species}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Gender:</span> {character.gender}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    currentPage > 1
                      ? 'bg-rick-green text-white hover:bg-rick-green/80'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                <span className="text-white font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    currentPage < totalPages
                      ? 'bg-rick-green text-white hover:bg-rick-green/80'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

