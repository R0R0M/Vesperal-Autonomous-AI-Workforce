import { Fragment } from "react";

/** Inline markdown subset: `code`, **bold**. */
function inline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) {
      out.push(
        <code key={k++} className="font-mono text-[0.92em] text-ink">
          {tok.slice(1, -1)}
        </code>,
      );
    } else {
      out.push(
        <strong key={k++} className="font-medium text-ink">
          {tok.slice(2, -2)}
        </strong>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { kind: "h"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "code"; text: string };

function parse(src: string): Block[] {
  const lines = src.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++;
      blocks.push({ kind: "code", text: buf.join("\n") });
      continue;
    }
    const h = /^#{1,6}\s+(.*)$/.exec(line);
    if (h) {
      blocks.push({ kind: "h", text: h[1] });
      i++;
      continue;
    }
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*•]\s+/, ""));
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("```") &&
      !/^#{1,6}\s+/.test(lines[i]) &&
      !/^\s*[-*•]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    blocks.push({ kind: "p", text: buf.join(" ") });
  }
  return blocks;
}

/**
 * Renders the markdown-ish text the agents write (headings, lists, bold,
 * code) as typeset prose. No dependency, no HTML passthrough.
 */
export default function Prose({ text, className = "" }: { text: string; className?: string }) {
  const blocks = parse(text);
  return (
    <div className={`space-y-2.5 text-[13px] leading-relaxed text-ink-2 ${className}`}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h":
            return (
              <p key={i} className="eyebrow !mt-4 first:!mt-0">
                {inline(b.text)}
              </p>
            );
          case "code":
            return (
              <pre key={i} className="well overflow-auto p-3 text-[11px]">
                {b.text}
              </pre>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-1 border-l border-rule pl-3">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-1">
                {b.items.map((it, j) => (
                  <li key={j} className="grid grid-cols-[1.5rem_1fr]">
                    <span className="font-mono text-[11px] text-mute">{String(j + 1).padStart(2, "0")}</span>
                    <span>{inline(it)}</span>
                  </li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={i}>
                {inline(b.text).map((n, j) => (
                  <Fragment key={j}>{n}</Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
