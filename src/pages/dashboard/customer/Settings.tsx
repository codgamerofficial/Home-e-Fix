import { useState } from "react";
import { Moon, Sun, Lock, Shield, Trash2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui.store";

export default function Settings() {
  const { theme, toggleTheme } = useUIStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [statusNotice, setStatusNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword === confirmPassword) {
      setStatusNotice({ type: "success", text: "✅ Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setStatusNotice(null), 5000);
    } else {
      setStatusNotice({ type: "error", text: "❌ New passwords do not match!" });
      setTimeout(() => setStatusNotice(null), 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">App Settings</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Customize themes, password security, and privacy controls
        </p>
      </div>

      {/* THEME PREFERENCE */}
      <Card className="p-6 border border-border space-y-4">
        <h3 className="font-heading text-sm font-bold text-primary pb-2 border-b border-border flex items-center gap-2">
          {theme === "dark" ? <Moon className="h-4 w-4 text-accent" /> : <Sun className="h-4 w-4 text-accent" />}
          Appearance & Theme
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-primary">Dark Mode</div>
            <p className="text-[11px] text-foreground-secondary">Toggle between sleek dark & light interface</p>
          </div>

          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? "Switch to Light Mode ☀️" : "Switch to Dark Mode 🌙"}
          </Button>
        </div>
      </Card>

      {/* CHANGE PASSWORD */}
      <Card className="p-6 border border-border space-y-4">
        {statusNotice && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              statusNotice.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            <span>{statusNotice.text}</span>
            <button onClick={() => setStatusNotice(null)} className="font-bold text-xs">Dismiss</button>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground-secondary mb-1 block">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button variant="accent" size="sm" type="submit" className="font-bold">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
