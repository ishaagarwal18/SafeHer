import { Link } from "react-router-dom";
import "../styles/features.css";

function JourneyHistory() {

    // Temporary Data
    // Will come from Django

    const journeys = [];

    return (

        <>

            <div className="container">

                <h1 className="page-title">

                    🧭 Journey History

                </h1>

                <div className="card">

                    <table>

                        <thead>

                            <tr>

                                <th>Source</th>

                                <th>Destination</th>

                                <th>Transport</th>

                                <th>Status</th>

                                <th>Started</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                journeys.length > 0 ?

                                journeys.map((journey,index)=>(

                                    <tr key={index}>

                                        <td>{journey.source}</td>

                                        <td>{journey.destination}</td>

                                        <td>{journey.transport_mode}</td>

                                        <td>{journey.status}</td>

                                        <td>{journey.start_time}</td>

                                    </tr>

                                ))

                                :

                                <tr>

                                    <td
                                        colSpan="5"
                                        style={{textAlign:"center"}}
                                    >

                                        No Journey History

                                    </td>

                                </tr>

                            }

                        </tbody>

                    </table>

                </div>

            </div>

            <div className="nav-links">

                <Link
                    to="/dashboard"
                    className="btn"
                >

                    Back to Dashboard

                </Link>

            </div>

        </>

    );

}

export default JourneyHistory;