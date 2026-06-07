import { useState } from 'react'

import axios from 'axios'

export default function Login(){

  const [email,setEmail] =
  useState('')

  const [password,setPassword] =
  useState('')

  const login = async()=>{

    const response =
    await axios.post(
      'http://localhost:8000/api/auth/login',
      {
        email,
        password
      }
    )

    localStorage.setItem(
      'token',
      response.data.token
    )

    window.location.href='/dashboard'
  }

  return(

    <div className='h-screen flex items-center justify-center bg-slate-950'>

      <div className='bg-slate-900 p-10 rounded-3xl w-[400px]'>

        <h1 className='text-white text-3xl font-bold'>
          INSPECT-CONTAINER
        </h1>

        <input
          className='w-full mt-5 p-4 rounded-xl'
          placeholder='Email'
          onChange={(e)=>
          setEmail(e.target.value)}
        />

        <input
          type='password'
          className='w-full mt-4 p-4 rounded-xl'
          placeholder='Password'
          onChange={(e)=>
          setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className='w-full bg-orange-500 mt-5 p-4 rounded-xl text-white'
        >
          LOGIN
        </button>

      </div>

    </div>
  )
}