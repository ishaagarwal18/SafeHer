import { Link } from "react-router-dom";
import "../styles/auth.css";

function Login() {

    // Later this will come from Django API
    const error = "";

    return (

        <div className="auth-card">

            <h1>Welcome Back</h1>

            <form>

                <div className="input-group">

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                    />

                </div>

                <div className="input-group">

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                    />

                </div>

                {error && (

                    <p
                        style={{
                            color: "red",
                            marginBottom: "15px",
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </p>

                )}

                <button type="submit">

                    Login

                </button>

            </form>

            <div className="extra">

                Don't have an account?

                <Link to="/signup">

                    Sign Up

                </Link>

            </div>

        </div>

    );

}

export default Login;