import { BrowserRouter, Routes, Route }
from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Inspection from './pages/Inspection'

export default function App(){

  return(

    <BrowserRouter>

      <Routes>

        <Route
          path='/'
          element={<Login/>}
        />

        <Route
          path='/dashboard'
          element={<Dashboard/>}
        />

        <Route
          path='/inspection'
          element={<Inspection/>}
        />

      </Routes>

    </BrowserRouter>
  )
}