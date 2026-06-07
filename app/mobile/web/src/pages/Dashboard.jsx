import DashboardCard
from '../components/DashboardCard'

export default function Dashboard(){

  return(

    <div className='min-h-screen bg-slate-950 p-10 text-white'>

      <h1 className='text-5xl font-bold'>
        INSPECT-CONTAINER
      </h1>

      <p className='mt-3 text-slate-400'>
        Smart Container Inspection Dashboard
      </p>

      <div className='grid grid-cols-4 gap-5 mt-10'>

        <DashboardCard
          title='Total Inspection'
          value='120'
        />

        <DashboardCard
          title='Damage Container'
          value='45'
        />

        <DashboardCard
          title='Good Container'
          value='75'
        />

        <DashboardCard
          title='Active Inspector'
          value='12'
        />

      </div>

    </div>
  )
}