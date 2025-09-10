
import { PeopleCanvas } from './people'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div className='h-[100vh] relative flex flex-col gap-4 '>
        <div className=' w-full flex max-w-3xl mx-auto items-center justify-center text-white font-grotesk px-2 border border-neutral-300 py-2 rounded-2xl'>
            <div className='bg-neutral-900 w-full flex py-4 px-4 rounded-2xl text-white items-center justify-center font-grotesk text-center '>
                Still got some queries ? <span onClick={()=>navigate('/contact')} className='font-bold mx-2 cursor-pointer'>Contact us</span>
            </div>

        </div>
        <PeopleCanvas/>
    </div>
  )
}

export default Footer
