'use client';

import { useEffect, useState } from "react";
import { MusicInfo } from "../lib/definitions";

export default function Heardle({ musics }: { musics: Map<string, MusicInfo> }) {
    let musicList: string[] = [];
    const [currentMusic, setCurrentMusic] = useState((musicList[Math.floor(Math.random() * musicList.length)]));
    function updateMusic() {
        if (musics.size <= 1) {
            return;
        }
        let newMusic: string = musicList[Math.floor(Math.random() * musicList.length)];
        //used to avoid repetition of music, will not loop endlessly due to condition from above.
        while (newMusic === currentMusic) {
            newMusic = musicList[Math.floor(Math.random() * musicList.length)];
        }
        setCurrentMusic(newMusic)
    }
    useEffect(() => {
        musicList = musics.keys().toArray();
        updateMusic()
    }, [musics])
    return (
        <>
            <MusicPlayer music={musics.get(currentMusic)} />
        </>)
}

// will be defined unless musics is size 0.
function MusicPlayer({ music }: { music: MusicInfo | undefined }) {
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(1.0);

    async function loadMusic() {
        if (!music) {
            console.log("Musicplayer got undefined music")
            return
        }
        try {
            if (currentAudio) {
                currentAudio.pause();
                setCurrentAudio(null);
            }
            const audio = new Audio(music.url);
            audio.volume = volume;
            setCurrentAudio(audio);
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
    }, [music]);

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

function Guesser({ musics, updateGuess }: { musics: Map<string, MusicInfo>, guess: string, updateGuess: (guess: string) => void }) {
    // search box with possible candidates
    // when guess is made, modifies guess with updateGuess
}