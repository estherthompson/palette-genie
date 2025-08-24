import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  return (
    <main className="p-8 bg-[#fef6e9] w-full min-h-screen flex flex-col items-center justify-center space-y-6">
      {/* Shine Heading */}
      <h1
        className="text-4xl md:text-5xl font-bold bg-shine-gradient bg-clip-text text-transparent 
        animate-shine bg-[length:200%_100%] text-center font-Recoleta mb-4"
      >
        Welcome to Palette Genie
      </h1>

      {/* Logo */}
      <div>
        <Image
          className="w-40 md:w-60 lg:w-72 mx-auto mb-8"
          src="/images/palette-genie.png"
          alt="Palette Genie"
          width={288}
          height={288}
        />

        {/* Buttons */}
        <div className="flex flex-col items-center gap-4 mt-6 w-full">
          <button
            className="w-52 h-12 lg:w-64
              rounded-full group cursor-pointer 
              bg-[#F7B267] text-[#442418] border-2 border-[#442418]
              hover:scale-105 transition duration-300 font-Recoleta
              relative overflow-hidden"
            onClick={() => router.push('/login')}
          >
            <span className="absolute inset-0 bg-white opacity-30 rotate-45 
              -translate-x-full group-hover:translate-x-full blur-sm 
              transform transition duration-500 pointer-events-none">
            </span>
            <span className="relative z-10 font-bold text-xl">Login</span>
          </button>

          <button
            className="w-52 h-12 lg:w-64
              rounded-full group cursor-pointer 
              bg-[#F7B267] text-[#442418] border-2 border-[#442418]
              hover:scale-105 transition duration-300 relative overflow-hidden"
            onClick={() => router.push('/signup')}
          >
            <span className="absolute inset-0 bg-white opacity-30 rotate-45 
              -translate-x-full group-hover:translate-x-full blur-sm 
              transform transition duration-500 pointer-events-none">
            </span>
            <span className="relative z-10 font-bold text-xl">Sign Up</span>
          </button>
        </div>
      </div>
    </main>
  );
}
