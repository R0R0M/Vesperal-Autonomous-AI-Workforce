/** Numbered section header with a top rule: "02  THE ROSTER". */
export default function SectionHead({
  n,
  title,
  aside,
  live = false,
}: {
  n: string;
  title: string;
  aside?: React.ReactNode;
  live?: boolean;
}) {
  return (
    <div className="section-head justify-between">
      <span className="flex items-baseline gap-4">
        <span className="n">{n}</span>
        <span className="t">{title}</span>
        {live && <span className="tag tag-live text-ok" aria-label="live" />}
      </span>
      {aside && <span className="eyebrow">{aside}</span>}
    </div>
  );
}
