export default function PageHeader({ label, title, accent, text, children }) {
  return (
    <div className="fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {label && (
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
            <span className="h-px w-8 bg-copper" />
            {label}
          </p>
        )}
        <h1 className="mt-3 font-display text-3xl font-bold leading-[1.2] text-ink sm:text-4xl">
          {title} {accent && <span className="text-copper">{accent}</span>}
        </h1>
        {text && <p className="mt-2 max-w-xl text-sm text-ink/60">{text}</p>}
      </div>
      {children}
    </div>
  );
}
