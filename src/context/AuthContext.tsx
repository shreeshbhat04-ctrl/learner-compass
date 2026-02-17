import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateStreak } from "@/services/progressService";

type BranchType = "cse" | "ece";

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  branch: BranchType;
  photoURL: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, branch: BranchType) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore with error handling
        let userData = null;
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          userData = userDoc.data();
        } catch (dbError: any) {
          console.warn("Firestore read failed (likely due to security rules or billing). Using default values.", dbError.message);
          // Continue with default values if Firestore read fails
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          branch: userData?.branch || "cse", // Default to CSE if not set
          photoURL: firebaseUser.photoURL,
        });

        // Update streak on login
        try {
          updateStreak(firebaseUser.uid);
        } catch (error) {
          console.warn("Failed to update streak:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Firebase Login Error:", error.code, error.message);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, branch: BranchType) => {
    try {
      console.log("Starting signup...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Auth successful, user created:", user.uid);

      // Update profile with display name
      await updateProfile(user, { displayName: name });
      console.log("Profile updated");

      // Create user document in Firestore - Try/Catch to avoid blocking on billing errors
      try {
        console.log("Attempting to write to Firestore...");
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          branch: branch,
          photoURL: user.photoURL,
        });
        console.log("Firestore write successful");
      } catch (dbError: any) {
        console.warn("Firestore write failed (likely due to billing). Proceeding with Auth only.", dbError.message);
        // We do NOT throw here, allowing the signup to 'succeed' from the UI perspective
        // The user will just use default values until billing is enabled.
      }
    } catch (error: any) {
      console.error("Firebase Signup Error:", error.code, error.message);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
