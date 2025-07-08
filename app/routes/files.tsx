import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const FilesPage = () => {
  const { auth, isLoading, error, clearError, fs, ai } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(
    "analysis"
  );

  const loadFiles = async () => {
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
      if (extension === "pdf") {
        url += "#toolbar=0&navpanes=0"; //hide toolbar and navpanes
      }
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

  const handleUpload = async () => {
    if (!newFile) return;
    await fs.upload([newFile]);
    setNewFile(null);
    loadFiles();
  };

  const handleAnalyze = async (path: string) => {
    // const file = await fs.read(path);
    // if (!file) return;
    console.log("starting analysis");
    console.log("file path", path);
    // const result = await ai.img2txt(path, false);
    const result = await ai.chat(
      "Analyze the following resume and provide feedback on the resume. Be thorough and provide a detailed analysis:",
      `https://i.imgur.com/JT68J34.jpeg`,
      true,
      undefined
    );
    console.log("finished analysis");
    console.log("result", result);
    // setAnalysisResult(result || null);
  };

  const imgAnalyze = async (path: string) => {
    console.log("starting img analysis");
    console.log("path", path);
    const result = await ai.img2txt(path, false);
    console.log("finished analysis");
    console.log("result", result);
    const feedback = await ai.chat(
      `Analyze the following resume and provide feedback on the resume. Be thorough and provide a detailed analysis: ${result}`
    );
    console.log("feedback", feedback);
    // setAnalysisResult(result || null);
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
            <p>
              {file.name} || {file.extension}
            </p>
            {file.extension === "pdf" && (
              <iframe
                src={file.url}
                width="300px"
                height="450"
                title={file.name}
              />
            )}
            {file.extension === "png" ||
              (file.extension === "jpg" && (
                <img src={file.url} alt={file.name} />
              ))}
            {file.url}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={() => handleAnalyze(file.path)}
            >
              Analyze
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={() => imgAnalyze(file.path)}
            >
              img 2 txt
            </button>
            {analysisResult && <div>{analysisResult}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilesPage;
