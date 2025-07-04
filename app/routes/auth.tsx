import { usePuterStore } from "../lib/puter";

const AuthPage = () => {
  const {
    isAuthenticated,
    user,
    signOut,
    signIn,
    isLoading,
    error,
    clearError,
  } = usePuterStore();

  return (
    <div>
      <h1>Puter.js Integration</h1>

      {isLoading && <p>Loading...</p>}
      {error && (
        <div>
          <div>Error: {error}</div>
          <button
            onClick={clearError}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Clear Error
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-8">
        {!isAuthenticated ? (
          <button
            onClick={signIn}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Sign In
          </button>
        ) : (
          <button
            onClick={signOut}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        )}
      </div>

      <div className="mt-4">
        <strong>User:</strong> {user ? user.username : "Not signed in"}
      </div>

      {user && (
        <div className="mt-2 text-sm text-gray-600">
          <p>UUID: {user.uuid}</p>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
