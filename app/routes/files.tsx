import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const FilesPage = () => {
  const { auth, isLoading, error, clearError, fs } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);

  const loadFiles = async () => {
    const files = (await fs.readDir("./")) as FSItem[];
    const filesWithExtensions = files.map(async (file) => {
      const extension = file.path.split(".").pop();
      let url = "";
      if (extension === "pdf") {
        const blob = await fs.read(file.path);
        if (!blob) return file;
        const typedBlob = new Blob([blob], { type: "application/pdf" });
        url = URL.createObjectURL(typedBlob);
        url += "#toolbar=0&navpanes=0"; //hide toolbar and navpanes
      }
      return { ...file, extension, url };
    });
    setFiles(await Promise.all(filesWithExtensions));
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading]);

  const handleUpload = async () => {
    if (!newFile) return;
    await fs.upload([newFile]);
    setNewFile(null);
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
      <div>Upload a new file</div>
      <input
        type="file"
        onChange={(e) => setNewFile(e.target.files?.[0] || null)}
        className="border border-gray-300 rounded-md p-2"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Upload
      </button>
      <div>Files will show up here</div>
      <div className="flex flex-wrap gap-4">
        {files.map((file) => (
          <div key={file.id}>
            {file.name} || {file.extension}
            {file.extension === "pdf" && (
              <iframe
                src={file.url}
                width="300px"
                height="450"
                title={file.name}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilesPage;
