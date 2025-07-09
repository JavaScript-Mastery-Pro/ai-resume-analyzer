import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AnalyzeDemo from "~/components/AnalyzeDemo";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

const UploadPage = () => {
  const { auth, isLoading, error } = usePuterStore();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/upload");
    }
  }, [isLoading]);

  const handleFileSelect = (file: File | null) => {
    console.log(file);
    setFile(file);
  };

  return (
    <main className="bg-gradient pt-10 h-screen">
      <Navbar />
      <section className="flex flex-col items-center gap-8 pt-12 mx-15">
        <div className="flex flex-col items-center gap-8 max-w-2xl text-center">
          <h1 className="text-6xl font-bold text-gradient">
            Smart feedback for your dream job
          </h1>
          <p className="text-2xl text-dark-200">
            Drop your resume below. We'll analyze it, give you an ATS score, and
            suggest ways to improve.
          </p>
          <FileUploader onFileSelect={handleFileSelect} />
        </div>
        {file && <AnalyzeDemo file={file} />}
      </section>
    </main>
  );
};

export default UploadPage;
