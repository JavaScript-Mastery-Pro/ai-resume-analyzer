import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useNavigate, useParams } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

const CandidatePage = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<any>(null);
  const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/candidates/${id}`);
    }
  }, [isLoading]);

  useEffect(() => {
    const loadCandidate = async () => {
      console.log("loading candidate", id);
      const candidate = await kv.get(`candidate:${id}`);
      console.log(candidate);
      if (!candidate) return;
      const data = JSON.parse(candidate);
      setCandidate(data);
      console.log(data);
      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;
      const resumeUrl = URL.createObjectURL(resumeBlob);
      setResumeUrl(resumeUrl);
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
    };
    loadCandidate();
  }, [id]);

  return (
    <main className="pt-10 min-h-screen">
      <Navbar />
      <div className="flex flex-row w-full">
        <section className="sticky top-0 h-screen flex flex-col items-center gap-8 pt-12  w-1/2 px-5 bg-gradient">
          <div className="bg-blue-200/40 p-2 rounded-2xl">
            <div className="w-full h-full rounded-2xl p-2 ">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="candidate"
                  className="w-full h-full object-cover "
                />
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-8  text-center"></div>
        </section>
        <section className="flex flex-col items-center gap-8 pt-12  w-1/2 px-5">
          <Markdown>{candidate?.analysis || "No analysis available"}</Markdown>
        </section>
      </div>
    </main>
  );
};

export default CandidatePage;
