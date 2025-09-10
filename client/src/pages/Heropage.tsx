
import LandingHero from '@/components/landingpage/hero'
import SectionWrapper from '@/components/landingpage/sectiontwo'
import Footer from '@/components/landingpage/footer'



const Heropage = () => {
  return (
   
    <div className='min-h-screen w-full scrollbar-hide bg-white'>
   <LandingHero/>
 <SectionWrapper/>
 <Footer/>
   </div>
 
  )
}

export default Heropage
