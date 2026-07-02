import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        // Otorga permisos de admin de forma segura o si es el correo de prueba
        const isAdminUser = !!tokenResult.claims.admin || firebaseUser.email === 'admin@teamespe.com';
        setIsAdmin(isAdminUser);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  const register = useCallback(async (email, password, displayName, universityId) => {
    // Verificar si el ID de la universidad ya está registrado
    if (universityId) {
      const q = query(collection(db, 'users'), where('universityId', '==', universityId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const error = new Error('El ID de la universidad ya está registrado en otra cuenta.');
        error.code = 'custom/university-id-already-in-use';
        throw error;
      }
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      displayName,
      email,
      universityId: universityId || '',
      nick: '',
      teamName: '',
      roleVisible: 'player',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return credential;
  }, []);

  const logout = useCallback(async () => {
    return signOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
