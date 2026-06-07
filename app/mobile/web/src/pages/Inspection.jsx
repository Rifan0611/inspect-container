import { useState } from 'react'

import axios from 'axios'

export default function Inspection(){

  const [containerNumber,
  setContainerNumber] = useState('')

  const [conditionStatus,
  setConditionStatus] = useState('')

  const saveInspection = async()=>{

    const token =
    localStorage.getItem('token')

    await axios.post(
      'http://localhost:8000/api/inspection/create',
      {
        container_number:
        containerNumber,

        condition_status:
        conditionStatus,

        container_side:'Front',

        notes:'Container damaged',

        latitude:'0',

        longitude:'0',

        photo:'photo.jpg'
      },
      {
        headers:{
          Authorization:token
        }
      }
    )

    alert('Inspection Saved')
  }

  return(

    <div className='min-h-screen bg-slate-950 text-white p-10'>

      <h1 className='text-4xl font-bold'>
        New Inspection
      </h1>

      <input
        className='border border-slate-700 bg-slate-900 p-4 rounded-xl w-full mt-5'
        placeholder='Container Number'
        onChange={(e)=>
        setContainerNumber(e.target.value)}
      />

      <select
        className='border border-slate-700 bg-slate-900 p-4 rounded-xl w-full mt-5'
        onChange={(e)=>
        setConditionStatus(e.target.value)}
      >
        <option>Dented</option>
        <option>Broken</option>
        <option>Rust</option>
      </select>

      <button
        onClick={saveInspection}
        className='bg-blue-900 text-white p-4 rounded-xl mt-5'
      >
        SAVE INSPECTION
      </button>

    </div>
  )
}