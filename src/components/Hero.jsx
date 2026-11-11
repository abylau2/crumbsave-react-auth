import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { imageSrc } from '../utils/imageSrc.js';

export function Hero() {
  return <section className="hero container" aria-labelledby="hero-title">
    <div className="hero-copy">
      <p className="eyebrow">ALMATY · GOOD FOOD FOR LESS</p>
      <h1 id="hero-title">Good food.<br />Lower prices.<br /><em>Less waste.</em></h1>
      <p className="hero-lead">Local cafés, bakeries and restaurants don't always sell everything they make. Find their leftover food for less.</p>
      <div className="hero-actions"><Link className="button button-primary button-large" to="/bags">Explore surprise bags <ArrowUpRight size={18} /></Link><Link className="text-link" to="/#how-it-works">How it works <ArrowDownRight size={18} /></Link></div>
    </div>
    <div className="hero-visual">
      <img src={imageSrc(`${import.meta.env.BASE_URL}images/fan-food/ichiraku-ramen.webp`)} width="1000" height="750" alt="Steaming ramen with pork, egg, and noodles" fetchPriority="high" />
      <div className="hero-photo-caption"><span>GOOD THINGS, SAVED DAILY</span><span>01 / ALMATY</span></div>
      <Link className="hero-offer" to="/bags/fan-001"><span className="eyebrow">SURPRISE BAG</span><strong>Ichiraku Ramen</strong><span>From ₸2,490 <ArrowUpRight size={15} /></span></Link>
    </div>
  </section>;
}
