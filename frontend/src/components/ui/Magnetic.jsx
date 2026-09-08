import { useRef } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const Magnetic = ({ children, className = "" }) => {
  const ref = useRef(null);
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");

  const onMove = (e) => {
    if (!fine || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.22;
    const y = (e.clientY - r.top - r.height / 2) * 0.22;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={reset} className={`transition-transform duration-200 ${className}`}>
      {children}
    </div>
  );
};

export default Magnetic;
