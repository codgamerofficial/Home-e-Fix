import { useState } from "react";
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { APP_CONFIG, HOMEPAGE_FAQS } from "@/constants/services";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    }
  };

  return (
    <div className="space-y-14 py-8">
      {/* HERO SECTION */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent" className="px-3 py-1 text-xs font-bold uppercase tracking-wider">
          📞 24/7 Support & Help Desk
        </Badge>
        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-primary">
          We&apos;re Here to <span className="gradient-text">Help You.</span>
        </h1>
        <p className="text-xs sm:text-base text-foreground-secondary leading-relaxed">
          Have a question about a booking, need service assistance, or interested in joining as a partner? Get in touch with our team anytime.
        </p>
      </section>

      {/* QUICK CONTACT CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 text-center space-y-3 border border-border shadow-xs hover:border-accent">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto">
            <Phone className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-base font-bold text-primary">Toll-Free Helpline</h3>
          <p className="text-xs text-foreground-secondary font-semibold">{APP_CONFIG.supportPhone}</p>
          <Button variant="outline" size="sm" onClick={() => window.open(`tel:${APP_CONFIG.supportPhone}`)}>
            Call Support Now
          </Button>
        </Card>

        <Card className="p-6 text-center space-y-3 border border-border shadow-xs hover:border-accent">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-base font-bold text-primary">Email Support</h3>
          <p className="text-xs text-foreground-secondary font-semibold">{APP_CONFIG.supportEmail}</p>
          <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${APP_CONFIG.supportEmail}`)}>
            Send Email
          </Button>
        </Card>

        <Card className="p-6 text-center space-y-3 border border-border shadow-xs hover:border-accent">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-base font-bold text-primary">Headquarters</h3>
          <p className="text-xs text-foreground-secondary">Hitech City, Hyderabad, Telangana 500081</p>
          <Button variant="outline" size="sm" onClick={() => window.open("https://maps.google.com/?q=Hitech+City+Hyderabad")}>
            Open Maps Location
          </Button>
        </Card>
      </section>

      {/* FORM & OFFICES GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* INQUIRY FORM */}
        <Card className="p-6 sm:p-8 border border-border shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="font-heading text-xl font-bold text-primary">Send Us a Message</h3>
            <p className="text-xs text-foreground-secondary">Fill out the form below and we will get back to you within 2 hours.</p>
          </div>

          {isSubmitted ? (
            <div className="p-6 text-center space-y-3 rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h4 className="font-heading text-base font-bold">Inquiry Sent Successfully!</h4>
              <p className="text-xs text-emerald-600">Thank you for reaching out. Our support agent will call or email you shortly.</p>
              <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Email Address</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Mobile Number</label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Subject</label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Booking Assistance" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="How can we help you today?"
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-primary focus:outline-hidden focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <Button variant="accent" size="lg" type="submit" leftIcon={<Send className="h-4 w-4" />} className="w-full font-bold shadow-glow">
                Submit Inquiry
              </Button>
            </form>
          )}
        </Card>

        {/* REGIONAL HUBS */}
        <div className="space-y-6">
          <Card className="p-6 border border-border space-y-4">
            <h3 className="font-heading text-lg font-bold text-primary pb-2 border-b border-border">
              Regional Operations Hubs
            </h3>

            <div className="space-y-4 text-xs">
              {[
                { city: "Hyderabad (HQ)", address: "Building 12B, Mindspace IT Park, Hitech City, Hyderabad - 500081" },
                { city: "Bangalore Hub", address: "Indiranagar 100ft Road, Stage 2, Bangalore - 560038" },
                { city: "Mumbai Hub", address: "BKC Commercial Complex, Bandra East, Mumbai - 400051" },
                { city: "Delhi-NCR Hub", address: "Cyber City Phase 2, Sector 24, Gurugram - 122002" },
              ].map((hub, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-border bg-surface flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-heading font-bold text-primary">{hub.city}</h5>
                    <p className="text-foreground-secondary mt-0.5">{hub.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
