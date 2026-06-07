import api from './api'

export const getInspection =
async()=>{

  return await api.get(
    '/inspection'
  )
}