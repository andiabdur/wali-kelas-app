import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { auth, firestore } from '../lib/firebase'
import type { UserProfile } from '../types/auth'
import { useStore } from '../store/useStore'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  role: 'admin' | 'walikelas' | null
  loading: boolean
  activeKelasId: string
  setActiveKelasId: (id: string) => void
  login: (email: string, pass: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeKelasId, setActiveKelasIdState] = useState<string>(() => {
    return localStorage.getItem('activeKelasId') || 'kelas_v'
  })

  const setActiveKelasId = (id: string) => {
    if (profile?.role === 'walikelas') {
      if (profile.kelasId) {
        setActiveKelasIdState(profile.kelasId)
        localStorage.setItem('activeKelasId', profile.kelasId)
      }
      return
    }
    setActiveKelasIdState(id)
    localStorage.setItem('activeKelasId', id)
  }

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // Listen to user profile from Firestore
        const userDocRef = doc(firestore, 'users', currentUser.uid)
        const unsubscribeProfile = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile
            setProfile(data)
            if (data.role === 'walikelas') {
              const assignedKelas = data.kelasId || ''
              setActiveKelasIdState(assignedKelas)
              localStorage.setItem('activeKelasId', assignedKelas)
            }
          } else {
            // Fallback profile if doc doesn't exist yet
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email || '',
              nama: currentUser.displayName || currentUser.email?.split('@')[0] || 'Pengguna',
              role: 'walikelas',
              kelasId: 'kelas_v',
            })
          }
          setLoading(false)
        }, (error) => {
          console.error('Failed to load user profile:', error)
          setLoading(false)
        })

        return () => unsubscribeProfile()
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => unsubscribeAuth()
  }, [])

  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass)
    setUser(cred.user)
    const snap = await getDoc(doc(firestore, 'users', cred.user.uid))
    if (snap.exists()) {
      const data = snap.data() as UserProfile
      setProfile(data)
      if (data.role === 'walikelas') {
        const assignedKelas = data.kelasId || ''
        setActiveKelasIdState(assignedKelas)
        localStorage.setItem('activeKelasId', assignedKelas)
      }
    }
  }

  const logout = async () => {
    useStore.getState().resetPage()
    await signOut(auth)
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || null,
        loading,
        activeKelasId,
        setActiveKelasId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      profile: null,
      role: null,
      loading: false,
      activeKelasId: 'kelas_v',
      setActiveKelasId: () => {},
      login: async () => {},
      logout: async () => {},
    }
  }
  return context
}
