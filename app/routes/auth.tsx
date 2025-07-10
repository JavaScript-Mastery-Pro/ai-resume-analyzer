import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "../lib/puter";

const AuthPage = () => {
  const { auth, isLoading, error, clearError } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1];
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated && next) {
      navigate(next);
    }
  }, [auth.isAuthenticated, next]);

  return (
    <main className="relative bg-[url('/images/bg-auth.svg')] bg-cover bg-center">
      <section className="flex flex-col items-center gap-8 pt-12 h-screen">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-6xl font-bold text-gradient">Welcome Back</h1>
          <h2 className="text-3xl text-dark-200">
            Log In to Continue Your Job Journey
          </h2>
        </div>
        <div className="flex flex-col items-center gap-2 mt-40">
          {isLoading ? (
            <button className="primary-gradient rounded-full py-4 px-8 cursor-pointer w-[600px] animate-pulse">
              <p className="text-3xl font-semibold text-white">
                Signing You In...
              </p>
            </button>
          ) : (
            <>
              {auth.isAuthenticated ? (
                <button
                  className="primary-gradient rounded-full py-4 px-8 cursor-pointer w-[600px]"
                  onClick={auth.signOut}
                >
                  <p className="text-white text-3xl font-semibold">Log Out</p>
                </button>
              ) : (
                <button
                  className="primary-gradient rounded-full py-4 px-8 cursor-pointer w-[600px]"
                  onClick={auth.signIn}
                >
                  <p className="text-white text-3xl font-semibold">Log In</p>
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
