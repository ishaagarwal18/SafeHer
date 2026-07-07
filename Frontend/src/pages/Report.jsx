import { Link } from "react-router-dom";
import "../styles/features.css";

function Report() {

    return (

        <>

            <div className="container">

                <h1 className="page-title">

                    ⚠ Report Unsafe Area

                </h1>

                <div className="card">

                    <form>

                        <input
                            type="text"
                            name="location"
                            placeholder="Location"
                            required
                        />

                        <textarea
                            name="description"
                            rows="5"
                            placeholder="Describe the incident..."
                            required
                        />

                        <button
                            type="submit"
                            className="btn"
                        >

                            Submit Report

                        </button>

                    </form>

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

export default Report;