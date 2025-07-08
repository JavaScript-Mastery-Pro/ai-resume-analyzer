import { useEffect } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import JobCard from "../components/JobCard";
import Navbar from "../components/Navbar";
import { jobs } from "../constants";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { auth, isLoading, error } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [isLoading]);
  return (
    <main className="bg-gradient min-h-screen pt-10">
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
        <div className="grid grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.title} job={job} />
          ))}
        </div>
      </section>
    </main>
  );
}
