import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  CheckCircle,
  Calendar,
  Receipt,
  MapPin,
  Wallet,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  LogOut,
  Edit3,
  HelpCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { dbRepository } from "@/services/db/repository";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/lib/currency";

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || "Priya Sharma");
  const [email, setEmail] = useState(user?.email || "priya@homeefix.com");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [avatar, setAvatar] = useState(
    user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Authoritative data counts
  const userBookings = dbRepository.getBookings(user?.id);
  const userAddresses = dbRepository.getAddresses(user?.id);
  const activeBookingsCount = userBookings.filter(
    (b) => !["COMPLETED", "CANCELLED"].includes(b.status)
  ).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      email,
      phone,
      avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* ========================================================================= */}
      {/* MOBILE ACCOUNT HUB (< md) */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-4">
        {/* Profile Card Header */}
        <div className="rounded-3xl border border-border bg-linear-to-br from-white to-slate-50 dark:from-[#0b2341] dark:to-[#071525] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[#FF6A00] shadow-md shrink-0">
              <img src={avatar} alt={fullName} className="h-full w-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-heading font-extrabold text-lg text-primary truncate">
                  {fullName}
                </h2>
                {user?.isVerified && (
                  <Badge variant="secondary" className="bg-[#FF6A00]/10 text-[#FF6A00] font-bold text-[9px] px-1.5 py-0.5">
                    PLUS
                  </Badge>
                )}
              </div>
              <p className="text-xs text-foreground-secondary truncate">{phone}</p>
              <p className="text-[11px] text-foreground-muted truncate">{email}</p>
            </div>

            <button
              type="button"
              onClick={() => setShowEditForm(!showEditForm)}
              className="min-touch-target p-2 rounded-xl border border-border bg-surface text-foreground-secondary hover:text-primary shrink-0 cursor-pointer"
              title="Edit Profile"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/70 text-center">
            <Link
              to={ROUTES.APP_BOOKINGS}
              className="p-2 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="text-base font-extrabold text-primary font-mono">{userBookings.length}</div>
              <div className="text-[10px] text-foreground-muted font-medium">Bookings</div>
            </Link>
            <Link
              to={ROUTES.APP_ADDRESSES}
              className="p-2 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="text-base font-extrabold text-primary font-mono">{userAddresses.length}</div>
              <div className="text-[10px] text-foreground-muted font-medium">Addresses</div>
            </Link>
            <Link
              to={ROUTES.APP_WALLET}
              className="p-2 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="text-base font-extrabold text-[#FF6A00] font-mono">
                {formatCurrency((user as any)?.walletBalance || (user as any)?.wallet_balance || 450)}
              </div>
              <div className="text-[10px] text-foreground-muted font-medium">Wallet</div>
            </Link>
          </div>
        </div>

        {/* PLUS VIP Membership Banner */}
        <Link
          to={ROUTES.APP_MEMBERSHIP}
          className="block p-4 rounded-3xl bg-linear-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-400/30 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-primary">Home-e-Fix PLUS VIP</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[9px]">
                    SAVE 20%
                  </span>
                </div>
                <p className="text-[10px] text-foreground-secondary mt-0.5">
                  Zero safety fees, priority 2-hr slots & 30-day warranty
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-primary shrink-0" />
          </div>
        </Link>

        {/* Inline Mobile Edit Profile Form */}
        {showEditForm && (
          <Card className="p-4 border border-border space-y-4 rounded-3xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-sm text-primary">Edit Personal Details</h3>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="text-xs text-foreground-muted hover:text-primary"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary mb-1 block">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 text-sm bg-surface"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary mb-1 block">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 text-sm bg-surface"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary mb-1 block">Mobile Number</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 text-sm bg-surface"
                />
              </div>

              {savedSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 shrink-0" /> Profile details saved!
                </div>
              )}

              <Button variant="accent" size="sm" type="submit" className="w-full font-bold">
                Save Details
              </Button>
            </form>
          </Card>
        )}

        {/* Group 1: My Activity */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted px-3">
            My Activity
          </div>
          <div className="rounded-3xl border border-border bg-surface divide-y divide-border overflow-hidden shadow-sm">
            <Link
              to={ROUTES.APP_BOOKINGS}
              className="min-touch-target p-3.5 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-primary">My Bookings</span>
              </div>
              <div className="flex items-center gap-1.5">
                {activeBookingsCount > 0 && (
                  <Badge variant="secondary" className="bg-[#FF6A00] text-white font-bold text-[9px] px-1.5">
                    {activeBookingsCount} Active
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-foreground-muted" />
              </div>
            </Link>

            <Link
              to={ROUTES.APP_INVOICES}
              className="min-touch-target p-3.5 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Receipt className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-primary">Invoices & Receipts</span>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground-muted" />
            </Link>

            <Link
              to={ROUTES.APP_WALLET}
              className="min-touch-target p-3.5 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Wallet className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-primary">Home-e-Fix Wallet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-emerald-600">
                  {formatCurrency((user as any)?.walletBalance || (user as any)?.wallet_balance || 450)}
                </span>
                <ChevronRight className="h-4 w-4 text-foreground-muted" />
              </div>
            </Link>
          </div>
        </div>

        {/* Group 2: Saved Locations & Preferences */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted px-3">
            Preferences
          </div>
          <div className="rounded-3xl border border-border bg-surface divide-y divide-border overflow-hidden shadow-sm">
            <Link
              to={ROUTES.APP_ADDRESSES}
              className="min-touch-target p-3.5 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-[#FF6A00] flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-primary">Saved Addresses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-foreground-muted">{userAddresses.length} saved</span>
                <ChevronRight className="h-4 w-4 text-foreground-muted" />
              </div>
            </Link>

            <div className="min-touch-target p-3.5 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-primary">30-Day Warranty Protection</span>
              </div>
              <span className="text-[11px] font-semibold text-success">Active</span>
            </div>
          </div>
        </div>

        {/* Group 3: Support & Emergency Assistance */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted px-3">
            Support & Help
          </div>
          <div className="rounded-3xl border border-border bg-surface divide-y divide-border overflow-hidden shadow-sm">
            <a
              href="tel:1800-FIX-HOME"
              className="min-touch-target p-3.5 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-primary block">24/7 Emergency Helpline</span>
                  <span className="text-[10px] text-foreground-muted">Priority dispatch in 2 hours</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#FF6A00]">Call Now</span>
            </a>

            <a
              href="https://wa.me/919830000000"
              target="_blank"
              rel="noopener noreferrer"
              className="min-touch-target p-3.5 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-primary">WhatsApp Support Chat</span>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground-muted" />
            </a>

            <Link
              to={ROUTES.APP_SUPPORT}
              className="min-touch-target p-3.5 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-primary">Frequently Asked Questions</span>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground-muted" />
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full min-touch-target p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out of Home-e-Fix</span>
        </button>

        <p className="text-[10px] text-center text-foreground-muted pt-1">
          Home-e-Fix v2.4.0 • Kolkata Hubs: Salt Lake & New Town
        </p>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP PROFILE VIEW (hidden md:block) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Account Profile</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Manage your personal information, contact details, and account settings
          </p>
        </div>

        <Card className="p-6 border border-border space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-accent shadow-md group">
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-5 w-5" />
                </div>
              </div>
              <div>
                <input
                  id="avatar-upload-desktop"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (reader.result) setAvatar(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => document.getElementById("avatar-upload-desktop")?.click()}
                >
                  Change Avatar
                </Button>
                <p className="text-[11px] text-foreground-muted mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="h-4 w-4 text-foreground-muted" />}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4 text-foreground-muted" />}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Mobile Number</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="h-4 w-4 text-foreground-muted" />}
                />
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Profile details saved successfully!
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="accent"
                size="lg"
                type="submit"
                leftIcon={<Save className="h-4 w-4" />}
                className="font-bold"
              >
                Save Profile Changes
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={handleLogout}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold text-xs"
              >
                Log Out
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
