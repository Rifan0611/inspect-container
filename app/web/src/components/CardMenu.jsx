export default function CardMenu({title,subtitle,onClick}){

  return(

    <div
    onClick={onClick}
    style={{
      background:'#fff',
      padding:20,
      borderRadius:20,
      marginTop:20,
      boxShadow:'0 2px 10px rgba(0,0,0,0.1)',
      cursor:'pointer'
    }}>

      <h3>{title}</h3>

      <p>{subtitle}</p>

    </div>
  )
}