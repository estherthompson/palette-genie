import {useRouter} from 'next/router';

export default function Home() {

  const router = useRouter();
  return (
    <main className="p-8 bg-[#fef6e9] w-full min-h-screen">
      <img className="w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto h-auto" 
      src="/images/palette-genie.png" 
      alt="Palette Genie" />

    <button
      className="w-52 h-10 mx-auto lg:w-100 
        block rounded-full group cursor-pointer 
        bg-[#F7B267] text-[#442418] border-2 border-[#442418]
        hover:scale-105 duration-300 font-Recoleta
        relative overflow-hidden"
      onClick={() => router.push('/login')}
    >
      <span className="absolute inset-0 bg-white opacity-30 rotate-45 
        -translate-x-full group-hover:translate-x-full blur-sm 
        transform duration-500 pointer-events-none">
      </span>
      <span className="relative z-10 font-Recoleta font-bold text-2xl ">Login</span>
    </button>

    <button
      className="w-52 h-10 mx-auto lg:w-100
        mt-6 block rounded-full 
        group cursor-pointer 
        bg-[#F7B267] text-[#442418] border-2 border-[#442418]
        hover:scale-105 duration-300 relative overflow-hidden"
      onClick={() => router.push('/sign')}
    >
      <span className="absolute inset-0 bg-white opacity-30 rotate-45 
        -translate-x-full group-hover:translate-x-full blur-sm 
        transform duration-500 pointer-events-none">
      </span>
      <span className="relative z-10 font-Recoleta font-bold text-2xl">Sign Up</span>
    </button>


      
      
    </main> 
  )
}
