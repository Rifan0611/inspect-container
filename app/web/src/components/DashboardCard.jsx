export default function DashboardCard({

  title,
  value

}){

  return(

    <div className='bg-slate-900 p-5 rounded-2xl'>

      <h1>{title}</h1>

      <h2 className='text-4xl'>
        {value}
      </h2>

    </div>
  )
}