import { useState, useEffect, useCallback, useRef } from "react";

// TypeScript interfaces for Puter.js
interface PuterUser {
  uuid: string;
  username: string;
}

interface PuterFile {
  id: string;
  name: string;
  size: number;
  type: string;
  created_at: string;
  modified_at: string;
  path: string;
  is_dir: boolean;
  parent_id?: string;
}

interface PuterDirectory {
  id: string;
  name: string;
  path: string;
  created_at: string;
  modified_at: string;
  parent_id?: string;
}

interface PuterUploadOptions {
  onProgress?: (progress: number) => void;
  onComplete?: (file: PuterFile) => void;
  onError?: (error: Error) => void;
}

interface PuterDownloadOptions {
  onProgress?: (progress: number) => void;
  onComplete?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

// Global Puter instance type to get rid of errors
declare global {
  interface Window {
    puter: {
      auth: {
        getUser: () => Promise<PuterUser>;
        isSignedIn: () => Promise<boolean>;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
      };
    };
  }
}

interface UsePuterState {
  isLoading: boolean;
  error: string | null;
}

interface PuterAuth {
  user: PuterUser | null;
  isAuthenticated: boolean;
  getUser: () => PuterUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

interface UsePuterReturn extends UsePuterState {
  puter: typeof window.puter | null;
  auth: PuterAuth;
  clearError: () => void;
}

export function usePuter(): UsePuterReturn {
  const [state, setState] = useState<UsePuterState>({
    isLoading: true,
    error: null,
  });

  // Auth state
  const [user, setUser] = useState<PuterUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const puterRef = useRef<typeof window.puter | null>(null);

  // Check if Puter.js is loaded
  const checkPuterLoaded = useCallback(() => {
    return typeof window !== "undefined" && window.puter;
  }, []);

  // Check authentication status and fetch user
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    if (!puterRef.current) {
      setState((prev) => ({ ...prev, error: "Puter.js not available" }));
      return false;
    }

    try {
      setState((prev) => ({ ...prev, error: null, isLoading: true }));

      const isSignedIn = await puterRef.current.auth.isSignedIn();
      //   console.log("Auth status check:", isSignedIn);

      if (isSignedIn) {
        const userData = await puterRef.current.auth.getUser();
        setUser(userData);
        setIsAuthenticated(true);
        setState((prev) => ({ ...prev, isLoading: false }));
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setState((prev) => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check auth status";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Sign in function
  const signIn = useCallback(async (): Promise<void> => {
    if (!puterRef.current) {
      setState((prev) => ({ ...prev, error: "Puter.js not available" }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, error: null, isLoading: true }));

      await puterRef.current.auth.signIn();
      console.log("Signed in successfully!");

      // Refresh user data after sign in
      await checkAuthStatus();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign in failed";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      console.error("Sign in failed:", err);
    }
  }, [checkAuthStatus]);

  // Sign out function
  const signOut = useCallback(async (): Promise<void> => {
    if (!puterRef.current) {
      setState((prev) => ({ ...prev, error: "Puter.js not available" }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, error: null, isLoading: true }));

      await puterRef.current.auth.signOut();
      console.log("Signed out successfully!");

      // Clear user data after sign out
      setUser(null);
      setIsAuthenticated(false);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign out failed";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      console.error("Sign out failed:", err);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!puterRef.current) {
      setState((prev) => ({ ...prev, error: "Puter.js not available" }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, error: null, isLoading: true }));
      const userData = await puterRef.current.auth.getUser();
      setUser(userData);
      setIsAuthenticated(true);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh user";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Get current user (synchronous)
  const getUser = useCallback((): PuterUser | null => {
    return user;
  }, [user]);

  // Initialize Puter and check authentication
  const initializePuter = useCallback(async () => {
    try {
      if (!checkPuterLoaded()) {
        throw new Error(
          "Puter.js is not loaded. Please ensure the script is included."
        );
      }

      puterRef.current = window.puter;

      // Check authentication status after initialization
      await checkAuthStatus();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to initialize Puter",
        isLoading: false,
      }));
    }
  }, [checkPuterLoaded, checkAuthStatus]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Wait for Puter.js to load
      if (checkPuterLoaded()) {
        await initializePuter();
      } else {
        // Poll for Puter.js to load
        const interval = setInterval(async () => {
          if (checkPuterLoaded()) {
            clearInterval(interval);
            await initializePuter();
          }
        }, 100);

        // Cleanup after 10 seconds
        setTimeout(() => {
          clearInterval(interval);
          if (!checkPuterLoaded()) {
            setState((prev) => ({
              ...prev,
              error: "Puter.js failed to load within 10 seconds",
              isLoading: false,
            }));
          }
        }, 10000);
      }
    };

    init();
  }, [checkPuterLoaded, initializePuter]);

  // Create auth object
  const auth: PuterAuth = {
    user,
    isAuthenticated,
    getUser,
    signIn,
    signOut,
    checkAuthStatus,
    refreshUser,
  };

  return {
    ...state,
    puter: puterRef.current,
    auth,
    clearError,
  };
}

// Export types for external use
export type {
  PuterUser,
  PuterFile,
  PuterDirectory,
  PuterUploadOptions,
  PuterDownloadOptions,
};
