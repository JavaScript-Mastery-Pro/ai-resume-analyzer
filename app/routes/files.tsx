import { useEffect } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const FilesPage = () => {
  const { user, isAuthenticated, isLoading, error, clearError } =
    usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading]);

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
