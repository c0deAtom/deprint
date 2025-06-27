"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    console.log("useAdminAuth: Token found:", !!token);
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwt.decode(token) as JWTPayload | null;
      console.log("useAdminAuth: Decoded token:", decoded);
      
      if (decoded && decoded.role === "admin" && decoded.exp && Date.now() < decoded.exp * 1000) {
        console.log("useAdminAuth: Token valid, setting user");
        setUser({ id: decoded.id, email: decoded.email, role: decoded.role });
      } else {
        console.log("useAdminAuth: Token invalid, removing from localStorage");
        localStorage.removeItem("adminToken");
      }
    } catch (error) {
      console.log("useAdminAuth: Error decoding token:", error);
      localStorage.removeItem("adminToken");
    }
    
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("adminToken");
    setUser(null);
    router.push("/admin/login");
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    user,
    loading,
    logout,
    getAuthHeaders,
    isAuthenticated: !!user,
  };
} 