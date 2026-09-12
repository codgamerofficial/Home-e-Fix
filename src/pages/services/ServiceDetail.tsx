import { useParams, Link } from "react-router";
import { Check, X, Shield, Clock, Star, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES, CATEGORY_SERVICES_MAP } from "@/constants/services";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/utils/format";

export default function ServiceDetail() {
  const { category: categorySlug, service: serviceSlug } = useParams<{
    category: string;
    service: string;
  }>();

  const category = SERVICE_CATEGORIES.find(
    (c) => c.slug === categorySlug || c.id === categorySlug
  );

  const categoryKey = (category?.slug || categorySlug || "electrical") as string;
  const servicesList = CATEGORY_SERVICES_MAP[categoryKey] || CATEGORY_SERVICES_MAP["electrical"] || [];

  const service = servicesList.find(
    (s: any) => s.id === serviceSlug || s.slug === serviceSlug
  ) || servicesList[0];

  if (!service) {
    return (
      <div className="container-app py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">Service Not Found</h2>
        <p className="text-foreground-secondary">
          The requested service catalog item does not exist or has been moved.
        </p>
        <Button asChild variant="accent">
          <Link to={ROUTES.SERVICES}>Browse All Services</Link>
        </Button>
      </div>
    );
  }

  const effectivePrice = service.discountedPrice || service.basePrice || 199;

  return (
    <div className="py-8 md:py-14">
      <div className="container-app space-y-10">
        {/* Breadcrumb / Back */}
        <div className="flex items-center gap-2 text-sm text-foreground-secondary">
          <Link to={ROUTES.SERVICES} className="hover:text-accent flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> All Services
          </Link>
          <span>/</span>
          <Link to={`/services/${category?.slug || categoryKey}`} className="hover:text-accent">
            {category?.name || "Services"}
          </Link>
          <span>/</span>
          <span className="text-primary font-semibold">{service.name}</span>
        </div>

        {/* Hero Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-border bg-surface p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent font-bold text-xs uppercase tracking-wider">
                  {category?.name || "Home Repair"}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                  <Star className="h-4 w-4 fill-amber-500" />
                  <span>{service.rating || 4.9} ({service.reviewCount || 350}+ reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-foreground-muted text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration ? `${service.duration} mins` : "45-60 mins"}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-primary">
                {service.name}
              </h1>

              <p className="text-foreground-secondary text-base leading-relaxed">
                {service.shortDescription ||
                  "Professional installation, precision repair, and thorough quality inspection performed by background-verified master technicians."}
              </p>

              {/* What is Included / Excluded */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-success" /> What's Included
                  </h4>
                  <ul className="space-y-2 text-xs md:text-sm text-foreground-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span> Pre-service diagnostics & testing
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span> Professional labor using certified tools
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span> 30-Day Home-e-Fix Re-work Warranty
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span> Clean-up post service completion
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <X className="h-4 w-4 text-error" /> What's Excluded
                  </h4>
                  <ul className="space-y-2 text-xs md:text-sm text-foreground-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-error font-bold">✕</span> Replacement spare parts (billed at actuals)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error font-bold">✕</span> Major masonry or civil wall demolition
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error font-bold">✕</span> Concealed structural rewiring
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* The Promise Badge */}
            <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-3">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" /> The Home-e-Fix Assurance
              </h3>
              <p className="text-xs md:text-sm text-foreground-secondary leading-relaxed">
                All technicians are police-verified, skill-tested, and equipped with professional standard diagnostic gear. If you are not satisfied with our workmanship, we offer free rework within 30 days.
              </p>
            </div>
          </div>

          {/* Booking Summary Sidebar Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border-2 border-border bg-surface p-6 shadow-lg space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  Service Rate
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-primary">
                    {formatCurrency(effectivePrice)}
                  </span>
                  <span className="text-xs text-foreground-secondary">
                    (Base labor rate)
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-foreground-secondary border-t border-b border-border py-4">
                <div className="flex justify-between">
                  <span>Standard Visit:</span>
                  <span className="font-bold text-primary">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Spares & Material:</span>
                  <span className="font-bold text-primary">Actual MRP</span>
                </div>
                <div className="flex justify-between">
                  <span>Warranty:</span>
                  <span className="font-bold text-success">30 Days Guaranteed</span>
                </div>
              </div>

              <Button variant="accent" size="lg" className="w-full shadow-glow gap-2" asChild>
                <Link to={`/app/book/${service.id}`}>
                  Book This Service Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <p className="text-[11px] text-center text-foreground-muted">
                🔒 Cashless payment after completion. Free cancellation up to 2 hours before scheduled slot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
