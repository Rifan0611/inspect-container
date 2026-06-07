import { useState } from 'react'
import api from '../services/api'

export default function DamagePhoto(){

  const [photo,setPhoto] = useState(null)

  const [preview,setPreview] = useState(null)

  const handleImage = (e)=>{

    const file = e.target.files[0]

    setPhoto(file)

    setPreview(URL.createObjectURL(file))
  }

  const uploadImage = async()=>{

    try{

      const formData = new FormData()

      formData.append('photo',photo)

      await api.post(
        '/upload/image',
        formData
      )

      alert('UPLOAD SUCCESS')

    }catch(error){

      console.log(error)

      alert('UPLOAD FAILED')
    }
  }

  return(

    <div style={{padding:20}}>

      <h2>Damage Photo</h2>

      <input
      type='file'
      onChange={handleImage}
      />

      {
        preview && (

          <img
          src={preview}
          width='100%'
          style={{marginTop:20,borderRadius:20}}
          />
        )
      }

      <button
      onClick={uploadImage}
      style={{
        width:'100%',
        padding:15,
        marginTop:20,
        background:'#ff6b00',
        color:'#fff',
        border:'none',
        borderRadius:10
      }}>

        SAVE PHOTO

      </button>

    </div>
  )
}