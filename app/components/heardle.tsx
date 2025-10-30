'use client';

import { useEffect, useReducer, useState } from "react";
import { MusicInfo } from "../lib/definitions";
import Fuse from 'fuse.js';
import { prepareFlightRouterStateForRequest } from "next/dist/client/flight-data-helpers";

type GameState = {
    guesses: number;
    correct: boolean;
    music: string;
}
type GameStateCommand =
    "incrementGuesses" |
    "correct" |
    "reset"

export default function Heardle({ musics }: { musics: Map<string, MusicInfo> }) {
    let musicList: string[] = [];
    function changeGameState(state: GameState, action: GameStateCommand): GameState {
        if (action === "incrementGuesses") {
            return {
                ...state,
                guesses: state.guesses + 1,
            }
        } else if (action === "correct") {
            return {
                ...state,
                correct: true,
            }
        } else if (action === "reset") {
            return {
                guesses: 0,
                correct: false,
                music: generateNewMusic()
            }
        }
        return state;
    }
    const [state, dispatchGameState] = useReducer(changeGameState,
        {
            guesses: 0,
            correct: false,
            music: (musicList[Math.floor(Math.random() * musicList.length)])
        }
    )
    function generateNewMusic() {
        if (musics.size <= 1) {
            return musicList[0];
        }
        let newMusic: string = musicList[Math.floor(Math.random() * musicList.length)];
        //used to avoid repetition of music, will not loop endlessly due to condition from above.
        while (newMusic === state.music) {
            newMusic = musicList[Math.floor(Math.random() * musicList.length)];
        }
        return newMusic;
    }
    useEffect(() => {
        musicList = musics.keys().toArray();
        dispatchGameState('reset')
    }, [musics])
    return (
        <>
            <MusicPlayer music={musics.get(state.music)} />
            <Guesser musics={musicList} state={state} dispatch={dispatchGameState}></Guesser>
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

function Guesser({ musics, state, dispatch }: { musics: string[], state: GameState, dispatch: (command: GameStateCommand) => void }) {
    // search box with possible candidates
    let [similar, setSimilar] = useState<string[]>([])
    let [guess, setGuess] = useState("");
    // when guess is made, modifies guess with updateGuess
    useEffect(() => {
        const fuse = new Fuse(musics)
        setSimilar(fuse.search(guess).map((x) => x.item))
    }, [guess])

    function checkGuess(guess: string) {
        if (guess == state.music) {
            dispatch("correct");
        } else {
            dispatch("incrementGuesses");
        }
    }
    return (
        <div id={"guesser"}>
            <input value={guess}
                onKeyDown={(e) => {
                    if (e.key.length === 1) {
                        setGuess(guess + e.key)
                    }
                }}></input>
            <button onClick={() => {
                if (similar.includes(guess)) {
                    checkGuess(guess)
                }
            }}>
                submit
            </button>
        </div>
    )

}