import { useEffect,useState } from 'react'
import api from '../services/api'
import API_URL from '../config/api'

export default function DetailInspection(){

  const [data,setData] = useState([])

  useEffect(()=>{

    getData()

  },[])

  const getData = async()=>{

    const res = await api.get('/inspection/all')

    setData(res.data)
  }

  return(

    <div style={{padding:20}}>

      <h2>Inspection Detail</h2>

      {
        data.map((item,index)=>(

          <div
          key={index}
          style={{
            background:'#fff',
            padding:20,
            borderRadius:20,
            marginTop:20
          }}>

            <h3>{item.container_number}</h3>

            <p>{item.condition_status}</p>

            <img
            src={`${API_URL}/uploads/${item.photo}`}
            width='100%'
            style={{borderRadius:20}}
            />

          </div>
        ))
      }

    </div>
  )
}