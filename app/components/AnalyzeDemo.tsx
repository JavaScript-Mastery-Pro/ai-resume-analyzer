import { useState } from "react";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

const AnalyzeDemo = ({ file }: { file: File }) => {
  const name = "John Doe";
  const [statusText, setStatusText] = useState<string>("Ready...");
  const [analysis, setAnalysis] = useState<string>("");

  const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    setStatusText("Uploading the file...");
    const uploadedFile = await fs.upload([file]);

    if (!uploadedFile) {
      setStatusText("Error: Failed to upload file");
      return;
    }

    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file);
    console.log(imageFile);
    console.log(imageFile.file);

    if (!imageFile.file) {
      setStatusText("Error: Failed to convert PDF to image");
      return;
    }

    setStatusText("Uploading the image...");
    const uploadedImage = await fs.upload([imageFile.file]);

    console.log("uploadedImage", uploadedImage);

    if (!uploadedImage) {
      setStatusText("Error: Failed to upload image");
      return;
    }

    setStatusText("Preparing data...");
    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      name: name,
      analysis: "",
    };
    console.log(data);
    await kv.set(`candidate:${uuid}`, JSON.stringify(data));

    setStatusText("Extracting text from image...");
    console.log("uploadedImage.path", uploadedImage.path);
    const resumeText = await ai.img2txt(uploadedImage.path, false);
    console.log("resumeText", resumeText);

    setStatusText("Analyzing...");
    const analysis = await ai.chat(
      `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      Analyze and rate the following resume. 
      Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
      You can mention things that are already good in the resume, so user can know what to keep.
      Provide the feedback using the following format:
      interface Feedback {
        overallScore: number;
        ATS: {
          score: number; //rate based on ATS suitability
          tips: {
            type: "good" | "improve";
            tip: string; //give 3-4 tips
          }[];
        };
        toneAndStyle: {
          score: number;
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        content: {
          score: number;
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        structure: {
          score: number;
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        skills: {
          score: number;
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
      }
      Return the analysis as an JSON object, without any other text. 
      The resume text is: ${resumeText}`
    );
    console.log(analysis);
    console.log("parsed");
    console.log(JSON.parse(analysis!.message.content));
    if (!analysis) {
      setStatusText("Error: Failed to analyze resume");
      return;
    }
    data.analysis = analysis.message.content;
    await kv.set(`candidate:${uuid}`, JSON.stringify(data));
    setStatusText("Analysis complete");
    setAnalysis(analysis.message.content);
    navigate(`/candidates/${uuid}`);
  };

  return (
    <div className="flex flex-col  gap-4">
      <button
        className="mx-auto w-fit primary-gradient text-white rounded-full px-4 py-2 cursor-pointer animate-in fade-in duration-500"
        onClick={handleAnalyze}
      >
        <p className="text-white text-2xl font-semibold">Analyze</p>
      </button>
      <p className="text-2xl font-semibold text-center text-gradient">
        {statusText}
      </p>
      {/* {analysis && <Markdown>{analysis}</Markdown>} */}
    </div>
  );
};

export default AnalyzeDemo;
