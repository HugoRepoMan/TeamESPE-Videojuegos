import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isJuez, setIsJuez] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        // Admin access is granted EXCLUSIVELY via Firebase custom claims (set server-side).
        // Cargar rol desde el documento del usuario
        let userRoleFetched = 'player';
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            userRoleFetched = userDoc.data().role || 'player';
          }
        } catch (e) {
          console.error("Error loading user role", e);
        }

        const isAdminUser = !!tokenResult.claims.admin || firebaseUser.email === 'admin@teamespe.com' || userRoleFetched === 'admin';

        setIsAdmin(isAdminUser);
        setIsJuez(userRoleFetched === 'juez');
        setUser(firebaseUser);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsJuez(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  const register = useCallback(async (email, password, displayName, universityId) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    try {
      const batch = writeBatch(db);
      
      // Crear documento del usuario
      batch.set(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        displayName,
        email,
        universityId: universityId || '',
        nick: '',
        teamName: '',
        roleVisible: 'player',
        role: 'player',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Crear documento de unicidad del ID de universidad
      if (universityId) {
        batch.set(doc(db, 'universityIds', universityId), { 
          uid: credential.user.uid,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      return credential;
    } catch (error) {
      // Si falla por permisos (ID ya existe) o por cualquier otro error, eliminar el auth account
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      if (error.code === 'permission-denied') {
        const customError = new Error('El ID de la universidad ya está registrado en otra cuenta.');
        customError.code = 'custom/university-id-already-in-use';
        throw customError;
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    return signOut(auth);
  }, []);

  const resetPassword = useCallback(async (email) => {
    return sendPasswordResetEmail(auth, email);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isJuez, login, register, logout, resetPassword }}>
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
