import { useState } from "react";
import { Music } from "../lib/definitions";

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
    // should have functionality to adjust volume
    // play and pause.
    // should also load music 
}

function Guesser({ musics, updateGuess }: { musics: Music[], guess: string, updateGuess: (guess: string) => void }) {
    // search box with possible candidates
    // when guess is made, modifies guess with updateGuess
}