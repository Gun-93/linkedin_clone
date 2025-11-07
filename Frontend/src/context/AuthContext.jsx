import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const fetchMe = async () => {
        try {
            const { data } = await api.get('/api/users/me')
            setUser(data)
        } catch (e) {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) fetchMe()
        else setLoading(false)
    }, [])


    const login = async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password })
        localStorage.setItem('token', data.token)
        await fetchMe()
        navigate('/feed')
    }
    const register = async (name, email, password) => {
        await api.post('/api/auth/register', { name, email, password })
        // After register, force login flow
        await login(email, password)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        navigate('/login')
    }
    const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading])
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() {
    return useContext(AuthContext)
}