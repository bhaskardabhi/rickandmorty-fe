import { useQuery } from '@apollo/client';
import { GET_CHARACTER } from '@/lib/graphql/queries';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { config } from '@/lib/config';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  source: 'user' | 'suggestion';
}

export default function CharacterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [description, setDescription] = useState<string | null>(null);
  const [descriptionLoading, setDescriptionLoading] = useState(true);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { loading, error, data } = useQuery(GET_CHARACTER, {
    variables: { id },
  });

  // Fetch character description from backend with frontend caching
  useEffect(() => {
    const fetchDescription = async () => {
      if (!id) return;

      const cacheKey = `character_description_${id}`;
      
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
        const response = await fetch(`${config.backendUrl}/api/character/${id}/description`, {
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

  // Fetch character insights from backend with frontend caching
  useEffect(() => {
    const fetchInsights = async () => {
      if (!id) return;

      const cacheKey = `character_insights_${id}`;
      
      // Check frontend cache first
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsedInsights = JSON.parse(cached);
          setInsights(parsedInsights);
          setInsightsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Error reading insights from cache:', err);
      }

      // If not in cache, fetch from backend
      try {
        setInsightsLoading(true);
        setInsightsError(null);
        const response = await fetch(`${config.backendUrl}/api/character/${id}/insights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }

        const result = await response.json();
        const insightsArray = result.insights || [];
        setInsights(insightsArray);
        
        // Cache the insights in localStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify(insightsArray));
        } catch (err) {
          console.warn('Error saving insights to cache:', err);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
        setInsightsError(err instanceof Error ? err.message : 'Failed to load insights');
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchInsights();
  }, [id]);

  // Load existing notes from localStorage
  useEffect(() => {
    if (!id) return;

    const notesKey = `character_notes_${id}`;
    try {
      const savedNotes = localStorage.getItem(notesKey);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (err) {
      console.warn('Error loading notes from localStorage:', err);
    }
  }, [id]);

  // Save notes to localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    if (!id) return;
    const notesKey = `character_notes_${id}`;
    try {
      localStorage.setItem(notesKey, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (err) {
      console.warn('Error saving notes to localStorage:', err);
    }
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    const newNoteObj: Note = {
      id: Date.now().toString(),
      content: suggestion,
      createdAt: new Date().toISOString(),
      source: 'suggestion',
    };
    const updatedNotes = [...notes, newNoteObj];
    saveNotes(updatedNotes);
    
    // Remove the suggestion from the insights list
    setInsights(prevInsights => prevInsights.filter(insight => insight !== suggestion));
    
    // Show success notification
    setNotification({ message: 'Note added successfully!', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle adding a custom note
  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const newNoteObj: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: new Date().toISOString(),
      source: 'user',
    };
    const updatedNotes = [...notes, newNoteObj];
    saveNotes(updatedNotes);
    setNewNote('');
    setShowNoteInput(false);
    setShowSuggestions(false);
    
    // Show success notification
    setNotification({ message: 'Note added successfully!', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle deleting a note
  const handleDeleteNote = (noteId: string) => {
    const noteToDelete = notes.find(note => note.id === noteId);
    const updatedNotes = notes.filter(note => note.id !== noteId);
    saveNotes(updatedNotes);
    
    // If it was a suggestion note, add it back to insights
    if (noteToDelete?.source === 'suggestion' && noteToDelete.content) {
      setInsights(prevInsights => {
        // Only add if it's not already in the list
        if (!prevInsights.includes(noteToDelete.content)) {
          return [...prevInsights, noteToDelete.content];
        }
        return prevInsights;
      });
    }
  };

  // Filter out suggestions that are already in notes
  const availableInsights = insights.filter(insight => 
    !notes.some(note => note.content === insight && note.source === 'suggestion')
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rick-green mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading character...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-2">Error loading character</p>
          <p className="text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  const character = data?.character;
  if (!character) return <div className="flex justify-center items-center min-h-screen text-white">Character not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out">
          <div className={`rounded-lg shadow-lg p-4 border backdrop-blur-sm transform transition-all ${
            notification.type === 'success' 
              ? 'bg-rick-green/95 text-white border-rick-green' 
              : 'bg-red-500/95 text-white border-red-500'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{notification.type === 'success' ? '✓' : '✕'}</span>
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          ← Back
        </button>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
              <img
                src={character.image}
                alt={character.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="text-white">
              <h1 className="text-3xl font-bold mb-4">{character.name}</h1>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-300 mb-1">Status</p>
                  <p className={`text-base font-semibold ${
                    character.status === 'Alive' ? 'text-green-400' :
                    character.status === 'Dead' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {character.status}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-300 mb-1">Species</p>
                  <p className="text-base font-semibold">{character.species}</p>
                </div>

                {character.type && (
                  <div>
                    <p className="text-xs text-gray-300 mb-1">Type</p>
                    <p className="text-base font-semibold">{character.type}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-300 mb-1">Gender</p>
                  <p className="text-base font-semibold">{character.gender}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-300 mb-1">Origin</p>
                  <p className="text-base font-semibold">{character.origin?.name || 'Unknown'}</p>
                  {character.origin?.dimension && (
                    <p className="text-xs text-gray-400 mt-0.5">Dim: {character.origin.dimension}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-300 mb-1">Location</p>
                  <p className="text-base font-semibold">{character.location?.name || 'Unknown'}</p>
                  {character.location?.dimension && (
                    <p className="text-xs text-gray-400 mt-0.5">Dim: {character.location.dimension}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-gray-300 mb-1">Episodes</p>
                  <p className="text-base font-semibold text-rick-green">{character.episode?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Character Description Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">About {character.name}</h2>
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

        {/* Character Notes Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Notes & Insights</h2>
          
          {/* Existing Notes */}
          {notes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Your Notes</h3>
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`rounded-lg flex justify-between items-start gap-3 transition-all ${
                      note.source === 'suggestion' 
                        ? 'bg-white/3 border border-white/5 p-2.5' 
                        : 'bg-white/5 border border-white/10 p-4'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`${note.source === 'suggestion' ? 'text-sm text-gray-200' : 'text-white'}`}>
                        {note.content}
                      </p>
                      <p className={`${note.source === 'suggestion' ? 'text-[10px]' : 'text-xs'} text-gray-400 mt-1.5`}>
                        {new Date(note.createdAt).toLocaleString()} • 
                        {note.source === 'suggestion' ? ' AI' : ' Custom'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-400 hover:text-red-300 transition-colors px-2 py-1 text-sm"
                      title="Delete note"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {showSuggestions && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  AI-Generated Suggestions
                </h3>
                <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                  {availableInsights.length} suggestions
                </span>
              </div>
              {insightsLoading ? (
                <div className="flex items-center gap-3 text-white mb-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rick-green"></div>
                  <p className="text-gray-300 text-sm">Generating AI suggestions...</p>
                </div>
              ) : insightsError ? (
                <div className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p>Error loading suggestions: {insightsError}</p>
                </div>
              ) : availableInsights.length > 0 ? (
                <div className="space-y-2.5 mb-4">
                  {availableInsights.map((insight, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(insight)}
                      className="text-left bg-gradient-to-br from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 rounded-lg p-3 border border-white/10 hover:border-rick-green/50 transition-all group relative overflow-hidden"
                    >
                      <div className="relative z-10">
                        <div className="flex items-start gap-2.5">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rick-green/20 text-rick-green text-xs font-bold flex items-center justify-center mt-0.5 group-hover:bg-rick-green/30 transition-colors">
                            {index + 1}
                          </span>
                          <p className="text-sm text-gray-200 group-hover:text-white flex-1 leading-relaxed">
                            {insight}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 ml-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-rick-green font-medium">Add to notes</span>
                          <span className="text-rick-green">→</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-rick-green/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm mb-4 bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  No suggestions available
                </div>
              )}
              
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowSuggestions(false);
                    setShowNoteInput(true);
                  }}
                  className="text-rick-green hover:text-rick-green/80 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <span>Write your own note</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* Custom Note Input */}
          {showNoteInput && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Add Custom Note</h3>
              <div className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write your note about this character..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rick-green focus:border-transparent resize-none"
                  rows={4}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 bg-rick-green hover:bg-rick-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium"
                  >
                    Add Note
                  </button>
                  <button
                    onClick={() => {
                      setNewNote('');
                      setShowNoteInput(false);
                      if (availableInsights.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Note Button (when suggestions are hidden and no input shown) */}
          {!showSuggestions && !showNoteInput && (
            <button
              onClick={() => setShowNoteInput(true)}
              className="px-4 py-2 bg-rick-green hover:bg-rick-green/80 text-white rounded-lg transition-all font-medium"
            >
              + Add Note
            </button>
          )}
        </div>

        {character.episode && character.episode.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Episodes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {character.episode.slice(0, 12).map((ep: any) => (
                <div
                  key={ep.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <p className="font-semibold text-white">{ep.name}</p>
                  <p className="text-sm text-gray-400 mt-1">{ep.episode}</p>
                  {ep.air_date && (
                    <p className="text-xs text-gray-500 mt-1">{ep.air_date}</p>
                  )}
                </div>
              ))}
            </div>
            {character.episode.length > 12 && (
              <p className="text-gray-400 mt-4 text-center">
                ... and {character.episode.length - 12} more episodes
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

