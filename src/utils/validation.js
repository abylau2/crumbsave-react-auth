import { CATEGORIES, DISTRICTS } from '../data/seedBags.js';

export const emptyForm = {
  title: '', businessName: '', category: '', district: '', description: '',
  originalPrice: '', price: '', quantity: '', pickupStart: '', pickupEnd: ''
};

export function validateBag(values) {
  const errors = {};
  const title = String(values.title ?? '').trim();
  const businessName = String(values.businessName ?? '').trim();
  const description = String(values.description ?? '').trim();
  if (!title) errors.title = 'Add a bag title.';
  else if (title.length < 4 || title.length > 80) errors.title = 'Use 4–80 characters.';
  if (!businessName) errors.businessName = 'Add a business name.';
  else if (businessName.length < 2 || businessName.length > 60) errors.businessName = 'Use 2–60 characters.';
  if (!CATEGORIES.includes(values.category)) errors.category = 'Choose a category.';
  if (!DISTRICTS.includes(values.district)) errors.district = 'Choose a district.';
  if (description.length < 30 || description.length > 300) errors.description = 'Write 30–300 characters about the bag.';
  const originalPrice = Number(values.originalPrice);
  const price = Number(values.price);
  if (!Number.isInteger(originalPrice) || originalPrice <= 0) errors.originalPrice = 'Enter a whole-number price above zero.';
  if (!Number.isInteger(price) || price <= 0) errors.price = 'Enter a whole-number price above zero.';
  else if (!errors.originalPrice && price >= originalPrice) errors.price = 'The bag price must be lower than the original price.';
  const quantity = Number(values.quantity);
  if (!/^(?:[1-9]|1\d|20)$/.test(String(values.quantity)) || !Number.isInteger(quantity)) errors.quantity = 'Enter a whole number from 1 to 20.';
  const validTime = (value) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value ?? '');
  if (!validTime(values.pickupStart)) errors.pickupStart = 'Choose a pickup start time.';
  if (!validTime(values.pickupEnd)) errors.pickupEnd = 'Choose a pickup end time.';
  else if (!errors.pickupStart && values.pickupStart >= values.pickupEnd) errors.pickupEnd = 'Pickup must end after it starts.';
  return errors;
}

export function normalizeBag(values) {
  return {
    title: values.title.trim(), businessName: values.businessName.trim(),
    category: values.category, district: values.district, description: values.description.trim(),
    originalPrice: Number(values.originalPrice), price: Number(values.price),
    quantity: Number(values.quantity), pickupStart: values.pickupStart, pickupEnd: values.pickupEnd
  };
}
