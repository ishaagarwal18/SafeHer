import "../styles/features.css";

function Features(){

const features=[

{
icon:"🚨",
title:"Emergency SOS",
desc:"Alert trusted contacts instantly during emergencies."
},

{
icon:"📍",
title:"Live Journey Tracking",
desc:"Share your real-time location with family."
},

{
icon:"👮",
title:"Nearby Safe Places",
desc:"Locate nearby hospitals and police stations."
},

{
icon:"📞",
title:"Trusted Contacts",
desc:"Notify your emergency contacts in one click."
},

{
icon:"⚠️",
title:"Unsafe Area Reports",
desc:"Warn others by reporting unsafe locations."
},

{
icon:"🤖",
title:"AI Safety Assistant",
desc:"Receive intelligent safety recommendations."
}

];

return(

<section
className="features"
id="features">

<h2>

Why Choose SafeHer?

</h2>

<div className="feature-grid">

{

features.map((item,index)=>(

<div
className="feature-card"
key={index}>

<div className="icon">

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

export default Features;