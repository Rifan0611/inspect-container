import { motion } from 'framer-motion'

export default function DashboardCard({
  title,
  value
}){

  return(

    <motion.div

      className='bg-slate-900 p-6 rounded-3xl shadow-2xl'

      whileHover={{
        scale:1.05
      }}

    >

      <h1 className='text-slate-400 text-lg'>
        {title}
      </h1>

      <h2 className='text-5xl font-bold mt-3'>
        {value}
      </h2>

    </motion.div>
  )
}