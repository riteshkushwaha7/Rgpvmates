"use client";
import { useState } from "react";
import { motion } from "motion/react";

const Accordion = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4 mx-4 md:mx-0 px-4 font-grotesk z-50 bg-white rounded-xl shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex justify-between items-center py-3"
      >
        <span className="font-medium text-xs md:text-base">{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-3xl font-extralight"
        >
          +
        </motion.span>
      </button>

      {/* Animated content */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="pb-3 text-sm text-neutral-600">{children}</div>
      </motion.div>
    </div>
  );
};

export default function AccordionDemo() {
  return (
    <div className="max-w-4xl mx-auto rounded-lg py-4 z-10">
      <Accordion title="What if someone creates a fake account of mine?">
        We verify each profile after registration of account through the college id , email , phonenumber. Only geniune user accounts are accepted and fake ones are banned permanently.  
      </Accordion>
      <Accordion title="What if someone abuses in the chat?">
        You can report that person to us , and we will suspend that account and would take strict actions , and only the user's request you accept would be able to chat with you.  
      </Accordion>
      <Accordion title="Whats the purpose of rgpv mates ? ">
        Our purpose is to create connections , make people know each other , share knowledge , make friends apart of their deparments. 
      </Accordion>
      <Accordion title="Are chats encrypted?">
        To tackle abuse and offensive content , we haven't made chats encrypted , chats are meant for normal conversations , you can always switch to whatsapp or your favorite platform , once you are comfortable. 
      </Accordion>
      <Accordion title="Is there any mobile app?">
        Andriod app of rgpv mates is currently in development. 
      </Accordion>
    </div>
  );
}
