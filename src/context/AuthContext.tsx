import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { phoneToAuthEmail } from '../utils/phone'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (phone: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)

      if (currentUser) {
        const phone = currentUser.email?.split('@')[0] ?? ''
        void setDoc(
          doc(db, 'users', currentUser.uid),
          {
            displayName: currentUser.displayName ?? '',
            phone,
          },
          { merge: true },
        )
      }
    })
    return unsubscribe
  }, [])

  const login = async (phone: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence)
    await signInWithEmailAndPassword(auth, phoneToAuthEmail(phone), password)
  }

  const register = async (
    phone: string,
    password: string,
    displayName: string,
  ) => {
    await setPersistence(auth, browserLocalPersistence)
    const normalizedPhone = phoneToAuthEmail(phone).split('@')[0]
    const credential = await createUserWithEmailAndPassword(
      auth,
      phoneToAuthEmail(phone),
      password,
    )
    await updateProfile(credential.user, { displayName })
    await setDoc(doc(db, 'users', credential.user.uid), {
      displayName,
      phone: normalizedPhone,
      createdAt: new Date().toISOString(),
    })
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
