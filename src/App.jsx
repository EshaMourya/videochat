import Navbar from "./components/Navbar";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import JobCard from "./components/JobCard";
import jobData from "./JobDummyData"; // Ensure this is valid data
import { useEffect, useState } from "react";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { db } from "./firebase.config";

function App() {
    const [jobs, setJobs] = useState([]);
    const [customSearch, setCustomSearch] = useState(false);

    const fetchJobs = async () => {
        setCustomSearch(false);
        const tempJobs = [];
        const jobsRef = collection(db, "jobs");
        const q = query(jobsRef, orderBy("postedOn", "desc"));
        const req = await getDocs(q);

        req.forEach((job) => {
            tempJobs.push({
                ...job.data(),
                id: job.id,
                postedOn: job.data().postedOn.toDate(),
            });
        });
        setJobs(tempJobs);
    };

    const fetchJobsCustom = async (jobCriteria) => {
        setCustomSearch(true);
        const tempJobs = [];
        console.log("Fetching jobs with criteria:", jobCriteria); // Log criteria

        try {
            const jobsRef = collection(db, "jobs");
            const q = query(
                jobsRef,
                where("type", "==", jobCriteria.type),
                where("title", "==", jobCriteria.title),
                where("experience", "==", jobCriteria.experience),
                where("location", "==", jobCriteria.location),
                orderBy("postedOn", "desc")
            );

            const req = await getDocs(q);
            console.log("Query successful:", req);

            if (req.empty) {
                console.log("No matching jobs found.");
            } else {
                req.forEach((job) => {
                    tempJobs.push({
                        ...job.data(),
                        id: job.id,
                        postedOn: job.data().postedOn.toDate(),
                    });
                });
            }
            console.log("Jobs found:", tempJobs); // Log found jobs
            setJobs(tempJobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    return (
        <div>
            <Navbar />
            <Header />
            <SearchBar fetchJobsCustom={fetchJobsCustom} />
            {customSearch && (
                <button onClick={fetchJobs} className="flex pl-[1250px] mb-2">
                    <p className="bg-blue-500 px-10 py-2 rounded-md text-white">Clear Filters</p>
                </button>
            )}
            {jobs.map((job) => (
                <JobCard key={job.id} {...job} />
            ))}
        </div>
    );
}

export default App;
