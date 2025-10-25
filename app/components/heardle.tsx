'use client';

import { useEffect, useState } from "react";
import { MusicInfo } from "../lib/definitions";

export default function Heardle({ musics }: { musics: MusicInfo[] }) {
    const [currentMusic, setCurrentMusic] = useState(musics[Math.floor(Math.random() * musics.length)]);
    function updateMusic() {
        if (musics.length === 0) {
            return;
        }
        let newMusic: MusicInfo = musics[Math.floor(Math.random() * musics.length)];
        //used to avoid repetition of music.
        while (newMusic.url === currentMusic.url) {
            newMusic = musics[Math.floor(Math.random() * musics.length)];
        }
        setCurrentMusic(newMusic)
    }
    return (
        <>
            <MusicPlayer music={currentMusic} />
        </>)
}

function MusicPlayer({ music }: { music: MusicInfo }) {
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(1.0);

    async function loadMusic() {
        try {
            if (currentAudio) {
                currentAudio.pause();
                setCurrentAudio(null);
            }

            if (music.platform === 'soundcloud') {
                const response = await fetch(`https://api.soundcloud.com/resolve?url=${encodeURIComponent(music.url)}`);

                if (!response.ok) throw new Error('Failed to fetch track info');

                const track = await response.json();
                const audioUrl = track.stream_url;

                const audio = new Audio(audioUrl);
                audio.volume = volume;
                setCurrentAudio(audio);
            }
        } catch (error) {
            console.error('Error loading music:', error);
        }
    }

    // Load music when the track changes
    useEffect(() => {
        loadMusic();
        return () => {
            if (currentAudio) {
                currentAudio.pause();
            }
        };
    }, [music.url]);

    // Handle play/pause
    useEffect(() => {
        if (currentAudio) {
            if (playing) {
                currentAudio.play();
            } else {
                currentAudio.pause();
            }
        }
    }, [playing, currentAudio]);

    // Handle volume changes
    useEffect(() => {
        if (currentAudio) {
            currentAudio.volume = volume;
        }
    }, [volume, currentAudio]);

    return (
        <div className="music-player">
            <div className="controls">
                <button onClick={() => setPlaying(!playing)}>
                    {playing ? 'Pause' : 'Play'}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
            </div>
        </div>
    );
}

function Guesser({ musics, updateGuess }: { musics: MusicInfo[], guess: string, updateGuess: (guess: string) => void }) {
    // search box with possible candidates
    // when guess is made, modifies guess with updateGuess
}