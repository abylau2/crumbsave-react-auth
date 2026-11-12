import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

// Short "About" block for the home page. The header link "About" scrolls here.
export function AboutSection() {
  return <section className="container about-home" id="about" aria-labelledby="about-title">
    <div className="about-columns">
      <div>
        <p className="eyebrow">ABOUT CRUMBSAVE</p>
        <h2 id="about-title">More food, less waste.</h2>
        <p>Cafés and bakeries often have food left at closing time. CrumbSave brings those leftovers together so people nearby can find them for less.</p>
        <Link className="text-link" to="/dashboard">See the numbers on the dashboard <ArrowUpRight size={16} /></Link>
      </div>
      <div>
        <p className="eyebrow">ANIME, FILMS &amp; GAMES</p>
        <h2>Recognize something?</h2>
        <p>Some bags are inspired by food from anime, cartoons, films and games. Look out for a few familiar favorites.</p>
        <Link className="text-link" to="/about">Read more about the project <ArrowUpRight size={16} /></Link>
      </div>
    </div>
  </section>;
}
