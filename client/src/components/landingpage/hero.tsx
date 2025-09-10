import { motion } from 'motion/react'
import Navbar from './nav'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom';


const LandingHero = () => {

  const navigate = useNavigate();

  return (
    <section className="relative flex flex-col w-full h-screen bg-white overflow-hidden py-2  md:px-0">
        <Navbar/>
    {/* Left hand */}
    <motion.img
      src="/leftbg.png"
      alt="Left Hand"
      className="absolute bottom-64 md:bottom-80 left-0 w-[30vw] md:w-[50vh] z-10"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Right hand */}
    <motion.img
      src="/rightbg.png"
      alt="Right Hand"
      className="absolute bottom-56 right-0 w-[30vw] md:w-[50vh] z-10"
      animate={{ y: [0, 20, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />

<motion.svg
       className="absolute top-64 md:top-20 scale-y-[-1] md:opacity-20  left-0 w-full h-auto z-0 pointer-events-none"

          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 1440 400"
         
        >
          <motion.path
            d="M 0 200 C 400 50, 1000 100, 1440 200"
            stroke="rgba(252, 209, 133, 0.8)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3 }}
          />
        </motion.svg>
<motion.svg
       className="absolute top-4 md:-top-44 scale-y-[-1] md:opacity-20  left-0 w-full h-auto z-0 pointer-events-none"

          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 1440 400"
         
        >
       <motion.path
  d="M 0 200 Q 360 100, 720 200 T 1440 200"
  stroke="rgba(252, 209, 133, 0.8)"
  strokeWidth="2"
  fill="none"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 3 }}
/>

        </motion.svg>







    <div className='font-grotesk  font-semibold h-screen w-full flex items-center justify-center  flex-col gap-2 md:pt-4'>
        <div className='text-5xl md:text-6xl  text-center font-light font-grotesk tracking-tighter'>
          Find <span className='italic'>your</span> <br className='md:hidden'/><span className='font-bold'>RGPV</span> m<span className='italic'>a</span>tch
        </div>
        <div className='md:text-lg font-extralight text-center text-xs tracking-tighter font-grotesk max-w-48 md:max-w-4xl'>
        Verified students only. Safe space to meet, bond, and maybe more.
        </div>

        <div className='py-4 group'>
          <div className='p-2 border border-neutral-500/10 rounded-full group-hover:border-neutral-500/30'>
            <div>
              <button
                onClick={()=>navigate('/register')}
              className='h-14 px-2 pr-6 rounded-full text-white bg-neutral-900 flex gap-4 items-center justify-center'>
                <span className='h-10 rounded-full flex items-center justify-center bg-white w-10 text-black shadow-[inset_-12px_-8px_40px_#46464620]'><Heart className='w-4 h-4'/></span>Register Now
              </button>
            </div>
          </div>
        </div>
    </div>
  </section>
  )
}

export default LandingHero