import Link from "next/link";

/** The Vesperal mark: an accent square and the serif wordmark. */
export default function Wordmark({ href = "/", small = false }: { href?: string; small?: boolean }) {
  return (
    <Link
      href={href}
      aria-label="Vesperal home"
      className="group inline-flex items-center gap-2.5 text-ink transition-opacity hover:opacity-70"
    >
      <span
        aria-hidden
        className={`relative block shrink-0 rounded-[3px] bg-accent ${small ? "h-3 w-3" : "h-3.5 w-3.5"}`}
      >
        <span className="absolute inset-[30%] rounded-[1px] bg-paper" />
      </span>
      <span className={`font-serif leading-none ${small ? "text-[22px]" : "text-[26px]"}`}>
        Vesperal
      </span>
    </Link>
  );
}
