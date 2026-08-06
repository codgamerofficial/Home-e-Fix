import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Wrench, Shield, Home as HomeIcon, ChevronUp, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";

export function RoleSwitcherWidget() {
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentRole = user?.role || "customer";

  const handleRoleSwitch = (role: "customer" | "technician" | "admin" | "public") => {
    setIsOpen(false);

    if (role === "public") {
      navigate(ROUTES.HOME);
      return;
    }

    const mockUser: any = {
      id: `usr-${role}-demo`,
      email: `${role}@homeefix.com`,
      fullName: role === "technician" ? "Suresh Reddy (Pro)" : role === "admin" ? "System Administrator" : "Priya Sharma",
      phone: "+91 98765 43210",
      role,
      isEmailVerified: true,
      isPhoneVerified: true,
      avatar: role === "technician" ? "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&q=80" : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    };

    login(mockUser, "mock-demo-token", "mock-refresh-token");

    if (role === "customer") navigate("/dashboard/orders");
    if (role === "technician") navigate("/technician/jobs");
    if (role === "admin") navigate("/admin/analytics");
  };

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {isOpen && (
        <div className="mb-2 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl space-y-1 w-56 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" /> Switch Demo View
          </div>

          <button
            type="button"
            onClick={() => handleRoleSwitch("customer")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentRole === "customer" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "hover:bg-slate-800 text-slate-200"
            }`}
          >
            <User className="h-4 w-4 text-amber-400" />
            <span>Customer Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch("technician")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentRole === "technician" ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" : "hover:bg-slate-800 text-slate-200"
            }`}
          >
            <Wrench className="h-4 w-4 text-blue-400" />
            <span>Technician Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch("admin")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentRole === "admin" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "hover:bg-slate-800 text-slate-200"
            }`}
          >
            <Shield className="h-4 w-4 text-purple-400" />
            <span>Admin Center</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch("public")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 text-slate-300 transition-all cursor-pointer border-t border-slate-800 mt-1"
          >
            <HomeIcon className="h-4 w-4 text-emerald-400" />
            <span>Public Storefront</span>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 text-white border border-amber-500/50 shadow-xl hover:bg-slate-800 transition-all text-xs font-bold cursor-pointer group backdrop-blur-md"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="capitalize">{currentRole} View</span>
        <ChevronUp className={`h-3.5 w-3.5 text-amber-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
