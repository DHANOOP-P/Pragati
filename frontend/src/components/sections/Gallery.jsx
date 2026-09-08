const Gallery = ({ images }) => {
  if (!images?.length) return null;
  return (
    <section className="relative z-20 overflow-hidden py-28">
      <p className="px-6 text-[11px] uppercase tracking-[0.4em] text-gold md:px-12">Frames</p>
      <h2 className="mt-3 px-6 font-display text-6xl md:px-12 md:text-8xl">Witness</h2>
      <div className="mt-12 flex flex-wrap items-end gap-4 px-6 md:px-12">
        {images.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            loading="lazy"
            data-cursor="VIEW"
            className={`object-cover ${i % 3 === 0 ? "h-72 w-[42%]" : i % 3 === 1 ? "h-48 w-[28%] -translate-y-8" : "h-60 w-[24%] translate-y-6"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Gallery;
