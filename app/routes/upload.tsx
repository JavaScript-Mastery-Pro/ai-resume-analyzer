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
    console.log(file);
    setFile(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
    const form = e.currentTarget.closest("form");
    console.log(form);
    if (!form) return;
    const formData = new FormData(form);
    console.log(formData);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;
    console.log(companyName, jobTitle, jobDescription);
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
      companyName: companyName,
      jobTitle: jobTitle,
      jobDescription: jobDescription,
      feedback: "",
    };
    console.log(data);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText("Extracting text from image...");
    console.log("uploadedImage.path", uploadedImage.path);
    const resumeText = await ai.img2txt(uploadedImage.path, false);
    console.log("resumeText", resumeText);

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
    console.log(feedback);
    console.log("parsed");
    console.log(JSON.parse(feedback!.message.content));
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
    <main className="bg-[url('/images/bg-main.svg')] bg-cover bg-center pt-10 min-h-screen py-10">
      <Navbar />
      <section className="flex flex-col items-center gap-8 pt-12 mx-15">
        <div className="flex flex-col items-center gap-8 max-w-2xl text-center">
          <h1 className="text-6xl font-bold text-gradient">
            Smart feedback for your dream job
          </h1>
          {isProcessing ? (
            <p className="text-2xl text-dark-200">{statusText}</p>
          ) : (
            <p className="text-2xl text-dark-200">
              Drop your resume below. We'll analyze it, give you an ATS score,
              and suggest ways to improve.
            </p>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              className="flex flex-col items-start gap-4 w-full"
              onSubmit={handleSubmit}
            >
              <label htmlFor="company-name">Company Name</label>
              <input
                type="text"
                name="company-name"
                placeholder="Company Name"
                className="inset-shadow rounded-2xl focus:outline-none w-full p-4 bg-white"
                id="company-name"
              />

              <label htmlFor="job-title">Job Title</label>
              <input
                type="text"
                name="job-title"
                placeholder="Job Title"
                className="inset-shadow rounded-2xl focus:outline-none w-full p-4 bg-white"
                id="job-title"
              />

              <label htmlFor="job-description">Job Description</label>
              <textarea
                name="job-description"
                id="job-description"
                placeholder="Job Description"
                className="w-full p-4 border border-gray-300  inset-shadow rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                rows={5}
              />

              <label htmlFor="job-description">Upload Resume</label>
              <FileUploader onFileSelect={handleFileSelect} />

              {file && (
                <button
                  className="primary-gradient text-white rounded-full px-4 py-2 cursor-pointer w-full"
                  type="submit"
                >
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
