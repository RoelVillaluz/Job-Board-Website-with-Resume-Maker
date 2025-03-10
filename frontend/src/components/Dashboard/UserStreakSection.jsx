import { Link } from "react-router-dom"

function UserStreakSection() {
const currentDate = new Date();
    const date = currentDate.getDate();
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);
    const futureDate = new Date();

    const getFutureDates = () => {
        const dates = []

        for (let i = 0; i <= 6; i++) {
            futureDate.setDate(date + i);
            const dayNumber = futureDate.getDate();
            const dayName = futureDate.toLocaleDateString("en-US", {weekday: "short"})
            dates.push({ number: dayNumber, day: dayName })
        }
        return dates
    }

    return (
        <>
            <section className="grid-item" id="user-streak">
                <div className="streak-count">
                    <i className="fa-solid fa-fire"></i>
                    <span>0 days</span>
                    <p>Streak</p>
                </div>
                <div className="streak-days">
                    <div className="row">
                        <h5>Log in daily to get rewards</h5>
                        <Link to={'/login-rewards'}>See rewards <i className="fa-solid fa-angle-right"></i></Link>
                    </div>
                    <ul>
                        {getFutureDates().map((date, index) => (
                        <li key={index}>
                            <div className="status"></div>
                            <span>{date.day}</span>
                        </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    )
}

export default UserStreakSection