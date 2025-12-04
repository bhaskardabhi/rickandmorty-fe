import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_LOCATIONS, GET_CHARACTERS_INFO } from '@/lib/graphql/queries';

export default function Home() {
  const [page, setPage] = useState(1);
  const { loading, error, data } = useQuery(GET_LOCATIONS, {
    variables: { page },
  });
  const { loading: loadingCharacters, data: charactersData } = useQuery(GET_CHARACTERS_INFO);

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
  const totalCharacters = charactersData?.characters?.info?.count || 0;

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
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
            <p className="text-2xl font-semibold text-rick-green">
              Total Characters: {totalCharacters}
            </p>
          </div>
        </header>

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

