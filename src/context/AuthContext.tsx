import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  branch: string; // Branch ID: "ece", "cse", "ee", etc.
  avatar?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, branch: string) => Promise<void>;
  logout: () => Promise<void>;
  changeBranch: (branchId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("learnpath_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("learnpath_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - in production, call your API
      const mockUser: User = {
        id: "user_" + Date.now(),
        name: email.split("@")[0],
        email,
        branch: "cse", // Default branch
        createdAt: new Date(),
      };
      
      setUser(mockUser);
      localStorage.setItem("learnpath_user", JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, branch: string) => {
    setIsLoading(true);
    try {
      // Mock signup - in production, call your API
      const newUser: User = {
        id: "user_" + Date.now(),
        name,
        email,
        branch,
        createdAt: new Date(),
      };
      
      setUser(newUser);
      localStorage.setItem("learnpath_user", JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("learnpath_user");
  };

  const changeBranch = async (branchId: string) => {
    if (user) {
      const updatedUser = { ...user, branch: branchId };
      setUser(updatedUser);
      localStorage.setItem("learnpath_user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    changeBranch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
