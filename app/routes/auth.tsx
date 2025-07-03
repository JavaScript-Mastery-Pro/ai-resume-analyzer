import React, { useEffect, useState } from "react";
import { usePuter, type PuterUser } from "../lib/puter";

const AuthPage = () => {
  const { auth, isLoading, error, clearError } = usePuter();

  // Handle loading state
  if (isLoading) return <div>Loading...</div>;

  // Handle error state
  if (error) {
    return (
      <div>
        <div>Error: {error}</div>
        <button
          onClick={clearError}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Clear Error
        </button>
      </div>
    );
  }

  const user = auth.getUser();

  return (
    <div>
      <h1>Puter.js Integration</h1>

      <div className="flex flex-wrap gap-8">
        {!auth.isAuthenticated ? (
          <button
            onClick={auth.signIn}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Sign In
          </button>
        ) : (
          <button
            onClick={auth.signOut}
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
