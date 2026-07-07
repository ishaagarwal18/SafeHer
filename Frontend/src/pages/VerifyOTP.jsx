import { useState } from "react";
import "../styles/auth.css";

function VerifyOTP() {

    // Temporary values
    // These will come from Django later

    const [email] = useState("");

    const error = "";

    return (

        <div className="verify-card">

            <h1>

                📧 Verify Your Email

            </h1>

            <p>

                We've sent a 6-digit OTP to

                <br />

                <b>

                    {email}

                </b>

            </p>

            <form>

                <input
                    type="hidden"
                    name="email"
                    value={email}
                    readOnly
                />

                <input
                    type="text"
                    name="otp"
                    maxLength="6"
                    placeholder="Enter OTP"
                    required
                />

                <button type="submit">

                    Verify OTP

                </button>

            </form>

            {

                error && (

                    <p className="error">

                        {error}

                    </p>

                )

            }

            <div className="resend">

                Didn't receive the OTP?

                <br />

                <a href="#">

                    Resend OTP

                </a>

            </div>

        </div>

    );

}

export default VerifyOTP;