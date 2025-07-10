import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

const UploadPage = () => {
  const { auth, isLoading, error, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [statusText, setStatusText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/upload");
    }
  }, [isLoading]);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;
    if (!file) {
      return;
    }
    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setStatusText("Uploading the file...");
    const uploadedFile = await fs.upload([file]);

    if (!uploadedFile) {
      setStatusText("Error: Failed to upload file");
      return;
    }

    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file);

    if (!imageFile.file) {
      setStatusText("Error: Failed to convert PDF to image");
      return;
    }

    setStatusText("Uploading the image...");
    const uploadedImage = await fs.upload([imageFile.file]);

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
      companyName: companyName,
      jobTitle: jobTitle,
      jobDescription: jobDescription,
      feedback: "",
    };
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText("Extracting text from image...");
    const resumeText = await ai.img2txt(uploadedImage.path, false);

    setStatusText("Analyzing...");
    const feedback = await ai.chat(
      `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      Analyze and rate the following resume. 
      Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
      You can mention things that are already good in the resume, so user can know what to keep.
      Take the job description into consideration.
      The job title is: ${jobTitle}
      The job description is: ${jobDescription}
      Provide the feedback using the following format:
      interface Feedback {
        overallScore: number; //max 100
        ATS: {
          score: number; //rate based on ATS suitability
          tips: {
            type: "good" | "improve";
            tip: string; //give 3-4 tips
          }[];
        };
        toneAndStyle: {
          score: number; //max 100
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        content: {
          score: number; //max 100
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        structure: {
          score: number; //max 100
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        skills: {
          score: number; //max 100
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

    if (!feedback) {
      setStatusText("Error: Failed to analyze resume");
      return;
    }
    data.feedback = JSON.parse(feedback.message.content);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analysis complete, redirecting...");
    navigate(`/resume/${uuid}`);
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <h2>{statusText}</h2>
          ) : (
            <h2>
              Drop your resume below. We'll analyze it, give you an ATS score,
              and suggest ways to improve.
            </h2>
          )}
          {!isProcessing && (
            <form id="upload-form" onSubmit={handleSubmit}>
              <label htmlFor="company-name">Company Name</label>
              <input
                type="text"
                name="company-name"
                placeholder="Company Name"
                id="company-name"
              />

              <label htmlFor="job-title">Job Title</label>
              <input
                type="text"
                name="job-title"
                placeholder="Job Title"
                id="job-title"
              />

              <label htmlFor="job-description">Job Description</label>
              <textarea
                name="job-description"
                id="job-description"
                placeholder="Job Description"
                rows={5}
              />

              <label htmlFor="job-description">Upload Resume</label>
              <FileUploader onFileSelect={handleFileSelect} />

              {file && (
                <button className="primary-button" type="submit">
                  Save & Analyze Resume
                </button>
              )}
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default UploadPage;
