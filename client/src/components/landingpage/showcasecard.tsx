import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";

interface ShowCardProps {
  path: string;
  title: string;
  description: string;
  tag:string;
}

const ShowCard: React.FC<ShowCardProps> = ({ path, title, description ,tag}) => {
  return (
    <div className=" w-64 h-[20rem] md:w-80 md:h-96 bg-white rounded-lg shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] flex flex-col justify-between py-8">
            <div className="font-grotesk px-4 flex flex-col gap-4">
            
                <div className="bg-neutral-200 font-bold text-xs md:text-sm uppercase text-muted-foreground px-2 py-1 rounded-md max-w-fit">{tag}</div>
                <div className="flex flex-col ">
                    <div className="font-bold tracking-tight text-sm md:text-base">{title}</div>
                    <div className=" text-muted-foreground  text-sm md:text-base tracking-tight max-w-[16.5rem]">{description}</div>
                </div>

            </div>
            <div>
                <Player
                    autoplay
                    loop
                    src={path}
                    className="h-[100px] w-[100px] md:h-[150px] md:w-[150px]"
                   
                />
            </div>
    </div>
    
  );
};

export default ShowCard;
