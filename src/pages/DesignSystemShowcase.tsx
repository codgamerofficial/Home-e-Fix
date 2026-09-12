import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  RadioGroup,
  RadioGroupItem,
  MediaUploadDropzone,
  type UploadedFile,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Breadcrumbs,
  Pagination,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  StatusChip,
  Rating,
  Skeleton,
  CardSkeleton,
  AvatarSkeleton,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  Sheet,
  SheetHeader,
  SheetContent,
} from "@/components/ui";
import {
  Wrench,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  Search,
  Check,
  AlertTriangle,
  Layers,
  Palette,
} from "lucide-react";
import { BRAND_COLORS } from "@/constants/theme";

export default function DesignSystemShowcase() {
  // Modal & Sheet States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Form States
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [selectValue, setSelectValue] = useState("ac");
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [radioValue, setRadioValue] = useState("upi");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentPage, setCurrentPage] = useState(2);
  const [rating, setRating] = useState(4.5);

  const sampleTableData = [
    { id: "BK-991", customer: "Anirban Mukherjee", service: "Split AC Jet Deep Cleaning", amount: "₹899", status: "completed" as const },
    { id: "BK-992", customer: "Deblina Roy", service: "MCB Box Short Circuit Fix", amount: "₹499", status: "in_progress" as const },
    { id: "BK-993", customer: "Rajesh Sen", service: "Water Heater Installation", amount: "₹699", status: "confirmed" as const },
    { id: "BK-994", customer: "Sourav Ganguly", service: "Kitchen Sink Mixer Repair", amount: "₹399", status: "pending" as const },
  ];

  return (
    <div className="py-12 md:py-16 space-y-16">
      <div className="container-app space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" /> Milestone 2 Design System
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
            Home-e-Fix Component System & UI Library
          </h1>
          <p className="text-foreground-secondary text-base md:text-lg leading-relaxed">
            Every component is crafted according to Home-e-Fix brand tokens: Navy (<span className="font-mono font-bold text-primary">#0B2341</span>), Electric Orange (<span className="font-mono font-bold text-accent">#FF6A00</span>), 4/8px spacing grid, Inter typography, and subtle liquid-glass depth.
          </p>
        </div>

        {/* ─── 1. Brand Tokens & Color Palette ─── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
            <Palette className="h-6 w-6 text-accent" /> 1. Brand Tokens & Color Palette
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: "Navy (Primary)", hex: "#0B2341", bg: "bg-[#0B2341]", text: "text-white" },
              { name: "Orange (Accent)", hex: "#FF6A00", bg: "bg-[#FF6A00]", text: "text-white" },
              { name: "Dark (Base Dark)", hex: "#071525", bg: "bg-[#071525]", text: "text-white" },
              { name: "Background", hex: "#F8FAFC", bg: "bg-[#F8FAFC]", text: "text-slate-900 border border-border" },
              { name: "Text (Foreground)", hex: "#111827", bg: "bg-[#111827]", text: "text-white" },
              { name: "Muted Neutral", hex: "#64748B", bg: "bg-[#64748B]", text: "text-white" },
              { name: "Success Green", hex: "#22C55E", bg: "bg-[#22C55E]", text: "text-white" },
              { name: "Warning Amber", hex: "#F59E0B", bg: "bg-[#F59E0B]", text: "text-white" },
              { name: "Error Crimson", hex: "#EF4444", bg: "bg-[#EF4444]", text: "text-white" },
              { name: "Border Slate", hex: "#E2E8F0", bg: "bg-[#E2E8F0]", text: "text-slate-900" },
            ].map((color) => (
              <div
                key={color.name}
                className="rounded-2xl border border-border bg-surface p-3 shadow-xs space-y-2"
              >
                <div className={`h-16 w-full rounded-xl ${color.bg}`} />
                <div>
                  <h4 className="font-bold text-xs text-primary truncate">{color.name}</h4>
                  <span className="text-[11px] font-mono text-foreground-muted">{color.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 2. Buttons Suite ─── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
            <Zap className="h-6 w-6 text-accent" /> 2. Buttons & States
          </h2>

          <div className="rounded-2xl border border-border bg-surface p-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">
                Variants
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="accent" className="shadow-glow">
                  Accent CTA (Orange)
                </Button>
                <Button variant="default">Primary Navy</Button>
                <Button variant="secondary">Secondary Muted</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="destructive">Destructive Error</Button>
                <Button variant="link">Text Link</Button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">
                Sizes & Icons
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="accent" size="sm">
                  Small Button
                </Button>
                <Button variant="accent" size="default" leftIcon={<Wrench className="h-4 w-4" />}>
                  With Left Icon
                </Button>
                <Button variant="default" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Large With Right Icon
                </Button>
                <Button variant="accent" isLoading>
                  Loading State
                </Button>
                <Button variant="outline" disabled>
                  Disabled
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. Cards & Liquid Glass ─── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
            <Layers className="h-6 w-6 text-accent" /> 3. Cards & Liquid Glass Depth
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Card */}
            <Card hover>
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-2">
                  <Wrench className="h-5 w-5" />
                </div>
                <CardTitle>Standard Card (Hoverable)</CardTitle>
                <CardDescription>Clean white surface with subtle 4px/8px shadow-card.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-foreground-secondary">
                  Interactive state activates smooth translateY(-4px) and subtle shadow elevation.
                </p>
              </CardContent>
            </Card>

            {/* Liquid Glass Card */}
            <div className="rounded-2xl p-1 bg-linear-to-br from-primary via-primary-light to-accent">
              <Card variant="glass" className="h-full">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-white/20 text-white flex items-center justify-center mb-2">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-white">Liquid Glass Card</CardTitle>
                  <CardDescription className="text-white/80">
                    `rgba(255,255,255,0.08)` with 12px backdrop-filter blur.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-white/90">
                    Used selectively for headers, floating CTAs, and booking progress modals over media.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Accent Card */}
            <Card variant="accent">
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-accent">Accent Highlight Card</CardTitle>
                <CardDescription>Tinged with 5% orange background for VIP & alerts.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-foreground-secondary">
                  Ideal for warranty badges, VIP PLUS membership banners, and emergency dispatches.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─── 4. Form Controls & Upload ─── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
            <Wrench className="h-6 w-6 text-accent" /> 4. Form Controls & Media Dropzone
          </h2>

          <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Text Input */}
              <Input
                label="Full Name"
                placeholder="Enter customer name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Required for booking confirmation receipt"
              />

              {/* Input with Icon */}
              <Input
                label="Search Services"
                placeholder="Try 'fan installation'..."
                leftIcon={<Search className="h-4 w-4" />}
                onClear={() => setInputValue("")}
              />

              {/* Select */}
              <Select
                label="Select Trade Sector"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={[
                  { value: "elec", label: "Electrical Repairs (42 services)" },
                  { value: "plumb", label: "Plumbing Maintenance (38 services)" },
                  { value: "ac", label: "AC Repair & Jet Cleaning (29 services)" },
                  { value: "carp", label: "Carpentry & Furniture (35 services)" },
                ]}
              />
            </div>

            {/* Textarea */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Textarea
                label="Describe Problem / Fault Symptoms"
                placeholder="e.g. Indoor split AC leaking water from the right corner..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                maxCharacters={300}
                helperText="Provide any helpful instructions for the visiting technician"
              />

              {/* Checkbox, Switch, Radio */}
              <div className="space-y-4 rounded-xl border border-border p-4 bg-muted/20">
                <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">
                  Toggles & Options
                </span>

                <Checkbox
                  label="I agree to Home-e-Fix Service Warranty terms"
                  description="Backed by 30-day rework protection guarantee"
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                />

                <div className="pt-2 border-t border-border">
                  <Switch
                    label="Emergency Priority Dispatch"
                    description="Guaranteed 45-minute arrival window"
                    checked={switchChecked}
                    onCheckedChange={setSwitchChecked}
                  />
                </div>

                <div className="pt-2 border-t border-border space-y-2">
                  <span className="text-xs font-semibold text-foreground block">
                    Payment Method
                  </span>
                  <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                    <RadioGroupItem
                      value="upi"
                      label="Instant UPI (Google Pay, PhonePe, Paytm)"
                      description="Zero convenience fee"
                    />
                    <RadioGroupItem
                      value="cashless"
                      label="Credit / Debit Card / NetBanking"
                      description="Secure 256-bit encrypted checkout"
                    />
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Media Upload Dropzone */}
            <div className="pt-4 border-t border-border">
              <MediaUploadDropzone
                label="Upload Fault Images / Audio Notes"
                helperText="Drag photos of the leaking pipe, burnt socket, or damaged furniture"
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
              />
            </div>
          </div>
        </section>

        {/* ─── 5. Navigation Suite ─── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
            <ArrowRight className="h-6 w-6 text-accent" /> 5. Navigation Components
          </h2>

          <div className="rounded-2xl border border-border bg-surface p-6 space-y-8">
            {/* Breadcrumbs */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">
                Breadcrumbs Trail
              </span>
              <Breadcrumbs
                items={[
                  { label: "Home Services", href: "/services" },
                  { label: "Electrical", href: "/services/electrical" },
                  { label: "Ceiling Fan Installation & Repair" },
                ]}
              />
            </div>

            {/* Underline Tabs */}
            <div className="space-y-3 pt-4 border-t border-border">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">
                Underline Animated Tabs (with Framer Motion LayoutId)
              </span>
              <Tabs defaultValue="upcoming" variant="underline">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming Bookings (2)</TabsTrigger>
                  <TabsTrigger value="completed">Completed History (14)</TabsTrigger>
                  <TabsTrigger value="warranty">Active Warranties (3)</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="p-4 rounded-xl bg-muted/30 text-sm">
                  Active job: Split AC Jet Cleaning scheduled for today at 2:30 PM.
                </TabsContent>
                <TabsContent value="completed" className="p-4 rounded-xl bg-muted/30 text-sm">
                  14 historical jobs successfully completed with 5-star ratings.
                </TabsContent>
                <TabsContent value="warranty" className="p-4 rounded-xl bg-muted/30 text-sm">
                  3 services currently covered under the 30-Day Home-e-Fix Re-work Warranty.
                </TabsContent>
              </Tabs>
            </div>

            {/* Pill Tabs */}
            <div className="space-y-3 pt-4 border-t border-border">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">
                Segmented Pill Tabs
              </span>
              <Tabs defaultValue="all" variant="pills">
                <TabsList>
                  <TabsTrigger value="all">All Services</TabsTrigger>
                  <TabsTrigger value="emergency">Emergency Only</TabsTrigger>
                  <TabsTrigger value="popular">Most Popular</TabsTrigger>
                  <TabsTrigger value="plus">PLUS Deals</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Pagination */}
            <div className="space-y-3 pt-4 border-t border-border">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">
                Pagination Control
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={8}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </section>

        {/* ─── 6. Data Tables ─── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
            <Layers className="h-6 w-6 text-accent" /> 6. Data Tables
          </h2>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleTableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono font-bold text-accent">{row.id}</TableCell>
                  <TableCell className="font-semibold text-primary">{row.customer}</TableCell>
                  <TableCell>{row.service}</TableCell>
                  <TableCell className="font-bold">{row.amount}</TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {/* ─── 7. Status & Feedback ─── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
            <Check className="h-6 w-6 text-accent" /> 7. Status Chips, Badges & Skeletons
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">
                Status Chips (with Live Pulsing Dots)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status="pending" />
                <StatusChip status="confirmed" />
                <StatusChip status="assigned" />
                <StatusChip status="in_progress" />
                <StatusChip status="completed" />
                <StatusChip status="cancelled" />
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">
                  Interactive Star Rating
                </span>
                <Rating value={rating} onChange={setRating} showValue />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block">
                Skeleton Placeholders
              </span>
              <div className="flex items-center gap-3">
                <AvatarSkeleton size="md" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </section>

        {/* ─── 8. Modals & Slide-out Sheets ─── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
            <Sparkles className="h-6 w-6 text-accent" /> 8. Modals, Dialogs & Slide-out Sheets
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <Button variant="default" onClick={() => setDialogOpen(true)}>
              Open Animated Modal Dialog
            </Button>
            <Button variant="accent" onClick={() => setSheetOpen(true)}>
              Open Slide-out Drawer Sheet
            </Button>
          </div>

          {/* Dialog Modal Component */}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} size="md">
            <DialogHeader onClose={() => setDialogOpen(false)}>
              <DialogTitle>Confirm Service Booking</DialogTitle>
              <DialogDescription>
                Review technician dispatch details for your Split AC Jet Pump service.
              </DialogDescription>
            </DialogHeader>
            <DialogContent className="space-y-3">
              <div className="p-3.5 rounded-xl bg-muted/40 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-primary">
                  <span>Scheduled Arrival:</span>
                  <span>Today, 2:30 PM - 3:30 PM</span>
                </div>
                <div className="flex justify-between text-foreground-secondary">
                  <span>Estimated Labor:</span>
                  <span>₹899 (Cashless Post-service)</span>
                </div>
              </div>
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={() => setDialogOpen(false)}>
                Confirm & Dispatch Pro
              </Button>
            </DialogFooter>
          </Dialog>

          {/* Sheet Component */}
          <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} side="right">
            <SheetHeader onClose={() => setSheetOpen(false)}>
              <h3 className="font-bold text-lg text-primary">Service Options Drawer</h3>
            </SheetHeader>
            <SheetContent className="space-y-4">
              <p className="text-sm text-foreground-secondary">
                Slide-out sheet panel with responsive touch dismiss and smooth animation.
              </p>
              <div className="space-y-2">
                <Button variant="accent" className="w-full" onClick={() => setSheetOpen(false)}>
                  Apply Selection
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setSheetOpen(false)}>
                  Close
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </section>
      </div>
    </div>
  );
}
