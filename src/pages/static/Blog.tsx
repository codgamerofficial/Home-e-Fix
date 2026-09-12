import { Link } from "react-router";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function Blog() {
  const articles = [
    {
      id: "1",
      title: "10 Essential Electrical Safety Checks Every Indian Home Must Do Before Monsoon",
      excerpt:
        "Learn how to check for earth leakage, test your MCB switches, and safeguard costly home appliances against power surges.",
      category: "Electrical Safety",
      date: "September 8, 2026",
      readTime: "5 min read",
    },
    {
      id: "2",
      title: "Why Regular AC Jet Pump Cleaning Saves 30% on Your Monthly Electricity Bill",
      excerpt:
        "Dust and mold accumulation force your compressor to work twice as hard. Here is the engineering science behind routine deep servicing.",
      category: "Appliance Care",
      date: "August 29, 2026",
      readTime: "4 min read",
    },
    {
      id: "3",
      title: "Complete Plumbing Maintenance Checklist for High-Rise Apartment Living",
      excerpt:
        "From health faucet leaks to main water pressure valves, a simple quarterly checklist to prevent costly seepage and wall dampness.",
      category: "Plumbing Tips",
      date: "August 14, 2026",
      readTime: "6 min read",
    },
  ];

  return (
    <div className="py-12 md:py-20">
      <div className="container-app space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
            Home Care Insights & Guides
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
            The <span className="text-accent">Home-e-Fix</span> Journal
          </h1>
          <p className="text-foreground-secondary text-base md:text-lg">
            Practical advice, DIY tips, and expert maintenance guides from verified master technicians.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-md hover:border-accent/40 transition-all flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-foreground-muted">
                  <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent font-bold">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary hover:text-accent transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-foreground-secondary leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
                <Link to={ROUTES.SERVICES} className="text-accent font-bold hover:underline flex items-center gap-1">
                  Read More <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
