const BrandMark = ({ className = "h-10 w-auto", decorative = false }) => (
  <img
    src="/assets/brand/pragati-logo.png"
    alt={decorative ? "" : "Pragati"}
    className={className}
    draggable="false"
  />
);

export default BrandMark;
