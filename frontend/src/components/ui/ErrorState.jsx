import { useHideFooter } from "../layout/LayoutChrome";

const ErrorState = ({ onRetry }) => {
  useHideFooter();

  return (
    <div className="relative z-20 grid min-h-[80vh] place-items-center px-6 pb-24 pt-28 text-center">
      <div>
        <p className="font-serif text-2xl italic text-paper">Something went off stage.</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-6 border border-gold px-6 py-2 text-[11px] uppercase tracking-[0.3em] text-gold">
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
