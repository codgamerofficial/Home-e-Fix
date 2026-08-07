import { useState } from "react";
import { User, Mail, Phone, Camera, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";

export default function Profile() {
  const { user, updateProfile } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || "Priya Sharma");
  const [email, setEmail] = useState(user?.email || "priya@homeefix.com");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [avatar, setAvatar] = useState(user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80");
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Account Profile</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Manage your personal information and contact details
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
                id="avatar-upload"
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
                onClick={() => document.getElementById("avatar-upload")?.click()}
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

          <Button variant="accent" size="lg" type="submit" leftIcon={<Save className="h-4 w-4" />} className="font-bold">
            Save Profile Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
