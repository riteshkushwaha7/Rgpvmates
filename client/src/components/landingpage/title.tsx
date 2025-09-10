

type TitleProps = {
  size?: 'lg'
}

const Title = ({ size }: TitleProps) => {
  const isLarge = size === 'lg'
  const imgSize = isLarge ? 60 : 30
  const titleClass = isLarge ? 'text-4xl' : 'text-2xl'
  return (
    <div className='flex items-center '>
      <img
        src="/logo-bg-r.png"
        alt="RGPV mates logo"
        width={imgSize}
        height={imgSize}
       
      />
      <h1 className={`${titleClass} font-semibold tracking-tight font-grotesk text-base `}>
        RGPV<span className='font-pacifo'>mates</span>
      </h1>
    </div>
  )
}

export default Title