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
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { deleteApp, getApps, initializeApp } from 'firebase/app'
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, firebaseConfig } from '../firebase/config'
import { isValidVietnamesePhone, phoneToAuthEmail } from '../utils/phone'

interface RegisterData {
  displayName: string
  storeName: string
  address: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (
    phone: string,
    password: string,
    data: RegisterData,
  ) => Promise<void>
  createEmployee: (data: {
    storeId: string
    displayName: string
    phone: string
    password: string
  }) => Promise<void>
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
    data: RegisterData,
  ) => {
    await setPersistence(auth, browserLocalPersistence)
    const normalizedPhone = phoneToAuthEmail(phone).split('@')[0]
    const credential = await createUserWithEmailAndPassword(
      auth,
      phoneToAuthEmail(phone),
      password,
    )
    await updateProfile(credential.user, { displayName: data.displayName })
    const storeRef = await addDoc(collection(db, 'stores'), {
      ownerId: credential.user.uid,
      name: data.storeName.trim(),
      phone: normalizedPhone,
      address: data.address.trim(),
      status: 'active',
      createdAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'users', credential.user.uid), {
      displayName: data.displayName,
      phone: normalizedPhone,
      role: 'owner',
      storeId: storeRef.id,
      createdAt: new Date().toISOString(),
    })
  }

  const createEmployee = async ({
    storeId,
    displayName,
    phone,
    password,
  }: {
    storeId: string
    displayName: string
    phone: string
    password: string
  }) => {
    if (!isValidVietnamesePhone(phone)) {
      throw new Error('Số điện thoại không hợp lệ')
    }

    const secondaryAppName = `employee-${Date.now()}`
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName)
    const secondaryAuth = getAuth(secondaryApp)

    try {
      const credential = await createUserWithEmailAndPassword(
        secondaryAuth,
        phoneToAuthEmail(phone),
        password,
      )

      await updateProfile(credential.user, {
        displayName: displayName.trim(),
      })

      await setDoc(doc(db, 'users', credential.user.uid), {
        displayName: displayName.trim(),
        phone: phoneToAuthEmail(phone).split('@')[0],
        role: 'employee',
        storeId,
        createdAt: new Date().toISOString(),
      })
    } finally {
      await signOut(secondaryAuth).catch(() => undefined)
      if (getApps().some((app) => app.name === secondaryAppName)) {
        await deleteApp(secondaryApp).catch(() => undefined)
      }
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, createEmployee, logout }}
    >
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
