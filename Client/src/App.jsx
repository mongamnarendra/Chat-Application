import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import Signup from './pages/Signup'
import Login from './pages/Login'
import { Route, Routes } from 'react-router-dom'
import Chat from './pages/Chat'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Signup />} />
      <Route path='/chat' element={<Chat/>} />
    </Routes>
  )
}

export default App
