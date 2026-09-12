import { useState } from "react";
import { Layers, Plus, Edit2, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVICE_CATEGORIES } from "@/constants/services";

export default function CategoriesCMS() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = SERVICE_CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Service Categories CMS</h1>
          <p className="text-sm text-foreground-secondary">
            Manage the 15+ trade sectors, category iconography, and active status.
          </p>
        </div>
        <Button variant="accent" className="gap-1.5 shadow-glow" onClick={() => alert("Add Category modal")}>
          <Plus className="h-4 w-4" /> Add New Category
        </Button>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Filter categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl p-2 rounded-xl bg-accent/10">{cat.icon}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-success/10 text-success font-bold">
                Active
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-primary">{cat.name}</h3>
              <p className="text-xs text-foreground-muted">{cat.count} Catalog Services</p>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
              <span className="font-mono">{cat.slug}</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Edit2 className="h-3 w-3" /> Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
