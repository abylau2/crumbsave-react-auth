import { Link } from 'react-router-dom';

export function Brand({ onClick }) {
  return <Link className="brand" to="/" onClick={onClick} aria-label="CrumbSave home">
    <svg className="brand-mark" viewBox="0 0 42 42" role="img" aria-label="CrumbSave crumb-shaped C">
      <path d="M31.5 10.2A16 16 0 1 0 32 31.4" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <circle cx="34.1" cy="16.7" r="3.2" fill="currentColor" />
      <circle cx="35.2" cy="25.4" r="2.2" fill="currentColor" />
    </svg>
    <span>Crumb<span className="brand-light">Save</span></span>
  </Link>;
}
