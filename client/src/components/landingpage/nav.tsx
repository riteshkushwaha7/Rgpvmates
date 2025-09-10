
import { AnimatePresence, motion } from 'motion/react'
import Title from './title'

import {   WavesIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const menuItems = [
    {
      title: "Login",
      link: "/login",
      text: "Continue where you left off",
    },
    {
      title: "Register",
      link: "/register",
      text: "Start connecting with new people",
    },
    {
      title: "Safety",
      link: "/safety",
      text: "Tips to keep things safe",
    },
    {
      title: "T&CO",
      link: "/terms",
      text: "Know the rules before you connect",
    },
    {
      title: "Contact",
      link: "/contact",
      text: "We’re here to help you",
    },
  ]
  
  

const Navbar = () => {
  const navigate = useNavigate();

    const [ isOpen , setIsOpen ] = useState(false)

  return (
    <>
    <div className='w-[90vw] md:w-full z-10 absolute top-2 max-w-4xl left-1/2 -translate-x-1/2 bg-white h-12 flex items-center justify-between rounded-2xl  px-2 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]'>
        <div><Title/></div>
        <div className='flex gap-4'>
            
            <button
            onClick={() => navigate(`/login`)}
                className='bg-transparent text-black/80 hover:text-black font-medium h-9 flex items-center justify-center text-sm font-grotesk'
            >Login</button>
            <button
                className={`${!isOpen ? "bg-neutral-100" : "bg-neutral-200"} active:bg-neutral-200 rounded-xl h-9 w-9 text-black flex items-center justify-center text-sm font-grotesk shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]`}

                onClick={()=>setIsOpen(!isOpen)}
            ><WavesIcon className='h-4 w-4'/></button>
        </div>
        
    </div>
    <AnimatePresence>
    {isOpen &&
    <motion.div
    initial={{ opacity: 0, x: '-50%', y: -10 }}
    animate={{ opacity: 1, x: '-50%', y: 0 }}
    transition={{ duration: 0.3 }}
    exit={{ opacity: 0 , y:-10 }}
        className='absolute w-[90vw] left-1/2   h-[70vh] md:w-full max-w-4xl top-16 bg-neutral-300/30 backdrop-blur-lg rounded-2xl z-50 shadow-[inset_-12px_-8px_40px_#46464620] flex items-center justify-center '
    >

          
                <motion.ul className='flex flex-col '>
                {menuItems.map((item,index)=>(
                    <li
                    onClick={() => navigate(`${item.link}`)}
                    key={index}
                     className='text-5xl  md:text-7xl font-black uppercase text-center font-grotesk tracking-tighter hover:tracking-wider hover:text-neutral-700 cursor-pointer group flex flex-col items-center justify-center' 
                      >{item.title}<span className='text-xs md:text-sm font-medium tracking-normal hidden group-hover:flex text-center text-pink-600'> [ {item.text} ] </span></li>
                ))}
                </motion.ul>
          

    </motion.div>
    }
    </AnimatePresence>

    </>
  )
}

export default Navbar
