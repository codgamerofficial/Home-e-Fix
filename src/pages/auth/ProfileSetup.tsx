import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Sparkles,
  ArrowRight,
  Camera,
  CheckCircle,
  Bell,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProgressTimeline } from "@/components/ui/progress-timeline";
import { ROUTES } from "@/constants/routes";
import { SERVICE_CATEGORIES } from "@/constants/services";
import { useAuthStore } from "@/store/auth.store";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [step, setStep] = useState(0);

  // Step 1: Personal Info
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80");
  const [fullName, setFullName] = useState("Priya Sharma");
  const [gender, setGender] = useState("female");
  const [dob, setDob] = useState("1996-05-15");

  // Step 2: Address
  const [houseNo, setHouseNo] = useState("Flat 402, Rainbow Vistas");
  const [street, setStreet] = useState("Rock Gardens, Hitech City");
  const [city, setCity] = useState("Hyderabad");
  const [pincode, setPincode] = useState("500081");

  // Step 3: Preferences & Notifications
  const [selectedCats, setSelectedCats] = useState<string[]>(["ac", "plumbing", "electrical"]);
  const [enableWhatsapp, setEnableWhatsapp] = useState(true);
  const [enableSms, setEnableSms] = useState(true);

  const toggleCategory = (slug: string) => {
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleFinishOnboarding = () => {
    updateProfile({
      fullName,
      avatar,
    });
    navigate(ROUTES.HOME);
  };

  const stepperItems = [
    { title: "Personal Details", status: step > 0 ? "completed" : step === 0 ? "current" : "upcoming" },
    { title: "Default Address", status: step > 1 ? "completed" : step === 1 ? "current" : "upcoming" },
    { title: "Preferences", status: step === 2 ? "current" : "upcoming" },
  ] as const;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-6">
      <div className="text-center space-y-2">
        <Badge variant="accent" className="px-3 py-1 text-xs">
          ✨ Account Created
        </Badge>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
          Complete Your Profile
        </h1>
        <p className="text-xs text-foreground-secondary">
          Personalize your Home-e-Fix experience in 3 quick steps
        </p>
      </div>

      <ProgressTimeline steps={stepperItems as any} orientation="horizontal" />

      <Card className="p-6 sm:p-8 border border-border/80 shadow-xl">
        <AnimatePresence mode="wait">
          {/* STEP 0: PERSONAL DETAILS */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="font-heading text-lg font-bold text-primary">
                1. Avatar & Personal Info
              </h3>

              {/* Avatar Uploader Preview */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-accent shadow-md group">
                  <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6" />
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => alert("Photo picker opened!")}>
                  Change Profile Photo
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                    Full Name
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Priya Sharma"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: DEFAULT ADDRESS */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="font-heading text-lg font-bold text-primary">
                2. Primary Service Address
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                    Flat / House No / Building Name
                  </label>
                  <Input
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    placeholder="Flat 402, Rainbow Vistas"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                    Street / Area / Landmark
                  </label>
                  <Input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Rock Gardens, Hitech City"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                      City
                    </label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Hyderabad"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                      Pincode
                    </label>
                    <Input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="500081"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PREFERENCES */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="font-heading text-lg font-bold text-primary">
                3. Favorite Categories & Notifications
              </h3>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground-secondary block">
                  Select your frequently needed service categories:
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_CATEGORIES.slice(0, 8).map((cat) => {
                    const isSelected = selectedCats.includes(cat.slug);

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.slug)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-accent text-white border-accent shadow-xs"
                            : "bg-surface text-primary border-border hover:border-accent"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="pt-4 border-t border-border space-y-3">
                <label className="text-xs font-semibold text-foreground-secondary block">
                  Notification Preferences:
                </label>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-accent" />
                    <span className="text-xs font-medium text-primary">WhatsApp Booking Status Updates</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableWhatsapp}
                    onChange={(e) => setEnableWhatsapp(e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-accent" />
                    <span className="text-xs font-medium text-primary">SMS Reminders & Arrival Notifications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSms}
                    onChange={(e) => setEnableSms(e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM ACTIONS */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (step > 0) setStep(step - 1);
            }}
            disabled={step === 0}
          >
            Back
          </Button>

          {step < 2 ? (
            <Button
              variant="accent"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => setStep(step + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="accent"
              size="lg"
              rightIcon={<CheckCircle className="h-5 w-5" />}
              onClick={handleFinishOnboarding}
              className="font-bold shadow-glow"
            >
              Complete Onboarding & Start Exploring
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
