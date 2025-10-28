'use client';
import { FormEvent, useEffect, useId, useState } from "react";
import { MusicInfo } from "../lib/definitions";
import { extractTrackIDToMusic, getSpotifyToken } from "../components/spotify";

interface AddMusicError {
    message: string;
    type: 'error' | 'warning' | 'info';
}

export default function MusicLoader({ musics, setMusics }: { musics: Map<string, MusicInfo>, setMusics: (newValue: Map<String, MusicInfo>) => void }) {
    const [authToken, setAuthToken] = useState<string | null>();
    const [url, setUrl] = useState<string>('');
    const [alias, setAlias] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<AddMusicError | null>(null);
    const [addType, setAddType] = useState<'track' | 'playlist'>('track');
    const urlInput = useId();
    const aliasInput = useId();

    // authenticates
    useEffect(() => {
        const authenticate = async () => {
            const token = await getSpotifyToken();
            setAuthToken(token);
        };
        authenticate();
        const interval = setInterval(authenticate, 3600000); // Refresh token every hour
        return () => clearInterval(interval);
    }, []);

    enum AddMusicResponse {
        Success,
        AuthenticationError,
        AliasExists,
        NoPreview,
        InvalidUrl
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!authToken) {
                throw new Error('Not authenticated with Spotify');
            }

            if (addType === 'track') {
                if (musics.has(alias)) {
                    throw new Error('Alias already exists');
                }

                const track = await extractTrackIDToMusic(url, authToken);
                if (!track) {
                    throw new Error('No preview available for this track');
                }

                const newMusics = new Map(musics);
                newMusics.set(alias, track);
                setMusics(newMusics);
                setUrl('');
                setAlias('');
                setError({ type: 'info', message: 'Track added successfully!' });
            } else {
                // For playlists, we'll need to implement the playlist fetching logic
                throw new Error('Playlist support coming soon!');

                setUrl('');
                setAlias('');
                setError({
                    type: 'info',
                    message: 'Playlist support coming soon!'
                });
            }
        } catch (err) {
            setError({
                type: 'error',
                message: err instanceof Error ? err.message : 'Unknown error occurred'
            });
        } finally {
            setLoading(false);
        }
    }

    function removeMusic(alias: string) {
        const newMusics = new Map(musics);
        newMusics.delete(alias);
        setMusics(newMusics);
    }

    return (
        <div className="music-loader p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4 mb-4">
                    <button
                        type="button"
                        onClick={() => setAddType('track')}
                        className={`px-4 py-2 rounded ${addType === 'track'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        Add Track
                    </button>
                    <button
                        type="button"
                        onClick={() => setAddType('playlist')}
                        className={`px-4 py-2 rounded ${addType === 'playlist'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        Add Playlist
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor={urlInput}
                            className="block text-sm font-medium text-gray-700"
                        >
                            Spotify {addType === 'track' ? 'Track' : 'Playlist'} URL
                        </label>
                        <input
                            id={urlInput}
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder={`Paste Spotify ${addType} URL here`}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor={aliasInput}
                            className="block text-sm font-medium text-gray-700"
                        >
                            {addType === 'track' ? 'Alias' : 'Playlist Prefix'}
                        </label>
                        <input
                            id={aliasInput}
                            type="text"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                            placeholder={addType === 'track'
                                ? 'Enter a unique name for this track'
                                : 'Enter prefix for playlist tracks (optional)'}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required={addType === 'track'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !authToken}
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                            ${loading || !authToken
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading
                            ? 'Adding...'
                            : `Add ${addType === 'track' ? 'Track' : 'Playlist'}`}
                    </button>
                </div>
            </form>

            {error && (
                <div className={`mt-4 p-4 rounded ${error.type === 'error'
                    ? 'bg-red-100 text-red-700'
                    : error.type === 'warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                    {error.message}
                </div>
            )}

            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Current Music Library</h3>
                <div className="mt-4 space-y-2">
                    {Array.from(musics.entries()).map(([alias, music]) => (
                        <div key={alias} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                                <span className="font-medium">{alias}</span>
                                <span className="text-gray-500 ml-2">- {music.name} by {music.artist}</span>
                            </div>
                            <button
                                onClick={() => removeMusic(alias)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}