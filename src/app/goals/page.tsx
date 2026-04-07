import PageLayout from "@/components/PageLayout";
import Goals from "@/components/Goals";
import Link from "next/link";

export default function GoalsPage() {
  return (
    <PageLayout>
      <section className="py-20 text-center" style={{ background: "linear-gradient(180deg, #e6f4ea 0%, #fff 60%)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
          <h1 className="text-5xl font-normal mb-6" style={{ color: "#202124" }}>
            Achieve your business goals
          </h1>
          <p className="text-xl mb-8" style={{ color: "#5f6368" }}>
            Tell us what you want to accomplish — we&apos;ll show you the best way to get there with Google Ads.
          </p>
          <Link href="/start" className="inline-flex items-center gap-2 px-8 py-3 rounded text-white font-medium" style={{ background: "#34a853" }}>
            Start now
          </Link>
        </div>
      </section>
      <Goals />
    </PageLayout>
  );
}
