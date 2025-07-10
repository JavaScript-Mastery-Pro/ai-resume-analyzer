import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ATS from "~/components/feebdack/ATS";
import Details from "~/components/feebdack/Details";
import Summary from "~/components/feebdack/Summary";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

const ResumePage = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<any>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      console.log("loading resume", id);
      const resume = await kv.get(`resume:${id}`);
      console.log(resume);
      if (!resume) return;
      const data = JSON.parse(resume);
      setCandidate(data);
      console.log(data);
      const resumeBlob = await fs.read(data.resumePath);
      const resumeFileName = data.resumePath.split("/").pop();
      setResumeFileName(resumeFileName);
      if (!resumeBlob) return;
      console.log("RESUME DEBUG ------------------");
      console.log("Resume blob type:", typeof resumeBlob);
      console.log("Resume blob constructor:", resumeBlob.constructor.name);
      console.log("Resume blob size:", resumeBlob.size);
      console.log("Resume blob type:", resumeBlob.type);
      console.log(
        "Resume blob instanceof ArrayBuffer:",
        resumeBlob instanceof ArrayBuffer
      );
      console.log(
        "Resume blob instanceof Uint8Array:",
        resumeBlob instanceof Uint8Array
      );

      // Read the blob as ArrayBuffer and create a new blob with correct PDF type
      const arrayBuffer = await resumeBlob.arrayBuffer();

      // Check if it's actually a PDF by looking at the first 4 bytes
      const uint8Array = new Uint8Array(arrayBuffer);
      const firstBytes = Array.from(uint8Array.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      console.log("First 4 bytes:", firstBytes);
      console.log(
        "Is PDF (should start with 25504446):",
        firstBytes === "25504446"
      );

      const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
      console.log("New PDF blob type:", pdfBlob.type);
      console.log("New PDF blob size:", pdfBlob.size);
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl);
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
      console.log("LOADING RESUME");
      // console.log(data.analysis);
      // console.log(JSON.parse(data.feedback));
      setFeedback(data.feedback);
    };
    loadResume();
  }, [id]);

  return (
    <main className="pt-10 min-h-screen">
      <Navbar />
      <div className="flex flex-row w-full">
        <section className="sticky top-0 h-screen flex flex-col items-center gap-8 pt-12  w-1/2 px-5 bg-[url('/images/bg-smol.svg')] bg-cover bg-center">
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
