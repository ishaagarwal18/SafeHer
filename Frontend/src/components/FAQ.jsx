import "../styles/faq.css";

function FAQ() {

    const faqs = [

        {
            q: "How does SOS work?",
            a: "It instantly alerts your trusted contacts."
        },

        {
            q: "Can I add multiple contacts?",
            a: "Yes, you can add multiple trusted contacts."
        },

        {
            q: "Does SafeHer work 24×7?",
            a: "Yes, SafeHer is available anytime."
        }

    ];

    return (

        <section
        className="faq"
        id="faq">

            <h2>

                Frequently Asked Questions

            </h2>

            {

                faqs.map((item,index)=>(

                    <div
                    className="faq-box"
                    key={index}>

                        <h3>

                            {item.q}

                        </h3>

                        <p>

                            {item.a}

                        </p>

                    </div>

                ))

            }

        </section>

    );

}

export default FAQ;