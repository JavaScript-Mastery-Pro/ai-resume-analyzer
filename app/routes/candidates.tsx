import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import CandidateCard from "~/components/CandidateCard";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

const CandidatesPage = () => {
  const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
  const [candidates, setCandidates] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/candidates");
    }
  }, [isLoading]);

  useEffect(() => {
    const loadCandidates = async () => {
      const candidates = await kv.list("candidate:*", true);
      const parsedCandidates = candidates?.map((candidate) => {
        const data = JSON.parse(candidate.value);
        return data;
      });
      console.log(parsedCandidates);
      setCandidates(parsedCandidates || []);
    };
    loadCandidates();
  }, []);

  return (
    <main className="bg-gradient pt-10 min-h-screen">
      <Navbar />
      <section className="flex flex-col items-center gap-8 pt-12 mx-15">
        <div className="flex flex-col items-center gap-8 max-w-2xl text-center">
          <h1 className="text-6xl font-bold text-gradient">Candidates</h1>
        </div>
        {isLoading && (
          <div className="flex flex-col items-center gap-8">
            Loading the candidates...
          </div>
        )}
        {!isLoading && candidates.length === 0 && (
          <div className="flex flex-col items-center gap-8">
            No candidates yet...
          </div>
        )}
        <div className="grid grid-cols-3 gap-8 w-full">
          {candidates && (
            <>
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  id={candidate.id}
                  name={candidate.name}
                  imagePath={candidate.imagePath}
                />
              ))}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default CandidatesPage;
