import { cn } from "~/lib/utils";
import ScoreGauge from "../ScoreGauge";

const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md w-full">
      <div className="flex flex-row items-center justify-center p-4 gap-4">
        <ScoreGauge score={feedback.overallScore} />
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Your Resume Score</h2>
          <p className="text-sm text-gray-500">
            This score is calculated based on the variables listed below.
          </p>
        </div>
      </div>
      <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
      <Category title="Content" score={feedback.content.score} />
      <Category title="Structure" score={feedback.structure.score} />
      <Category title="Skills" score={feedback.skills.score} />
    </div>
  );
};

export default Summary;

const Category = ({ title, score }: { title: string; score: number }) => {
  const textColor =
    score > 69
      ? "text-green-600"
      : score > 49
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="flex flex-row items-center justify-center p-4 gap-4">
      <div className="flex flex-row gap-2 items-center bg-gray-50 rounded-2xl p-4 w-full justify-between">
        <div className="flex flex-row gap-2 items-center justify-center">
          <p className="text-2xl">{title}</p>
          <ScoreBadge score={score} />
        </div>
        <p className="text-2xl ">
          <span className={cn(textColor)}>{score}</span>/100
        </p>
      </div>
    </div>
  );
};

const ScoreBadge = ({ score }: { score: number }) => {
  if (score > 69) {
    return (
      <div className="score-badge bg-green-200">
        <p className="text-xs text-green-700 font-semibold">Strong</p>
      </div>
    );
  }
  if (score >= 50) {
    return (
      <div className="score-badge bg-yellow-200">
        <p className="text-xs text-yellow-700 font-semibold">Good Start</p>
      </div>
    );
  }
  if (score < 50) {
    return (
      <div className="score-badge bg-red-200">
        <p className="text-xs text-red-700 font-semibold">Needs Work</p>
      </div>
    );
  }

  return (
    <div className="score-badge bg-red-200">
      <p className="text-xs text-red-700 font-semibold">{score}</p>
    </div>
  );
};
