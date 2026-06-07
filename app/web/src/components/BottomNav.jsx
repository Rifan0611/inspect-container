import { FaHome, FaCamera, FaHistory } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

export default function BottomNav(){

  const navigate = useNavigate()

  return(

    <div
    style={{
      position:'fixed',
      bottom:0,
      width:'100%',
      background:'#fff',
      display:'flex',
      justifyContent:'space-around',
      padding:15,
      boxShadow:'0 -2px 10px rgba(0,0,0,0.1)'
    }}>

      <FaHome
      size={25}
      onClick={()=>navigate('/dashboard')}
      />

      <FaCamera
      size={25}
      onClick={()=>navigate('/inspection')}
      />

      <FaHistory
      size={25}
      onClick={()=>navigate('/detail')}
      />

    </div>
  )
}