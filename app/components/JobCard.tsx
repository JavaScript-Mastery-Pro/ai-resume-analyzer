const JobCard = ({ job }: { job: Job }) => {
  return (
    <div className="bg-white rounded-2xl w-full h-full p-5">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">{job.title}</h1>
        <div className="flex flex-wrap gap-2">
          {job.requiredSkills.map((skill) => (
            <p
              key={skill}
              className="rounded-sm border border-gray-200 px-2 py-1"
            >
              {skill}
            </p>
          ))}
        </div>
        <div className="flex flex-row gap-2 items-center ">
          <img src="icons/pin.svg" alt="location" className="w-4 h-4" />
          <p className="text-dark-200">{job.location}</p>
        </div>
        <button className="primary-gradient text-white rounded-full p-2 cursor-pointer">
          View Job
        </button>
      </div>
    </div>
  );
};

export default JobCard;
