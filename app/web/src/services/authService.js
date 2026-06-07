import api from './api'

export const loginUser =
async(data)=>{

  return await api.post(
    '/auth/login',
    data
  )
}