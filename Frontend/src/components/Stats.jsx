import "../styles/stats.css";

function Stats() {

    const stats = [

        {
            number: "5000+",
            title: "Safe Journeys"
        },

        {
            number: "800+",
            title: "Women Protected"
        },

        {
            number: "150+",
            title: "Safe Places"
        },

        {
            number: "24×7",
            title: "Support"
        }

    ];

    return (

        <section className="stats">

            {

                stats.map((item,index)=>(

                    <div
                    className="stat-card"
                    key={index}>

                        <h2>

                            {item.number}

                        </h2>

                        <p>

                            {item.title}

                        </p>

                    </div>

                ))

            }

        </section>

    );

}

export default Stats;