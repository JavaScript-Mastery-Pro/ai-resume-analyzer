import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "../lib/puter";
import type { Route } from "./+types/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | Authentication" },
    { name: "description", content: "Log in to your account" },
  ];
}

const AuthPage = () => {
  const { auth, isLoading } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1];
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated && next) {
      navigate(next);
    }
  }, [auth.isAuthenticated, next]);

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
      <section className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1>Welcome</h1>
          <h2>Log In to Continue Your Job Journey</h2>
        </div>
        <div>
          {isLoading ? (
            <button className="auth-button animate-pulse">
              <p>Signing You In...</p>
            </button>
          ) : (
            <>
              {auth.isAuthenticated ? (
                <button className="auth-button" onClick={auth.signOut}>
                  <p>Log Out</p>
                </button>
              ) : (
                <button className="auth-button" onClick={auth.signIn}>
                  <p>Log In</p>
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
