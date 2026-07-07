import { Link } from "react-router-dom";
import "../styles/auth.css";

function Signup() {

    // Later connect with Django API
    const error = "";

    return (

        <div className="auth-card">

            <div className="logo">
                🛡
            </div>

            <h1>Create Your Account</h1>

            <p className="subtitle">
                Join SafeHer and make every journey safer.
            </p>

            <form>

                <div className="input-group">

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        required
                    />

                </div>

                <div className="input-group">

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        required
                    />

                </div>

                <div className="input-group">

                    <input
                        type="text"
                        name="phone"
                        maxLength="10"
                        placeholder="Mobile Number"
                        required
                    />

                </div>

                <div className="input-group">

                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        required
                    />

                </div>

                <div className="input-group">

                    <input
                        type="password"
                        id="confirm_password"
                        name="confirm_password"
                        placeholder="Confirm Password"
                        required
                    />

                </div>

                {error && (

                    <p className="error">

                        {error}

                    </p>

                )}

                <button type="submit">

                    Send OTP

                </button>

            </form>

            <div className="extra">

                Already have an account?

                <Link to="/login">

                    Login

                </Link>

            </div>

        </div>

    );

}

export default Signup;