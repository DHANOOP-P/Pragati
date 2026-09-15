/** Plain page shell — no motion backdrop. */
const FormBackdrop = ({ children, className = "" }) => (
  <div className={`relative z-20 min-h-screen ${className}`.trim()}>{children}</div>
);

export default FormBackdrop;
