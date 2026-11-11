import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { useCreateBag } from '../hooks/useBagMutations.js';
import { CATEGORIES, DISTRICTS } from '../data/seedBags.js';
import { emptyForm, normalizeBag, validateBag } from '../utils/validation.js';

function FormField({ label, name, value, onChange, error, type = 'text', children, ...rest }) {
  const id = `bag-${name}`;
  return <div className={`field ${error ? 'has-error' : ''}`}><label htmlFor={id}>{label}</label>{children || <input id={id} name={name} type={type} value={value} onChange={onChange} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...rest} />}{error && <p className="field-error" id={`${id}-error`}>{error}</p>}</div>;
}

export function AddBagPage() {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submission, setSubmission] = useState({ status: 'idle', message: '', bag: null });
  const createMutation = useCreateBag();
  const pending = useRef(false);

  function change(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    if (submission.status === 'error') setSubmission({ status: 'idle', message: '', bag: null });
  }
  function reset() {
    if (pending.current) return;
    setValues(emptyForm);
    setErrors({});
    setSubmission({ status: 'idle', message: '', bag: null });
  }
  async function submit(event) {
    event.preventDefault();
    if (pending.current) return;
    const nextErrors = validateBag(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    pending.current = true;
    setSubmission({ status: 'pending', message: '', bag: null });
    try {
      const bag = await createMutation.mutateAsync(normalizeBag(values));
      setSubmission({ status: 'success', message: 'Your bag is ready to discover.', bag });
      setValues(emptyForm);
      setErrors({});
    } catch (error) {
      setSubmission({ status: 'error', message: error.message, bag: null });
    } finally {
      pending.current = false;
    }
  }

  return <div className="container form-page"><div className="page-intro"><p className="eyebrow">FOR GOOD THINGS LEFT OVER</p><h1>Share something <em>good.</em></h1><p>Add the food you have left, its price, and a pickup time.</p></div>
    {submission.status === 'success' ? <div className="form-success" role="status"><span className="success-symbol">✓</span><p className="eyebrow">BAG PUBLISHED</p><h2>Your bag is ready to discover.</h2><p>Your listing is saved in this browser and is now part of the catalog.</p><div className="success-actions"><Link className="button button-primary" to={`/bags/${submission.bag.id}`}>View your bag <ArrowUpRight size={17} /></Link><button className="button button-secondary" type="button" onClick={reset}>Create another bag</button></div></div> :
    <div className="form-layout"><div className="form-side"><span className="section-number">01 / CREATE A LISTING</span><h2>What's in<br /><em>the bag?</em></h2><p>Tell people what kind of bag to expect. The exact contents can still be a surprise.</p><div className="form-side-note">Clear details help people choose. Include the price, quantity and pickup window.</div></div>
      <form className="bag-form" onSubmit={submit} noValidate><fieldset disabled={submission.status === 'pending'}><legend className="sr-only">New surprise bag details</legend>
        <div className="form-section-title"><span>01</span><h3>The essentials</h3></div>
        <div className="form-fields"><FormField label="Bag title" name="title" value={values.title} onChange={change} error={errors.title} placeholder="e.g. Evening Bakery Bag" maxLength={80} autoComplete="off" /><FormField label="Business name" name="businessName" value={values.businessName} onChange={change} error={errors.businessName} placeholder="e.g. Warm Corner" maxLength={60} autoComplete="organization" />
          <FormField label="Category" name="category" error={errors.category}><select id="bag-category" name="category" value={values.category} onChange={change} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'bag-category-error' : undefined}><option value="">Choose a category</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></FormField>
          <FormField label="District" name="district" error={errors.district}><select id="bag-district" name="district" value={values.district} onChange={change} aria-invalid={Boolean(errors.district)} aria-describedby={errors.district ? 'bag-district-error' : undefined}><option value="">Choose a district</option>{DISTRICTS.map((item) => <option key={item}>{item}</option>)}</select></FormField>
          <div className={`field field-wide ${errors.description ? 'has-error' : ''}`}><label htmlFor="bag-description">Description</label><textarea id="bag-description" name="description" rows="4" value={values.description} onChange={change} maxLength={300} placeholder="What might someone find inside? Keep it honest and inviting." aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'bag-description-error' : 'description-hint'} /><div className="field-hint" id="description-hint">30–300 characters · {values.description.trim().length}/300</div>{errors.description && <p className="field-error" id="bag-description-error">{errors.description}</p>}</div>
        </div>
        <div className="form-section-title"><span>02</span><h3>Price & pickup</h3></div>
        <div className="form-fields"><FormField label="Original price (KZT)" name="originalPrice" type="number" value={values.originalPrice} onChange={change} error={errors.originalPrice} min="1" step="1" placeholder="4500" /><FormField label="Bag price (KZT)" name="price" type="number" value={values.price} onChange={change} error={errors.price} min="1" step="1" placeholder="1990" /><FormField label="Available quantity" name="quantity" type="number" value={values.quantity} onChange={change} error={errors.quantity} min="1" max="20" step="1" placeholder="4" /><div className="field field-spacer" aria-hidden="true" />
          <FormField label="Pickup start" name="pickupStart" type="time" value={values.pickupStart} onChange={change} error={errors.pickupStart} /><FormField label="Pickup end" name="pickupEnd" type="time" value={values.pickupEnd} onChange={change} error={errors.pickupEnd} />
        </div>
        {submission.status === 'error' && <p className="feedback error" role="alert">{submission.message}</p>}
        <div className="form-actions"><button className="button button-primary button-large" type="submit">{submission.status === 'pending' ? 'Publishing…' : 'Publish surprise bag'} <ArrowUpRight size={18} /></button><button className="button button-plain" type="button" onClick={reset}><RotateCcw size={16} /> Reset form</button></div>
      </fieldset></form></div>}
  </div>;
}
