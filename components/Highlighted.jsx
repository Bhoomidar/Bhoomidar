// Shows a text where words between ** and ** stand out (bold, in the copper colour).
//   "The team was **helpful at every step**."
export default function Highlighted({ text, className = "" }) {
  const parts = String(text ?? "").split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
          <strong key={i} className={`font-bold text-copper-dark ${className}`}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}
