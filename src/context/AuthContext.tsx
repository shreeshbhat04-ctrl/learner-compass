import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { safeStorage } from "@/lib/safeStorage";
import { getLearnerDnaSummary } from "@/services/learnerProfileService";
import {
  clearStoredLearnerInsight,
  ensureLearnerInsight,
} from "@/services/learnerInsightService";

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

const stableUserId = (email: string) =>
  `user_${email.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const warmLearnerInsight = useCallback(async (candidate: User) => {
    try {
      const dna = getLearnerDnaSummary(candidate.id, candidate.branch);
      await ensureLearnerInsight(candidate, dna);
    } catch (error) {
      console.warn("Failed to warm learner insight", error);
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = safeStorage.getItem("learnpath_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as Partial<User> & { createdAt?: string | Date };
        if (typeof parsedUser.id === "string" && typeof parsedUser.email === "string") {
          const hydratedUser: User = {
            id: parsedUser.id,
            name: parsedUser.name ?? parsedUser.email.split("@")[0],
            email: parsedUser.email,
            branch: parsedUser.branch ?? "cse",
            avatar: parsedUser.avatar,
            createdAt: parsedUser.createdAt ? new Date(parsedUser.createdAt) : new Date(),
          };
          setUser(hydratedUser);
          void warmLearnerInsight(hydratedUser);
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        safeStorage.removeItem("learnpath_user");
      }
    }
    setIsLoading(false);
  }, [warmLearnerInsight]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - in production, call your API
      const mockUser: User = {
        id: stableUserId(email),
        name: email.split("@")[0],
        email,
        branch: "cse", // Default branch
        createdAt: new Date(),
      };
      
      setUser(mockUser);
      safeStorage.setItem("learnpath_user", JSON.stringify(mockUser));
      void warmLearnerInsight(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, branch: string) => {
    setIsLoading(true);
    try {
      // Mock signup - in production, call your API
      const newUser: User = {
        id: stableUserId(email),
        name,
        email,
        branch,
        createdAt: new Date(),
      };
      
      setUser(newUser);
      safeStorage.setItem("learnpath_user", JSON.stringify(newUser));
      void warmLearnerInsight(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const userId = user?.id;
    setUser(null);
    safeStorage.removeItem("learnpath_user");
    if (userId) {
      clearStoredLearnerInsight(userId);
    }
  };

  const changeBranch = async (branchId: string) => {
    if (user) {
      const updatedUser = { ...user, branch: branchId };
      setUser(updatedUser);
      safeStorage.setItem("learnpath_user", JSON.stringify(updatedUser));
      void warmLearnerInsight(updatedUser);
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
