import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";

export interface LegalSection {
  heading: string;
  body: string;
}

interface LegalContentProps {
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalContent({
  eyebrow,
  title,
  description,
  intro,
  sections,
}: LegalContentProps) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        backTo="/settings"
        backLabel="Back to settings"
      />

      <SectionCard className="mx-auto max-w-3xl" bodyClassName="p-5 sm:p-7">
        <p className="text-sm leading-relaxed text-foreground">{intro}</p>
        <div className="mt-6 space-y-6">
          {sections.map((section, index) => (
            <section
              key={section.heading}
              className={index > 0 ? "border-t border-border pt-6" : ""}
            >
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary">
                  {index + 1}
                </span>
                {section.heading}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </SectionCard>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </>
  );
}
