
import { guidelines } from './guildline'
import { Lightbulb, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const GuildLinesMain = () => {
  const data = guidelines;
  return (
    <div className='flex flex-col md:flex-row gap-2 w-full p-1 h-full'>
        <div className='md:w-[70%] w-full bg-neutral-50 rounded-xl h-full flex flex-col gap-8 p-4 font-grotesk'>
        <div className='flex flex-col'>
              <div className="font-semibold text-xl">{data[0]?.title}</div>
              <div className="text-sm text-muted-foreground">
              {data[0]?.desc}
              </div>
            </div>

            <div className='flex flex-col gap-2'>
            <div className='flex gap-2 justify-start items-end'>
                <div className='bg-neutral-300 px-2 text-sm py-1 rounded-md '>
                  1
                </div>
                <div className='font-medium text-lg'> 
                  {data[1]?.title}
                </div>

            </div>
            <div className='flex flex-col  gap-1'>
                {data[1]?.subtopics?.map((item)=>(
                  //@ts-ignore
                  <div className='text-xs tracking-tight md:text-sm text-muted-foreground flex gap-1 md:items-center'> <span className='md:hidden'>-</span> <Lightbulb className='hidden md:block h-3 w-3 text-black'/>{item?.desc}</div>
                ))}
            </div>
            </div>

            <div className='flex flex-col gap-2'>
            <div className='flex gap-2 justify-start items-end'>
                <div className='bg-neutral-300 px-2 text-sm py-1 rounded-md '>
                  2
                </div>
                <div className='font-medium text-lg'> 
                  {data[2]?.title}
                </div>

            </div>
            <div className='flex flex-col  gap-1 md:gap-1'>
                {data[2]?.subtopics?.map((item)=>(
                  //@ts-ignore
                    <div className='text-xs tracking-tight md:text-sm text-muted-foreground flex gap-1 md:items-center'> <span className='md:hidden'>-</span> <Shield className='hidden md:block h-3 w-3 text-black'/>{item?.desc}</div>
                ))}
            </div>
            </div>

            <div className='flex flex-col gap-2'>
            <div className='flex gap-2 justify-start items-end'>
                <div className='bg-red-600 px-2 text-sm py-1 rounded-md text-white '>
                  3
                </div>
                <div className='font-medium text-red-600 text-lg'> 
                  {data[3]?.title}
                </div>

            </div>
            <div className="  grid md:grid-cols-2 gap-2">
            {data[3]?.subtopics?.map((item) => (
              <div key={item.title} className="text-sm font-medium text-red-500">
                {item.title}
                <div className="flex mt-1 flex-col text-xs md:text-sm gap-1 font-normal tracking-tight text-muted-foreground">
                  {/* @ts-ignore */}
                  {item?.points?.map((point, idx) => (
                    <span key={idx}>- {point}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

            </div>
        </div>
       
        <div className='md:w-[30%] w-full flex gap-2 flex-col'>
        <div className="bg-neutral-50 font-grotesk rounded-lg w-full px-4 py-4 flex flex-col gap-8">
          <div className="text-xl font-medium">Report to us</div>
          <div className="text-sm text-muted-foreground">
          If you encounter any inappropriate behavior, please report it immediately. We take all reports seriously and will investigate promptly.


          </div>
          <div className='w-full'>
          <Link to={'/contact'}  className=' bg-red-600 shadow-sm text-neutral-100 font-bold hover:bg-red-500 py-2 px-6 rounded-xl font-grotesk w-full' >
          Report Here
        </Link>
          </div>
        </div>
        <div className="bg-neutral-50 font-grotesk rounded-lg w-full px-4 py-4 flex flex-col gap-8">
          <div className="text-xl font-medium">Payment Issues?</div>
          <div className="text-sm text-muted-foreground">
          The ₹99 premium access fee is strictly non-refundable. Refunds will not be provided if an account is banned for policy violations, and temporary service interruptions do not qualify for compensation. 


          </div>
          <div className='w-full'>
          <Link to={'/contact'}  className=' underline  text-neutral-900 font-bold  py-2   font-grotesk w-full' >
          Contact for more help!
        </Link>
          </div>
        </div>
        </div>
    </div>
  )
}

export default GuildLinesMain
