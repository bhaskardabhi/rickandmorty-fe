import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_CHARACTERS, GET_LOCATIONS } from '@/lib/graphql/queries';
import { config } from '@/lib/config';

interface CompatibilityAnalysis {
  teamWork: string;
  conflicts: string;
  breaksFirst: string;
}

export default function CharacterCompatibilityGenerator() {
  const [character1Id, setCharacter1Id] = useState<string>('');
  const [character2Id, setCharacter2Id] = useState<string>('');
  const [locationId, setLocationId] = useState<string>('');
  const [analysis, setAnalysis] = useState<CompatibilityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch characters and locations
  const { data: charactersData, loading: loadingCharacters } = useQuery(GET_ALL_CHARACTERS, {
    variables: { page: 1 },
  });

  const { data: locationsData, loading: loadingLocations } = useQuery(GET_LOCATIONS, {
    variables: { page: 1 },
  });

  const characters = charactersData?.characters?.results || [];
  const locations = locationsData?.locations?.results || [];

  const handleGenerate = async () => {
    if (!character1Id || !character2Id || !locationId) {
      setError('Please select both characters and a location');
      return;
    }

    if (character1Id === character2Id) {
      setError('Please select two different characters');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch(`${config.backendUrl}/api/compatibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character1Id,
          character2Id,
          locationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate compatibility analysis');
      }

      const result = await response.json();
      setAnalysis(result.analysis);
      setIsOpen(true);
    } catch (err) {
      console.error('Error generating compatibility:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  const selectedCharacter1 = characters.find((c: any) => c.id === character1Id);
  const selectedCharacter2 = characters.find((c: any) => c.id === character2Id);
  const selectedLocation = locations.find((l: any) => l.id === locationId);

  // Helper function to convert text to list items
  const textToListItems = (text: string): string[] => {
    // Split by sentences, bullet points, or numbered lists
    const items = text
      .split(/(?:\n|\.\s+|•\s+|-\s+|\d+\.\s+)/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && !item.match(/^(and|or|but|however|therefore|thus|so|also|furthermore|moreover|in addition|additionally)$/i));
    
    // If we have fewer than 2 items, try splitting by commas for longer sentences
    if (items.length < 2) {
      const commaSplit = text.split(/[,;]/).map(item => item.trim()).filter(item => item.length > 10);
      return commaSplit.length > 1 ? commaSplit : items;
    }
    
    return items;
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-rick-green hover:bg-rick-green/80 text-white px-6 py-3 rounded-lg shadow-lg font-semibold transition-all flex items-center gap-2"
        >
          <span>⚡</span>
          <span>Compatibility Generator</span>
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsOpen(false);
            setAnalysis(null);
            setError(null);
          }}
        >
          {/* Modal Content */}
          <div 
            className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg border border-white/20 p-6 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Cross-Character Compatibility</h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setAnalysis(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Character Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Character 1 Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Character 1
                </label>
                <select
                  value={character1Id}
                  onChange={(e) => setCharacter1Id(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-rick-green"
                  disabled={loading || loadingCharacters}
                >
                  <option value="">Select character...</option>
                  {characters.map((char: any) => (
                    <option key={char.id} value={char.id} className="bg-slate-800">
                      {char.name} {char.species ? `(${char.species})` : ''}
                    </option>
                  ))}
                </select>
                {selectedCharacter1 && (
                  <div className="mt-3 flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                    <img
                      src={selectedCharacter1.image}
                      alt={selectedCharacter1.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-white font-semibold">{selectedCharacter1.name}</p>
                      <p className="text-xs text-gray-400">{selectedCharacter1.species} • {selectedCharacter1.status}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Character 2 Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Character 2
                </label>
                <select
                  value={character2Id}
                  onChange={(e) => setCharacter2Id(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-rick-green"
                  disabled={loading || loadingCharacters}
                >
                  <option value="">Select character...</option>
                  {characters.map((char: any) => (
                    <option key={char.id} value={char.id} className="bg-slate-800">
                      {char.name} {char.species ? `(${char.species})` : ''}
                    </option>
                  ))}
                </select>
                {selectedCharacter2 && (
                  <div className="mt-3 flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                    <img
                      src={selectedCharacter2.image}
                      alt={selectedCharacter2.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-white font-semibold">{selectedCharacter2.name}</p>
                      <p className="text-xs text-gray-400">{selectedCharacter2.species} • {selectedCharacter2.status}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Location
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-rick-green"
                disabled={loading || loadingLocations}
              >
                <option value="">Select location...</option>
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id} className="bg-slate-800">
                    {loc.name} {loc.dimension ? `(${loc.dimension})` : ''}
                  </option>
                ))}
              </select>
              {selectedLocation && (
                <div className="mt-3 bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white font-semibold">{selectedLocation.name}</p>
                  <p className="text-xs text-gray-400">{selectedLocation.type} • {selectedLocation.dimension}</p>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !character1Id || !character2Id || !locationId || character1Id === character2Id}
              className="w-full px-6 py-3 bg-rick-green hover:bg-rick-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium mb-4 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Analysis...
                </span>
              ) : (
                'Generate Analysis'
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-6 mt-6">
                {/* Selected Characters and Location Header */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Analysis for:</p>
                  <div className="flex items-center gap-4">
                    {selectedCharacter1 && (
                      <div className="flex items-center gap-2">
                        <img
                          src={selectedCharacter1.image}
                          alt={selectedCharacter1.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-white font-semibold">{selectedCharacter1.name}</span>
                      </div>
                    )}
                    <span className="text-gray-400">vs</span>
                    {selectedCharacter2 && (
                      <div className="flex items-center gap-2">
                        <img
                          src={selectedCharacter2.image}
                          alt={selectedCharacter2.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-white font-semibold">{selectedCharacter2.name}</span>
                      </div>
                    )}
                  </div>
                  {selectedLocation && (
                    <p className="text-xs text-gray-300 mt-2">📍 {selectedLocation.name}</p>
                  )}
                </div>

                {/* Team Work */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-rick-green font-bold mb-3 flex items-center gap-2 text-lg">
                    <span>🤝</span>
                    Team Work
                  </h4>
                  <ul className="space-y-2">
                    {textToListItems(analysis.teamWork).map((item, index) => (
                      <li key={index} className="text-sm text-gray-200 flex items-start gap-2">
                        <span className="text-rick-green mt-1.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Conflicts */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2 text-lg">
                    <span>⚔️</span>
                    Conflicts
                  </h4>
                  <ul className="space-y-2">
                    {textToListItems(analysis.conflicts).map((item, index) => (
                      <li key={index} className="text-sm text-gray-200 flex items-start gap-2">
                        <span className="text-red-400 mt-1.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Breaks First */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-yellow-400 font-bold mb-3 flex items-center gap-2 text-lg">
                    <span>💥</span>
                    Breaks First
                  </h4>
                  <ul className="space-y-2">
                    {textToListItems(analysis.breaksFirst).map((item, index) => (
                      <li key={index} className="text-sm text-gray-200 flex items-start gap-2">
                        <span className="text-yellow-400 mt-1.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

