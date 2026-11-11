export function imageSrc(path) {
  const base = typeof import.meta.env === 'object' ? import.meta.env.BASE_URL : '/';
  const currentPath = path.replace(/^\/crumbsave-react-(?:midterm|routing)\//, base);
  return `${currentPath}${currentPath.includes('?') ? '&' : '?'}v=8`;
}
