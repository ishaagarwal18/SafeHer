import { Link } from "react-router-dom";
import "../styles/features.css";

function Journey() {

    // Temporary Data
    // Later fetch from Django

    const journeys = [];

    return (

        <>

            <div className="container">

                <h1 className="page-title">

                    🚖 Start Journey

                </h1>

                <div className="card">

                    <form>

                        <input
                            type="text"
                            name="source"
                            placeholder="Source"
                        />

                        <input
                            type="text"
                            name="destination"
                            placeholder="Destination"
                        />

                        <select name="transport">

                            <option>

                                Car

                            </option>

                            <option>

                                Bus

                            </option>

                            <option>

                                Train

                            </option>

                        </select>

                        <button
                            type="submit"
                            className="btn"
                        >

                            Start Journey

                        </button>

                    </form>

                    <table>

                        <thead>

                            <tr>

                                <th>

                                    Source

                                </th>

                                <th>

                                    Destination

                                </th>

                                <th>

                                    Transport

                                </th>

                                <th>

                                    Status

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                journeys.length > 0 ?

                                journeys.map((journey,index)=>(

                                    <tr key={index}>

                                        <td>

                                            {journey.source}

                                        </td>

                                        <td>

                                            {journey.destination}

                                        </td>

                                        <td>

                                            {journey.transport_mode}

                                        </td>

                                        <td>

                                            {journey.status}

                                        </td>

                                    </tr>

                                ))

                                :

                                <tr>

                                    <td
                                        colSpan="4"
                                        style={{
                                            textAlign:"center"
                                        }}
                                    >

                                        No Journey Found

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

export default Journey;