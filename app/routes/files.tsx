import React, { useEffect } from "react";
import { usePuter } from "~/lib/puter";
import { useNavigate } from "react-router";

const FilesPage = () => {
  const { auth, isLoading, error, clearError } = usePuter();
  const navigate = useNavigate();
  const user = auth.getUser();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error {error}</div>;
  }

  return (
    <div>
      Authenticated as: {user?.username}
      <div>Files will show up here</div>
    </div>
  );
};

export default FilesPage;
