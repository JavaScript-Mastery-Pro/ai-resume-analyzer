import { Link } from "react-router";

const NewJob = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;
    const jobLocation = formData.get("job-location") as string;
    console.log(jobTitle, jobDescription, jobLocation);
  };
  return (
    <main className="bg-gradient min-h-screen">
      <nav className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm">
        <Link to="/">Back to homepage</Link>
      </nav>
      <section className="flex flex-col  gap-8 max-w-2xl bg-white h-full pt-12 px-4">
        <h1 className="text-4xl font-bold">Create a New Job</h1>
        <p className="text-gray-500">
          Create a new job to help us find the best candidates for your company.
          <form
            className="flex flex-col  gap-8 items-start "
            onSubmit={handleSubmit}
          >
            <label htmlFor="job-title">Job Title</label>
            <input
              type="text"
              placeholder="Job Title"
              className="inset-shadow rounded-2xl focus:outline-none w-full p-4"
              id="job-title"
            />
            <label htmlFor="job-description">Job Description</label>

            <textarea
              id="job-description"
              placeholder="Job Description"
              className="w-full p-4 border border-gray-300  inset-shadow rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
            />
            <label htmlFor="job-location">Job Location</label>
            <input
              type="text"
              placeholder="Job Location"
              className="inset-shadow rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full p-4"
              id="job-location"
            />
            <button
              type="submit"
              className="primary-gradient text-white rounded-full px-4 py-2 cursor-pointer w-full"
            >
              Publish Job
            </button>
          </form>
        </p>
      </section>
    </main>
  );
};

export default NewJob;
