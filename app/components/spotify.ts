import { useCallback } from "react";
import { MusicInfo } from "../lib/definitions";

interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface TrackData {
    name: string;
    artists: { name: String }[];
    preview_url: string | null;
    images: { url: string }[];
}

export async function getSpotifyToken(): Promise<string | null> {
    const credentials = btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`)
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type= ${credentials}`,
        });

        if (!response.ok) {
            console.error(`Error: Failed to get token. Status: ${response.status}`);
            return null;
        }

        const data: SpotifyTokenResponse = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error obtaining access token:", error);
        return null;
    }
}

async function getTrack(trackId: string, accessToken: string): Promise<MusicInfo | null> {
    const trackUrl = `https://api.spotify.com/v1/tracks/${trackId}`;

    try {
        const response = await fetch(trackUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            console.error(`Error: Failed to fetch track data. Status: ${response.status}`);
            return null;
        }

        const trackData: TrackData = await response.json();

        let music: MusicInfo = {
            url: trackData.preview_url ?? "",
            artist: trackData.artists?.[0]?.name.toString() ?? "Unknown Artist",
            name: trackData.name ?? "???",
            image_url: trackData.images?.[0]?.url.toString()
        }


        if (music.url) {
            console.log("✅ Preview successfully retrieved.");
            return music;
        } else {
            console.warn("⚠️ No preview for this track.");
            return null;
        }

    } catch (error) {
        console.error("Error fetching track data:", error);
        return null;
    }
}

export async function parsePlayList(playlistId: string, accessToken: string): Promise<MusicInfo[]> {
    const playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;
    const tracks: MusicInfo[] = [];

    try {
        // First, get the playlist details
        const playlistResponse = await fetch(playlistUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!playlistResponse.ok) {
            throw new Error(`Failed to fetch playlist. Status: ${playlistResponse.status}`);
        }

        const playlist = await playlistResponse.json();
        let nextUrl = playlist.tracks.href;

        // Fetch all tracks from the playlist (handling pagination)
        while (nextUrl) {
            const tracksResponse = await fetch(nextUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!tracksResponse.ok) {
                throw new Error('Failed to fetch playlist tracks');
            }

            const data = await tracksResponse.json();

            // Process this batch of tracks
            const validTracks = data.items
                .filter((item: any) =>
                    item.track &&
                    !item.track.is_local &&
                    item.track.preview_url // Only include tracks with preview URLs
                )
                .map((item: any) => ({
                    url: item.track.preview_url,
                    name: item.track.name,
                    artist: item.track.artists[0].name,
                    image_url: item.track.album.images[0].url
                }));

            tracks.push(...validTracks);
            nextUrl = data.next; // Get next page URL if any
        }

        return tracks;

    } catch (error) {
        console.error("Error parsing playlist:", error);
        throw error;
    }
}

export function extractSpotifyId(url: string): string | null {
    // Handle both track and playlist URLs
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;

        // Extract the ID from the path
        const parts = pathname.split('/');
        const id = parts[parts.length - 1];

        return id || null;
    } catch (error) {
        console.error("Error parsing Spotify URL:", error);
        return null;
    }
}

export async function extractTrackIDToMusic(trackUrl: string, token: string): Promise<MusicInfo | null> {
    const trackId = extractSpotifyId(trackUrl);
    if (!trackId) {
        throw new Error('Invalid Spotify track URL');
    }
    return await getTrack(trackId, token);
}

export async function extractPlaylistID(playlistUrl: string, token: string): Promise<MusicInfo[]> {
    const playlistId = extractSpotifyId(playlistUrl);
    if (!playlistId) {
        throw new Error('Invalid Spotify playlist URL');
    }

    return await parsePlayList(playlistId, token);
}