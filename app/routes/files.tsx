import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const FilesPage = () => {
  const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);

  const loadFiles = async () => {
    const keys = await kv.list("*", true);
    console.log("keys", keys);
    console.log("loading files");
    const files = (await fs.readDir("./")) as FSItem[];
    console.log("files", files);
    const filesWithExtensions = files.map(async (file) => {
      const extension = file.path.split(".").pop();
      let url = "";
      const blob = await fs.read(file.path);
      if (!blob) return file;
      const typedBlob = new Blob([blob], { type: "application/pdf" });
      url = URL.createObjectURL(typedBlob);
      return { ...file, extension, url };
    });
    setFiles(await Promise.all(filesWithExtensions));
  };

  useEffect(() => {
    console.log("starting load files");
    loadFiles();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/files");
    }
  }, [isLoading]);

  const handleDelete = async (path: string) => {
    await fs.delete(path);
    loadFiles();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error {error}</div>;
  }

  return (
    <div>
      Authenticated as: {auth.user?.username}
      <div className="flex flex-col gap-4">
        {files.map((file) => (
          <div key={file.id} className="flex flex-row gap-4">
            <p>{file.name}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={() => handleDelete(file.path)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={() => kv.flush()}
        >
          Flush kv
        </button>
      </div>
    </div>
  );
};

export default FilesPage;
