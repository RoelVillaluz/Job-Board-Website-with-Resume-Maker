import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import { Link } from "react-router-dom"
import axios from "axios"
import { useData } from "../DataProvider"
import { useAuth } from "../components/AuthProvider"
import similarity from "compute-cosine-similarity"

function Dashboard () {
    const { baseUrl } = useData();
    const { user } = useAuth();
    const [resumes, setResumes] = useState([]);
    const [jobRecommendations, setJobRecommendations] = useState([]);

    useEffect(() => {
        document.title = 'Dashboard'
    }, [])

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const response = await axios.get(`${baseUrl}/resumes/user/${user._id}`)
                console.log('Resumes:', response.data)
                setResumes(response.data.data)
            } catch (error) {
                console.error('Error', error)
            }
        }
        fetchResumes()
    }, [])

    useEffect(() => {        
        const fetchJobRecommendations = async () => {
            try {
                const responses = await Promise.all(
                    resumes.map(resume => 
                        axios.get(`${baseUrl}/ai/job-recommendations/${resume._id}`)
                    )
                )
                const recommendations = responses.flatMap(response => response.data.data);
                console.log('Recommendations:', recommendations)
                setJobRecommendations(recommendations)
            } catch (error) {
                console.error('Error', error)
            }
        }
        fetchJobRecommendations()
    }, [resumes])

    const getMatchClass = (similarity) => {
        if (similarity <= 25) {
            return 'very-low'
        } else if (similarity <= 50 && similarity > 25) {
            return 'low'
        } else if (similarity <= 75 && similarity > 50) {
            return 'average'
        } else {
            return 'high'
        }
    }

    return (
        <>
            <Layout>
                <main className="dashboard">
                    <section className="grid-item" id="my-jobs">
                        <header>
                            <h3>My Jobs</h3>
                            <Link>
                                <i className="fa-solid fa-angle-right"></i>
                            </Link>
                        </header>
                        <ul>
                            <Link to={'/my-jobs/saved'}>
                                <li>
                                    <div className="row">
                                        <i className="fa-solid fa-bookmark"></i>
                                        <div>
                                            <strong>Saved</strong>
                                            <p>(0) jobs</p>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-angle-right"></i>
                                </li>
                            </Link>
                            <Link to={'/my-jobs/applied'}>
                                <li>
                                    <div className="row">
                                        <i className="fa-solid fa-file-invoice"></i>
                                        <div>
                                            <strong>Applied</strong>
                                            <p>(0) jobs</p>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-angle-right"></i>
                                </li>
                            </Link>
                            <Link to={'/my-jobs/interviews'}>
                                <li>
                                    <div className="row">
                                        <i className="fa-solid fa-clipboard-question"></i>
                                        <div>
                                            <strong>Interviews</strong>
                                            <p>(0) jobs</p>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-angle-right"></i>
                                </li>
                            </Link>
                            <Link to={'/my-jobs/offers'}>
                                <li>
                                    <div className="row">
                                        <i className="fa-solid fa-briefcase"></i>
                                        <div>
                                            <strong>Offers</strong>
                                            <p>(0) jobs</p>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-angle-right"></i>
                                </li>
                            </Link>
                        </ul>
                    </section>  
                    <section className="grid-item" id="job-recommendations">
                        <header>
                            <h3>Recommended Jobs ({jobRecommendations.length})</h3>
                        </header>
                        <ul className="job-list">
                            {jobRecommendations.map((job, index) => (
                                <li key={index}>
                                    <div className="row">
                                        {job.company.logo 
                                        ? (
                                            <img></img>
                                        ) : (
                                            <i className="fa-solid fa-building"></i>
                                        )}
                                        <div className="details">
                                            <strong>{job.title} - {job.company.name}</strong>
                                            <ul className="tags">
                                                <li>{job.experienceLevel}</li>
                                                <li>{job.jobType}</li>
                                                <li>{job.location}</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <span className={`match-percentage ${getMatchClass(job.similarity)}`}>
                                        {job.similarity}%
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </main>
            </Layout>
        </>
    )
}

export default Dashboard