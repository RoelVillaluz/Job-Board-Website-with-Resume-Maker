import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function ApplicationProgressSection({ user, baseUrl, loading }) {
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);

    useEffect(() => {
        const fetchInteractedJobs = async () => {
            try {
                const response = await axios.get(`${baseUrl}/users/${user._id}/interacted-jobs`)
                console.log(response.data.data)

                setAppliedJobs(response.data.data.appliedJobs)
                setSavedJobs(response.data.data.savedJobs)
            } catch (error) {
                console.error('Error', error)
            }
        }
        fetchInteractedJobs()
    }, [baseUrl, user])
    return(
        <>
            <section className={`grid-item ${loading !== true ? '' : 'skeleton'}`} id="application-progress">
                {loading !== true && (
                    <>
                        {appliedJobs.length > 0 ? (
                            <Swiper 
                                modules={[Pagination]}  
                                pagination={{ clickable: true }}  
                                spaceBetween={10}
                                slidesPerView={1}
                                style={{ width: "100%", height: "100%", paddingBottom: "2rem" }}
                                loop={true}
                            >
                                {appliedJobs.map((job, index) => (
                                    <SwiperSlide key={index}>
                                        <header>
                                            <div className="job">
                                                <img src={job.company.logo} alt={`${job.company.name} logo`} />
                                                <div>
                                                    <h3>{job.title}</h3>
                                                    <p>{job.company.name}</p>
                                                </div>
                                            </div>
                                            <div className="status" aria-live="polite">
                                                <span>Ongoing</span>
                                            </div>
                                        </header>

                                        <div className="details">
                                            <div className="stage">
                                                <span>Stage 1/4</span>
                                                <h1>Applied</h1>
                                            </div>
                                            <div className="time">
                                                <p>Submitted <time datetime="2025-03-08T11:07:00">March 8, 2025 • 11:07 AM</time></p>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : (
                            <div role="alert" className="empty-status">
                                <i className="fas fa-box-open" aria-label="No job applications"></i>
                                <span>No job applications yet.</span>
                            </div>
                        )}
                        <div className="status-toggle-buttons">
                            <button type="button" aria-label="Show ongoing">Ongoing ({appliedJobs.length})</button>
                            <button type="button" aria-label="Show completed">Completed</button>
                        </div>
                    </>

                )}
            </section>
        </>
    )
}

export default ApplicationProgressSection