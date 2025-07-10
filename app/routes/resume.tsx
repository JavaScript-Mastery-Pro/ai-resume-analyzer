import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ATS from "~/components/feebdack/ATS";
import Details from "~/components/feebdack/Details";
import Summary from "~/components/feebdack/Summary";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import type { Route } from "./+types/resume";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | Upload Resume" },
    { name: "description", content: "Upload your resume to get feedback" },
  ];
}

const ResumePage = () => {
  const { id } = useParams();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const { auth, isLoading, fs, kv } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);
      if (!resume) return;
      const data = JSON.parse(resume);
      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;
      const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl);
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
      setFeedback(data.feedback);
    };
    loadResume();
  }, [id]);

  return (
    <main className="pt-10 min-h-screen">
      <Navbar />
      <div className="flex flex-row w-full">
        <section className="sticky top-0 min-h-screen flex flex-col items-center gap-8 pt-12  w-1/2 px-5 bg-[url('/images/bg-smol.svg')] bg-cover">
          <div className="bg-blue-200/40 p-2 rounded-2xl mx-10">
            <div className="w-full h-full rounded-2xl p-2 ">
              {imageUrl && resumeUrl && (
                <a href={resumeUrl} target="_blank">
                  <img
                    src={imageUrl}
                    alt="candidate"
                    className="w-full h-full object-contain"
                  />
                </a>
              )}
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-8 pt-12  w-1/2 px-8 py-10">
          <h2 className="text-4xl font-bold">Resume Review</h2>
          {feedback && (
            <div className="flex flex-col gap-8">
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.tips || []}
              />
              <Details feedback={feedback} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ResumePage;
