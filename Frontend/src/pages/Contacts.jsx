import { Link } from "react-router-dom";
import "../styles/features.css";

function Contacts() {

    // Temporary data
    // Will come from Django later

    const contacts = [];

    return (

        <>

            <div className="container">

                <h1 className="page-title">

                    📞 Trusted Contacts

                </h1>

                <div className="card">

                    <form>

                        <input
                            type="text"
                            name="name"
                            placeholder="Contact Name"
                            required
                        />

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            pattern="[6789][0-9]{9}"
                            maxLength="10"
                            inputMode="numeric"
                            onInput={(e) => {
                                e.target.value = e.target.value
                                    .replace(/[^0-9]/g, "")
                                    .slice(0, 10);
                            }}
                            title="Phone number must start with 6, 7, 8, or 9 and contain exactly 10 digits."
                            required
                        />

                        <input
                            type="text"
                            name="relationship"
                            placeholder="Relationship"
                            required
                        />

                        <button
                            type="submit"
                            className="btn"
                        >

                            Add Contact

                        </button>

                    </form>

                </div>

                <div className="card">

                    <h2>

                        Saved Contacts

                    </h2>

                    <table>

                        <thead>

                            <tr>

                                <th>Name</th>

                                <th>Phone</th>

                                <th>Relationship</th>

                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                contacts.length > 0 ?

                                contacts.map((contact) => (

                                    <tr key={contact.id}>

                                        <td>

                                            {contact.contact_name}

                                        </td>

                                        <td>

                                            {contact.phone_number}

                                        </td>

                                        <td>

                                            {contact.relationship}

                                        </td>

                                        <td>

                                            <button
                                                type="button"
                                                className="btn"
                                            >

                                                Add to Trusted Contacts

                                            </button>

                                        </td>

                                    </tr>

                                ))

                                :

                                <tr>

                                    <td
                                        colSpan="4"
                                        style={{
                                            textAlign: "center"
                                        }}
                                    >

                                        No Contacts Found

                                    </td>

                                </tr>

                            }

                        </tbody>

                    </table>

                </div>

            </div>

            <div
                className="nav-links"
                style={{
                    textAlign: "center",
                    margin: "20px 0"
                }}
            >

                <Link
                    to="/dashboard"
                    className="btn"
                >

                    ← Back to Dashboard

                </Link>

            </div>

        </>

    );

}

export default Contacts;