import "../styles/about.css";

function About() {

    const data = [

        {
            icon: "🛡",
            title: "Travel Fearlessly",
            desc: "SafeHer ensures women travel with confidence using intelligent safety features."
        },

        {
            icon: "📞",
            title: "Trusted Contacts",
            desc: "Notify family and friends instantly during emergencies."
        },

        {
            icon: "📍",
            title: "Smart Navigation",
            desc: "Locate hospitals, police stations and pharmacies nearby."
        },

        {
            icon: "🤖",
            title: "AI Safety Assistant",
            desc: "Receive intelligent safety recommendations while travelling."
        }

    ];

    return (

        <section
        className="about"
        id="about">

            <h2>

                Why SafeHer?

            </h2>

            <div className="about-grid">

                {

                    data.map((item,index)=>(

                        <div
                        className="about-card"
                        key={index}>

                            <div className="about-icon">

                                {item.icon}

                            </div>

                            <h3>

                                {item.title}

                            </h3>

                            <p>

                                {item.desc}

                            </p>

                        </div>

                    ))

                }

            </div>

        </section>

    );

}

export default About;