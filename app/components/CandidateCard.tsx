import { useEffect, useState } from "react";
import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import ProgressCircle from "./ProgressCircle";

const CandidateCard = ({
  id,
  name,
  imagePath,
}: {
  id: string;
  name: string;
  imagePath: string;
}) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };
    loadResume();
  }, [imagePath]);
  return (
    <Link
      to={`/candidates/${id}`}
      className="flex flex-col gap-8 max-w-2xl bg-white rounded-2xl p-4 w-full"
    >
      <div className="flex flex-row gap-2 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{name}</h2>
          <h2 className="text-lg text-gray-500">2 Years of Experience</h2>
        </div>
        <ProgressCircle score={65} total={100} issues={19} />
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

export default CandidateCard;
