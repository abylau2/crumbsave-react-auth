const steps = [
  ['1', 'Discover', 'Find leftover food from cafés, bakeries and restaurants.'],
  ['2', 'Reserve', 'Choose a bag and save it to your reservations.'],
  ['3', 'Pick up', 'Check the pickup location and collect your bag at the listed time.']
];
export function HowItWorks() {
  return <section className="how-section" id="how-it-works" aria-labelledby="how-title"><div className="container how-layout">
    <div className="how-intro"><p className="eyebrow">THE SIMPLE IDEA</p><h2 id="how-title">A good find in<br />three simple steps.</h2><p>Find a bag, reserve it, and check the pickup details.</p></div>
    <div className="steps">{steps.map(([number, title, description]) => <div className="step" key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div></div>)}</div>
  </div></section>;
}
