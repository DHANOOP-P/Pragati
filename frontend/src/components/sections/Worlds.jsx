const Worlds = ({ categories }) => {
  if (!categories?.length) return null;
  return (
    <section className="relative z-20 bg-ink">
      {categories.map((cat) => (
        <div key={cat} className="flex min-h-[70vh] items-center border-b border-paper/10 px-6 md:px-12">
          <h2 className="font-display text-[18vw] leading-[0.8] tracking-tight text-paper/90 md:text-[10vw]">{cat}</h2>
        </div>
      ))}
    </section>
  );
};

export default Worlds;
