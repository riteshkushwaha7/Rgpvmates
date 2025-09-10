
import ShowCard from "./showcasecard";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Accordion } from "../ui/accordion";
import AccordionDemo from "./accourdian";

function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)"); // lg breakpoint
    const handler = () => setIsLarge(mq.matches);
    handler(); // set initial
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isLarge;
}

const SectionWrapper = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isLarge = useIsLargeScreen();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0.2 1", "0.8 0"],
  });

  // Animation: for lg screens → [0,1] fades in/out
  // for small screens → only fade/scale IN, stay visible
  const scale = useTransform(
    scrollYProgress,
    isLarge ? [0, 0.5, 1] : [0, 1],
    isLarge ? [0.9, 1, 0.9] : [0.9, 1]
  );
  const opacity = useTransform(
    scrollYProgress,
    isLarge ? [0, 0.5, 1] : [0, 0.2],
    isLarge ? [0, 1, 0] : [0, 1]
  );

  return (
    <div className="w-full relative">
      {/* Section One */}
      <div
        ref={ref}
        className="w-full bg-white relative flex flex-col gap-8 items-center  md:pt-24 px-2
                   h-auto min-h-screen lg:h-[100vh]"
      >
        {/* SVG stays */}
        <motion.svg
         className="absolute md:-top-20  md:opacity-20  left-0 w-full h-auto z-0 pointer-events-none"
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

        {/* Animate content (text + cards) */}
        <motion.div style={{ scale, opacity }} className="flex flex-col items-center gap-6">
          <div className="flex flex-col text-center gap-1">
            <div className="font-grotesk text-2xl md:text-4xl font-medium tracking-tight">
              Make secure connections
            </div>
            <div className="font-grotesk text-xs max-w-60 md:max-w-fit md:text-lg font-light tracking-tighter">
              users security is our top priority , learn how you and your identity is protected with us.
            </div>
          </div>

          <div className="p-2 border border-neutral-200 rounded-2xl">
            <div className=" max-w-fit mx-auto py-4 px-4 w-full rounded-2xl flex flex-col md:flex-row gap-4 ">
              <ShowCard path={"/shared/secure.json"} title="Verified Students" description="All profiles are verified with student IDs to ensure authenticity and safety." tag="verification" />
              <ShowCard path={"/shared/match.json"} title="Smart Matching" description="Advanced algorithms finds  matches based on your preferences." tag="connection" />
              <ShowCard path={"/shared/message.json"} title="Safe Messaging" description="Built-in chat system with safety features to help you connect securely." tag="messages" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section Two (blank) */}
      <div
        
        className="w-full bg-white relative flex flex-col gap-8 items-center pt-10 md:pt-24 px-2
                   h-auto min-h-screen lg:h-[100vh]"
      >

  <motion.svg
     className="absolute top-64 md:top-0 scale-y-[-1] md:opacity-40  left-0 w-full h-auto z-0 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 800"
    >
      {/* Orbit 1 - No rotation */}
      <motion.ellipse
        cx="720"     // center X (half of 1440)
        cy="400"     // center Y (half of 800)
        rx="600"     // horizontal radius
        ry="120"     // vertical radius
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Orbit 2 - Rotated 30 degrees */}
      <motion.ellipse
        cx="720"
        cy="400"
        rx="500"
        ry="100"
        stroke="rgba(133, 252, 209, 0.8)"
        strokeWidth="1.5"
        fill="none"
        transform="rotate(30 720 400)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, delay: 0.2 }}
      />

      {/* Orbit 3 - Rotated -30 degrees */}
      <motion.ellipse
        cx="720"
        cy="400"
        rx="400"
        ry="80"
        stroke="rgba(252, 133, 209, 0.8)"
        strokeWidth="1.5"
        fill="none"
        transform="rotate(-30 720 400)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, delay: 0.4 }}
      />

    </motion.svg>


        {/* Animate content (text + cards) */}
        <motion.div  className="flex flex-col items-center gap-6 w-full z-20 ">
          <div className="flex flex-col text-center gap-1 ">
        

            <div className="font-grotesk text-2xl md:text-4xl font-medium tracking-tight">
              Facts & questions
            </div>
            <div className="font-grotesk text-xs max-w-60 md:max-w-fit md:text-lg font-light tracking-tighter">
              answers to the common queries of users
            </div>
          </div>

          <div className=" max-w-6xl w-full z-30">
             <AccordionDemo/>
          </div>
        </motion.div>
      </div>
    </div>
  );
};



export default SectionWrapper;
