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
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading">
          <h1>Browse Your Resumes</h1>
          <h2>Click on a resume to view detailed feedback</h2>
        </div>
        {resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
