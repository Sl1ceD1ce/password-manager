import './App.css'
import { Routes, Route } from 'react-router-dom'
import Layout from './Layout.jsx'
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import UserContextProvider from './UserContext.jsx'
import CreatePost from './pages/CreatePassword.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
function App() {

  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path={'/login'} element={<LoginPage />} />
          <Route path={'/register'} element={<RegisterPage />} />
          <Route path={'/create'} element={<CreatePost />} />
          <Route path={'/dashboard'} element={<DashboardPage />} />
        </Route>
      </Routes>
    </UserContextProvider >
  )
}

export default App
