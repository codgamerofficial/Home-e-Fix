import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Clock,
  Star,
  CheckCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { SERVICE_CATEGORIES, APP_CONFIG } from "@/constants/services";

/* ─── Animation Variants ─── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* ─── Hero Section ─── */}
      <section className="relative gradient-hero text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-150 w-150 rounded-full bg-white/2 blur-3xl" />
        </div>

        <div className="container-app relative py-20 md:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div custom={0} variants={fadeUp}>
                <Badge variant="accent" className="mb-6 px-4 py-1.5 text-sm">
                  ✨ Trusted by 10,000+ homeowners
                </Badge>
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Expert Home Services
                <br />
                <span className="text-accent">At Your Doorstep</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                className="mt-6 text-lg text-white/70 sm:text-xl max-w-2xl mx-auto"
              >
                {APP_CONFIG.description}
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              >
                <Button
                  variant="accent"
                  size="lg"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="text-base px-8 shadow-glow"
                  asChild
                >
                  <Link to={ROUTES.SERVICES}>Book a Service</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Phone className="h-5 w-5" />}
                  className="text-base border-white/20 text-white hover:bg-white/10"
                >
                  Call Us: 1800-123-4567
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50"
            >
              {[
                { icon: Shield, text: "Verified Professionals" },
                { icon: Clock, text: "Same Day Service" },
                { icon: Star, text: "4.8★ Average Rating" },
                { icon: CheckCircle, text: "Satisfaction Guaranteed" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accent" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 C360,100 1080,0 1440,60 L1440,100 L0,100 Z"
              fill="var(--color-background)"
            />
          </svg>
        </div>
      </section>

      {/* ─── Service Categories ─── */}
      <section className="container-app py-16 md:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.h2
            custom={0}
            variants={fadeUp}
            className="text-3xl font-bold md:text-4xl"
          >
            Our Services
          </motion.h2>
          <motion.p
            custom={1}
            variants={fadeUp}
            className="mt-3 text-foreground-secondary max-w-2xl mx-auto"
          >
            From plumbing to painting, we&apos;ve got every corner of your home covered 
            with verified professionals.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6"
        >
          {SERVICE_CATEGORIES.map((category, i) => (
            <motion.div key={category.id} custom={i} variants={fadeUp}>
              <Link to={`${ROUTES.SERVICES}/${category.slug}`}>
                <Card hover className="group text-center p-6">
                  <CardContent className="p-0 space-y-3">
                    <div
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${category.color}15`,
                      }}
                    >
                      {category.icon}
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-primary sm:text-base">
                      {category.name}
                    </h3>
                    <p className="text-xs text-foreground-muted line-clamp-2 hidden sm:block">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <Button
            variant="outline"
            size="lg"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            asChild
          >
            <Link to={ROUTES.SERVICES}>View All Services</Link>
          </Button>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container-app">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="text-3xl font-bold md:text-4xl"
            >
              How It Works
            </motion.h2>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="mt-3 text-foreground-secondary"
            >
              Book a service in three simple steps
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
          >
            {[
              {
                step: "01",
                title: "Choose a Service",
                description:
                  "Browse our wide range of home services and pick what you need.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                step: "02",
                title: "Book a Slot",
                description:
                  "Select your preferred date, time, and address. It's that simple.",
                gradient: "from-accent to-orange-400",
              },
              {
                step: "03",
                title: "Sit Back & Relax",
                description:
                  "A verified professional arrives at your doorstep. Pay after the job is done.",
                gradient: "from-green-500 to-emerald-500",
              },
            ].map((item, i) => (
              <motion.div key={item.step} custom={i} variants={fadeUp}>
                <div className="relative text-center p-8 rounded-2xl bg-surface border border-border">
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${item.gradient} text-xl font-bold text-white shadow-lg`}
                  >
                    {item.step}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="gradient-hero text-white py-16 md:py-24">
        <div className="container-app text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="text-3xl font-bold text-white md:text-4xl"
            >
              Ready to Transform Your Home?
            </motion.h2>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="mt-4 text-lg text-white/70 max-w-xl mx-auto"
            >
              Join thousands of homeowners who trust Home-e-Fix for all their
              home service needs.
            </motion.p>
            <motion.div
              custom={2}
              variants={fadeUp}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                variant="accent"
                size="lg"
                className="shadow-glow text-base px-8"
                asChild
              >
                <Link to={ROUTES.SERVICES}>Get Started</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 text-base"
                asChild
              >
                <Link to={ROUTES.REGISTER}>Join as Professional</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
