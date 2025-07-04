import React, { useEffect, useState } from "react";
import { usePuter } from "~/lib/puter";
import { useNavigate } from "react-router";

const FilesPage = () => {
  const { auth, isLoading, error, clearError, puter } = usePuter();
  const navigate = useNavigate();
  const user = auth.getUser();
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  useEffect(() => {
    if (!puter) return;
    const readdir = async () => {
      const files = await puter.fs.readdir("./");
      console.log(files);
      setFiles(files);
    };
    readdir();
  }, [puter]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    const result = await puter.fs.upload(file);
    console.log(result);
    setFiles([...files, result.name]);
  };

  const handleDownload = async (file: { path: string }) => {
    // Read file content as a Blob
    const blob = await puter.fs.read(file.path);

    // Create a Blob URL
    const url = URL.createObjectURL(blob);

    // Create a temporary <a> element to trigger the download
    const a = document.createElement("a");
    a.href = url;

    // Use the file name from the path
    const filename = file.path.split("/").pop() || "downloaded-file";
    a.download = filename;

    // Append to the DOM, trigger click, then clean up
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // free memory
  };

  const handleDelete = async (file: { path: string }) => {
    await puter?.fs.delete(file.path);
    setFiles(files.filter((f) => f !== file.path));
    console.log("file deleted");
  };

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
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={() => handleUpload(file)}>Upload</button>
      <div>
        Files list:
        <div className="flex flex-col gap-2">
          {files.map((file) => (
            <div className="flex gap-2" key={file.id}>
              <button onClick={() => handleDownload(file)}>{file.name}</button>
              <button onClick={() => handleDelete(file)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilesPage;
