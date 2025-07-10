import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import Navbar from "../components/Navbar";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [isLoading]);

  useEffect(() => {
    const loadResumes = async () => {
      const resumes = (await kv.list("resume:*", true)) as KVItem[];
      const parsedResumes = resumes?.map((resume) => {
        const data = JSON.parse(resume.value);
        return data as Resume;
      });
      setResumes(parsedResumes || []);
    };
    loadResumes();
  }, []);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover bg-center min-h-screen pt-10">
      <Navbar />
      <section className="flex flex-col items-center gap-8 pt-12 h-screen mx-15">
        <div className="flex flex-col items-center gap-8 max-w-2xl text-center">
          <h1 className="text-6xl font-bold text-gradient">
            Choose a Job to Analyze Your Resume
          </h1>
          <h2 className="text-3xl text-dark-200">
            Pick a role that matches your interest
          </h2>
        </div>
        {resumes.length > 0 && (
          <div className="grid grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
