'use client'
import Image from "next/image";
import Heardle from "./components/heardle";
import { MusicInfo } from "./lib/definitions"
import MusicLoader from "./components/music_loader";
import { useState } from "react";

export default function Home() {
  const [musics, setMusics] = useState(new Map())
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Heardle musics={musics} />
        <MusicLoader musics={musics} setMusics={setMusics} />
      </main>
    </div>
  );
}
