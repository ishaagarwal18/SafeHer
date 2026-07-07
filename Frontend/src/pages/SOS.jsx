import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";

function SOS() {

    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [location, setLocation] = useState("");

    // Temporary data
    // Later fetch from Django

    const alerts = [];

    useEffect(() => {

        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(async (position) => {

                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                setLatitude(lat);
                setLongitude(lon);

                try {

                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
                    );

                    const data = await response.json();

                    setLocation(data.display_name);

                }

                catch (error) {

                    console.log(error);

                }

            });

        }

    }, []);

    return (

        <>

            <div className="container">

                <h1 className="page-title">

                    🚨 Emergency SOS

                </h1>

                <div className="card">

                    <h2>

                        Need Immediate Help?

                    </h2>

                    <p>

                        Press the button below to notify trusted contacts.

                    </p>

                    <br />

                    <form>

                        <input
                            type="hidden"
                            name="latitude"
                            value={latitude}
                            readOnly
                        />

                        <input
                            type="hidden"
                            name="longitude"
                            value={longitude}
                            readOnly
                        />

                        <input
                            type="hidden"
                            name="location"
                            value={location}
                            readOnly
                        />

                        <button className="btn">

                            SEND SOS ALERT

                        </button>

                    </form>

                </div>

                <div className="card">

                    <h2>

                        Emergency Numbers

                    </h2>

                    <table>

                        <thead>

                            <tr>

                                <th>Time</th>

                                <th>Status</th>

                                <th>Location</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                alerts.length > 0 ?

                                alerts.map((alert, index) => (

                                    <tr key={index}>

                                        <td>

                                            {alert.alert_time}

                                        </td>

                                        <td>

                                            {alert.status}

                                        </td>

                                        <td>

                                            {alert.location}

                                        </td>

                                    </tr>

                                ))

                                :

                                <tr>

                                    <td
                                        colSpan="3"
                                        style={{
                                            textAlign: "center"
                                        }}
                                    >

                                        No SOS Alerts

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

export default SOS;