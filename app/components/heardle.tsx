import { useEffect, useState } from "react";
import { Music } from "../lib/definitions";
import Soundcloud from "soundcloud.ts";
import { Readable } from "stream";

export default function heardle({ musics }: { musics: Music[] }) {
    const [currentMusic, setCurrentMusic] = useState<Music>(musics[Math.floor(Math.random() * musics.length)]);
    function updateMusic() {
        if (musics.length === 0) {
            return;
        }
        let newMusic: Music = musics[Math.floor(Math.random() * musics.length)];
        //used to avoid repetition of music.
        while (newMusic.url === currentMusic.url) {
            newMusic = musics[Math.floor(Math.random() * musics.length)];
        }
        setCurrentMusic(newMusic)
    }
}

function MusicPlayer({ music }: { music: Music }) {
    let playingLink: string = "None"
    const [currentlyPlaying, setCurrentlyPlaying] = useState<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState<Boolean>(false);
    const [audioLoudness, setAudioloudness] = useState(0.0)
    // should also load music 
    async function loadMusic() {
        let stream: Readable | null = null
        switch (music.platform) {
            case 'soundcloud':
                const soundcloud = new Soundcloud();
                const readableStream = await soundcloud.util.streamTrack(music.url);
                stream = readableStream;
                break;
            default:
                break;
        }
        let load = async () => {
            const chunks = []
            while (true) {
                const { done, value } = await stream?.read();
                if (done) {
                    break;
                }
                chunks.push(value);
            }
            const blob = new Blob(chunks)
            playingLink = URL.createObjectURL(blob);
            const audio = new Audio();
            audio.src = playingLink
            setCurrentlyPlaying(audio);
        }
        load()

    }
    // when music is changed, load music again.
    useEffect(() => {
        setIsPlaying(false)
        if (playingLink !== "none") {
            currentlyPlaying?.pause()
            URL.revokeObjectURL(playingLink)
        }
        loadMusic()
    }, [music])
    // play and pause.
    useEffect(() => {
        if (isPlaying) {
            currentlyPlaying?.play();
        } else {
            currentlyPlaying?.pause();
        }
    }, [isPlaying])
    // should have functionality to adjust volume
    useEffect(() => {
        if (currentlyPlaying) {
            currentlyPlaying.volume = audioLoudness
        }
    }, [audioLoudness])

}

function Guesser({ musics, updateGuess }: { musics: Music[], guess: string, updateGuess: (guess: string) => void }) {
    // search box with possible candidates
    // when guess is made, modifies guess with updateGuess
}