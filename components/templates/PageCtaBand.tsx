import Link from "next/link";

type PageCtaBandProps = {
  lead?: string;
  actionLabel?: string;
  href?: string;
};

export function PageCtaBand({
  lead = "Tell us what you want to rank for, produce, or grow. We’ll map the next best step.",
  actionLabel = "Start a conversation",
  href = "/contact-us/",
}: PageCtaBandProps) {
  return (
    <aside className="page-cta-band" aria-label="Contact">
      <div className="page-cta-band__inner">
        <p className="page-cta-band__lead">{lead}</p>
        <Link href={href} className="page-cta-band__button">
          {actionLabel}
        </Link>
      </div>
    </aside>
  );
}
