import { useEffect, useState } from "react";
import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import ScoreCircle from "./ScoreCircle";

const ResumeCard = ({ resume }: { resume: Resume }) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(resume.imagePath);
      if (!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };
    loadResume();
    setScore(resume.feedback.overallScore);
  }, [resume.imagePath]);
  return (
    <Link
      to={`/resume/${resume.id}`}
      className="flex flex-col gap-8 max-w-2xl bg-white rounded-2xl p-4 w-full"
    >
      <div className="flex flex-row gap-2 justify-between min-h-[110px]">
        <div className="flex-1 min-w-0">
          {resume.companyName && (
            <h2 className="text-2xl font-bold break-words">
              {resume.companyName}
            </h2>
          )}
          {resume.jobTitle && (
            <h3 className="text-lg text-gray-500 break-words">
              {resume.jobTitle}
            </h3>
          )}
          {!resume.companyName && !resume.jobTitle && (
            <h2 className="text-2xl font-bold">Resume</h2>
          )}
        </div>
        <div className="flex-shrink-0">
          <ScoreCircle score={score} />
        </div>
      </div>
      <div className="gradient-border p-4 rounded-2xl">
        <div className=" w-full h-full">
          {resumeUrl && (
            <img
              src={resumeUrl}
              alt="resume"
              className="w-full h-[350px] object-cover object-top"
            />
          )}
        </div>
      </div>
    </Link>
  );
};

export default ResumeCard;
