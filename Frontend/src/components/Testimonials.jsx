import "../styles/testimonials.css";

function Testimonials() {

    const reviews = [

        {
            name: "Priya",
            text: "SafeHer made my late-night commute much safer.",
            stars: "★★★★★"
        },

        {
            name: "Riya",
            text: "The SOS feature is extremely helpful and easy to use.",
            stars: "★★★★★"
        },

        {
            name: "Ananya",
            text: "Beautiful interface and amazing safety features.",
            stars: "★★★★★"
        }

    ];

    return (

        <section className="testimonials">

            <h2>

                What Women Say

            </h2>

            <div className="testimonial-grid">

                {

                    reviews.map((item,index)=>(

                        <div
                        className="testimonial-card"
                        key={index}>

                            <h3>

                                {item.stars}

                            </h3>

                            <p>

                                "{item.text}"

                            </p>

                            <h4>

                                — {item.name}

                            </h4>

                        </div>

                    ))

                }

            </div>

        </section>

    );

}

export default Testimonials;