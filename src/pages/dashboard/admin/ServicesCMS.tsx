import { useState, useEffect, useMemo } from "react";
import {
  Plus, Wrench, Edit, Trash2, ChevronDown, ChevronUp, Search,
  Check, Star, Clock, Save, Shield, Receipt, Moon, RefreshCw, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogHeader, DialogTitle, DialogDescription,
  DialogContent, DialogFooter
} from "@/components/ui/dialog";
import { dbRepository } from "@/services/db/repository";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { RATE_CARD_POLICIES } from "@/constants/services";

export default function ServicesCMS() {
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; edit?: any }>({ open: false });
  const [serviceModal, setServiceModal] = useState<{ open: boolean; categorySlug: string; edit?: any }>({ open: false, categorySlug: "" });
  const [notificationMsg, setNotificationMsg] = useState("");

  const loadData = () => {
    setCategories(dbRepository.getServiceCategories());
    setServices(dbRepository.getAllServices());
  };

  useEffect(() => { loadData(); }, []);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  const getServicesForCategory = (slug: string) => {
    return services.filter(s => s.categorySlug === slug || (slug === "appliances" && s.categorySlug === "appliance"));
  };

  const handleSaveCategory = (cat: any) => {
    dbRepository.saveServiceCategory(cat);
    loadData();
    setCategoryModal({ open: false });
    showNotification(`Category "${cat.name}" saved successfully.`);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Delete this category and all its services?")) {
      dbRepository.deleteServiceCategory(id);
      loadData();
      showNotification("Category deleted.");
    }
  };

  const handleSaveService = (svc: any) => {
    const cat = categories.find(c => c.slug === serviceModal.categorySlug);
    const serviceToSave = {
      ...svc,
      categorySlug: serviceModal.categorySlug,
      category: cat ? { slug: cat.slug, name: cat.name } : undefined,
      visitingCharge: svc.visitingCharge || "Waived if service availed",
      finalBillFormula: svc.finalBillFormula || "Base + GST + Spares"
    };
    dbRepository.saveService(serviceToSave);
    loadData();
    setServiceModal({ open: false, categorySlug: "" });
    showNotification(`Service "${svc.name}" saved successfully.`);
  };

  const handleDeleteService = (id: string) => {
    if (confirm("Delete this service?")) {
      dbRepository.deleteService(id);
      loadData();
      showNotification("Service deleted.");
    }
  };

  const handleResetRateCards = () => {
    if (confirm("Reset catalog to the official 80+ item Rate Card for Electrical & Plumbing? Any custom items will be restored to defaults.")) {
      const res = dbRepository.resetToStandardRateCards();
      setCategories(res.categories);
      setServices(res.services);
      showNotification("Service catalog refreshed to official Rate Cards (80+ items loaded).");
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      services.some(s => s.categorySlug === c.slug && s.name.toLowerCase().includes(q))
    );
  }, [categories, services, searchQuery]);

  const totalServices = services.length;
  const popularServices = services.filter(s => s.isPopular).length;

  // ─── CATEGORY CARD ───
  const CategoryCard = ({ 
    cat, 
    services: catServices, 
    isExpanded, 
    onToggle, 
    onEditCategory, 
    onAddService, 
    onEditService, 
    onDeleteService, 
    onDeleteCategory 
  }: any) => {
    // Unique subcategories for pills
    const subCategories = useMemo(() => {
      const subs = Array.from(new Set(catServices.map((s: any) => s.subCategory).filter(Boolean)));
      return subs as string[];
    }, [catServices]);

    const activeSub = selectedSubCategory[cat.slug] || "ALL";

    const displayedServices = useMemo(() => {
      let list = catServices;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter((s: any) => s.name.toLowerCase().includes(q) || (s.shortDescription && s.shortDescription.toLowerCase().includes(q)));
      }
      if (activeSub !== "ALL") {
        list = list.filter((s: any) => s.subCategory === activeSub);
      }
      return list;
    }, [catServices, activeSub, searchQuery]);

    return (
      <Card key={cat.id} className="p-5 border border-border space-y-3 hover:shadow-lg transition-shadow bg-surface" style={{ borderLeft: `4px solid ${cat.color || "#3B82F6"}` }}>
        <div className="flex items-start justify-between cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl shrink-0">{cat.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading text-base font-bold text-primary truncate">{cat.name}</h4>
                <Badge variant="secondary" className="text-[10px] h-4 px-2">{catServices.length} Services</Badge>
              </div>
              <span className="text-[10px] text-foreground-muted block line-clamp-1">{cat.description}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="accent" className="text-[10px]">From {formatCurrency(cat.startingPrice)}</Badge>
            {isExpanded ? <ChevronUp className="h-4 w-4 text-foreground-secondary" /> : <ChevronDown className="h-4 w-4 text-foreground-secondary" />}
          </div>
        </div>

        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-foreground-secondary">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-emerald-600" /> {cat.warranty || "30-Day Warranty"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {cat.estimatedTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onEditCategory(); }}>
              <Edit className="h-3 w-3" /> Edit
            </Button>
            <Button variant="accent" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onAddService(); }}>
              <Plus className="h-3 w-3" /> Add Service
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-600 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat.id); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* EXPANDED SERVICE LIST */}
        {isExpanded && (
          <div className="pt-3 space-y-3 border-t border-border">
            {/* SUB-CATEGORY PILLS */}
            {subCategories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory(prev => ({ ...prev, [cat.slug]: "ALL" }))}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                    activeSub === "ALL" 
                      ? "bg-primary text-white" 
                      : "bg-surface-secondary text-foreground-secondary hover:bg-muted"
                  }`}
                >
                  All ({catServices.length})
                </button>
                {subCategories.map(sub => {
                  const subCount = catServices.filter((s: any) => s.subCategory === sub).length;
                  const isActive = activeSub === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubCategory(prev => ({ ...prev, [cat.slug]: sub }))}
                      className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                        isActive 
                          ? "bg-accent text-white" 
                          : "bg-surface-secondary text-foreground-secondary hover:bg-muted"
                      }`}
                    >
                      {sub} ({subCount})
                    </button>
                  );
                })}
              </div>
            )}

            {/* SERVICES */}
            <div className="space-y-2 max-h-120 overflow-y-auto pr-1">
              {displayedServices.map((svc: any) => (
                <div key={svc.id} className="p-3 rounded-xl border border-border bg-surface/70 hover:bg-surface transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-primary truncate">{svc.name}</span>
                      {svc.subCategory && (
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-muted/50 border-border">
                          {svc.subCategory}
                        </Badge>
                      )}
                      {svc.isPopular && <Badge variant="accent" className="text-[9px]">Popular</Badge>}
                    </div>

                    <p className="text-[11px] text-foreground-secondary line-clamp-1">{svc.shortDescription}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-foreground-muted">
                      <span className="font-semibold text-primary">
                        ₹{svc.discountedPrice || svc.basePrice}
                        {svc.discountedPrice && svc.discountedPrice < svc.basePrice && (
                          <span className="line-through text-rose-500 font-normal ml-1">₹{svc.basePrice}</span>
                        )}
                      </span>
                      <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {formatDuration(svc.duration)}</span>
                      <span className="flex items-center gap-1"><Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> {svc.rating || 4.8} ({svc.reviewCount || 100})</span>
                      {svc.sparesPolicy && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {svc.sparesPolicy}
                        </span>
                      )}
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {svc.warrantyDays ? `${svc.warrantyDays}-Day Warranty` : "30-Day Warranty"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onEditService(svc)}>
                      <Edit className="h-3 w-3" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-600 hover:bg-rose-50" onClick={() => onDeleteService(svc.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {displayedServices.length === 0 && (
                <div className="text-center text-xs text-foreground-muted py-6">
                  No services matching the selected filter.
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  };

  // ─── CATEGORY EDIT MODAL ───
  const CategoryEditModal = ({ open, category, onClose, onSave }: any) => {
    const [form, setForm] = useState({
      id: "", name: "", slug: "", icon: "", description: "",
      startingPrice: 49, estimatedTime: "30-45 mins", color: "#3B82F6",
      warranty: "30-Day Service Warranty", bannerImage: ""
    });

    useEffect(() => {
      if (open) {
        setForm(category ? { ...category } : {
          id: "", name: "", slug: "", icon: "⚡", description: "",
          startingPrice: 49, estimatedTime: "30-45 mins", color: "#3B82F6",
          warranty: "30-Day Service Warranty", bannerImage: ""
        });
      }
    }, [open, category]);

    if (!open) return null;

    return (
      <Dialog open={open} onClose={onClose} size="lg">
        <DialogHeader onClose={onClose}>
          <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
          <DialogDescription>Manage service category details, starting price, and coverage</DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Name</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Electrical" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Slug</label>
              <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="e.g. electrical" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Icon (Emoji)</label>
              <Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="⚡" maxLength={2} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Color (Hex)</label>
              <Input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="#3B82F6" type="color" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Starting Price (₹)</label>
              <Input type="number" value={form.startingPrice} onChange={e => setForm({ ...form, startingPrice: Number(e.target.value) })} min={0} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Estimated Time</label>
              <Input value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: e.target.value })} placeholder="30-45 mins" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Warranty</label>
              <Input value={form.warranty} onChange={e => setForm({ ...form, warranty: e.target.value })} placeholder="30-Day Service Warranty" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Banner Image URL</label>
              <Input value={form.bannerImage} onChange={e => setForm({ ...form, bannerImage: e.target.value })} placeholder="https://images.unsplash.com/..." />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Description</label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Category description..." />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="accent" size="sm" onClick={() => onSave(form)} className="font-bold">
            <Save className="h-3.5 w-3.5" /> {category ? "Update Category" : "Create Category"}
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };

  // ─── SERVICE EDIT MODAL ───
  const ServiceEditModal = ({ open, categorySlug, service, onClose, onSave }: any) => {
    const [form, setForm] = useState({
      id: "", name: "", slug: "", subCategory: "", shortDescription: "",
      basePrice: 99, discountedPrice: 99, duration: 30,
      rating: undefined as number | undefined, reviewCount: 0, isPopular: false, thumbnail: "",
      sparesPolicy: "Extra at actuals",
      finalBillFormula: "Base + GST + Spares",
      warrantyDays: 30
    });

    useEffect(() => {
      if (open) {
        setForm(service ? {
          ...service,
          subCategory: service.subCategory || "",
          sparesPolicy: service.sparesPolicy || "Extra at actuals",
          finalBillFormula: service.finalBillFormula || "Base + GST + Spares",
          warrantyDays: service.warrantyDays ?? 30
        } : {
          id: "", name: "", slug: "", subCategory: "", shortDescription: "",
          basePrice: 99, discountedPrice: 99, duration: 30,
          rating: undefined, reviewCount: 0, isPopular: false, thumbnail: "",
          sparesPolicy: "Extra at actuals",
          finalBillFormula: "Base + GST + Spares",
          warrantyDays: 30
        });
      }
    }, [open, service]);

    if (!open) return null;

    return (
      <Dialog open={open} onClose={onClose} size="lg">
        <DialogHeader onClose={onClose}>
          <DialogTitle>{service ? "Edit Rate Card Service" : "Add New Service"}</DialogTitle>
          <DialogDescription>Configure service pricing, sub-category, spares policy, and rework warranty</DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Name</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Switch/Socket Repair" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Sub-Category</label>
              <Input value={form.subCategory} onChange={e => setForm({ ...form, subCategory: e.target.value })} placeholder="e.g. Switch & Socket / Tap & Mixer" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Slug</label>
              <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="e.g. switch-socket-repair" required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Short Description</label>
              <Textarea value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} rows={2} placeholder="Brief description..." required />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Base Labor Price (₹)</label>
              <Input type="number" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: Number(e.target.value) })} min={0} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Discounted Price (₹)</label>
              <Input type="number" value={form.discountedPrice} onChange={e => setForm({ ...form, discountedPrice: Number(e.target.value) })} min={0} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Duration (minutes)</label>
              <Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} min={1} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Spares & Materials Policy</label>
              <Input value={form.sparesPolicy} onChange={e => setForm({ ...form, sparesPolicy: e.target.value })} placeholder="e.g. Extra (Plug tops) / N/A" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Rework Warranty (Days)</label>
              <Input type="number" value={form.warrantyDays} onChange={e => setForm({ ...form, warrantyDays: Number(e.target.value) })} min={0} placeholder="30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Final Bill Formula</label>
              <Input value={form.finalBillFormula} onChange={e => setForm({ ...form, finalBillFormula: e.target.value })} placeholder="Base + GST + Spares" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Rating (0-5)</label>
              <Input type="number" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} min={0} max={5} step={0.1} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Review Count</label>
              <Input type="number" value={form.reviewCount} onChange={e => setForm({ ...form, reviewCount: Number(e.target.value) })} min={0} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Thumbnail Image URL</label>
              <Input value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://images.unsplash.com/..." />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isPopular" checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })} className="h-4 w-4 rounded border-border text-accent cursor-pointer" />
              <label htmlFor="isPopular" className="text-sm font-medium text-foreground cursor-pointer">Mark as Popular Service</label>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="accent" size="sm" onClick={() => onSave(form)} className="font-bold">
            <Save className="h-3.5 w-3.5" /> {service ? "Update Service" : "Create Service"}
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Service Catalogue & Rate Card CMS</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Manage 80+ standardized trade services across Electrical, Plumbing, and 15 categories with transparent rate card rules
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={handleResetRateCards}>
            Re-sync Standard Rate Card
          </Button>
          <Button variant="accent" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCategoryModal({ open: true })}>
            Add New Category
          </Button>
        </div>
      </div>

      {/* NOTIFICATION */}
      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          {notificationMsg}
        </div>
      )}

      {/* POLICY HIGHLIGHTS BANNER */}
      <Card className="p-4 border border-accent/20 bg-accent/5 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-accent" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-accent">Standard Service & Pricing Policies</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-surface border border-border/60">
            <div className="font-semibold text-primary flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Visiting Fee
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              {RATE_CARD_POLICIES.visitingFee.range} • {RATE_CARD_POLICIES.visitingFee.waiver}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-surface border border-border/60">
            <div className="font-semibold text-primary flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-500" /> Service Warranty
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              30-Day Workmanship Re-work Guarantee on all verified app bookings
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-surface border border-border/60">
            <div className="font-semibold text-primary flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-blue-500" /> Taxation (GST)
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              18% GST Extra calculated on net labor total
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-surface border border-border/60">
            <div className="font-semibold text-primary flex items-center gap-1.5">
              <Moon className="h-3.5 w-3.5 text-purple-500" /> Peak/Night Surcharge
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              Flat ₹150 for orders scheduled post 8:00 PM
            </p>
          </div>
        </div>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border border-border text-center space-y-0.5">
          <div className="text-[11px] text-foreground-secondary font-semibold">Total Categories</div>
          <div className="font-heading text-2xl font-extrabold text-primary">{categories.length}</div>
        </Card>
        <Card className="p-4 border border-border text-center space-y-0.5">
          <div className="text-[11px] text-foreground-secondary font-semibold">Total Sub-Services</div>
          <div className="font-heading text-2xl font-extrabold text-accent">{totalServices}</div>
        </Card>
        <Card className="p-4 border border-border text-center space-y-0.5">
          <div className="text-[11px] text-foreground-secondary font-semibold">Popular Services</div>
          <div className="font-heading text-2xl font-extrabold text-emerald-600">{popularServices}</div>
        </Card>
        <Card className="p-4 border border-border text-center space-y-0.5">
          <div className="text-[11px] text-foreground-secondary font-semibold">Starting Labor Rate</div>
          <div className="font-heading text-2xl font-extrabold text-amber-500">₹49</div>
        </Card>
      </div>

      {/* SEARCH */}
      <div className="w-full sm:w-80">
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search categories, sub-services..."
          leftIcon={<Search className="h-4 w-4 text-foreground-muted" />}
        />
      </div>

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const catServices = getServicesForCategory(cat.slug);
          const isExpanded = expandedSlug === cat.slug;
          return (
            <CategoryCard
              key={cat.id}
              cat={cat}
              services={catServices}
              isExpanded={isExpanded}
              onToggle={() => setExpandedSlug(isExpanded ? null : cat.slug)}
              onEditCategory={() => setCategoryModal({ open: true, edit: cat })}
              onAddService={() => setServiceModal({ open: true, categorySlug: cat.slug })}
              onEditService={(svc: any) => setServiceModal({ open: true, categorySlug: cat.slug, edit: svc })}
              onDeleteService={handleDeleteService}
              onDeleteCategory={handleDeleteCategory}
            />
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {filteredCategories.length === 0 && (
        <Card className="p-12 text-center border-dashed">
          <Wrench className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-sm font-semibold text-primary">No categories or services found</p>
          <p className="text-xs text-foreground-secondary mt-1">Try adjusting your search query or reset to default rate cards</p>
        </Card>
      )}

      {/* MODALS */}
      <CategoryEditModal
        open={categoryModal.open}
        category={categoryModal.edit}
        onClose={() => setCategoryModal({ open: false })}
        onSave={handleSaveCategory}
      />
      <ServiceEditModal
        open={serviceModal.open}
        categorySlug={serviceModal.categorySlug}
        service={serviceModal.edit}
        onClose={() => setServiceModal({ open: false, categorySlug: "" })}
        onSave={handleSaveService}
      />
    </div>
  );
}