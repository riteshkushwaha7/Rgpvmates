import GuildLinesMain from '@/components/guildlines/main_page'
import Title from '@/components/landingpage/title'
import { ChevronLeft } from 'lucide-react'

import { Link } from 'react-router-dom'

const GuideLines = () => {
  return (
    <div className='max-w-5xl mx-auto w-full bg-white h-full flex flex-col border border-neutral-500/40 mb-20 md:mb-0 md:rounded-xl md:mt-4'>
      <div className='h-14 border-b border-neutral-500/50 flex justify-between items-center px-4'>
        <Link to={'/'}  className=' bg-neutral-100 shadow-sm text-neutral-900 font-bold hover:bg-neutral-200 py-2 px-2 rounded-md' >
          <ChevronLeft/>
        </Link>
        <Title/>
       
      </div>
      <div className='p-2 h-full w-full'>
        <GuildLinesMain/>
      </div>
    </div>
  )
}


export default GuideLines
