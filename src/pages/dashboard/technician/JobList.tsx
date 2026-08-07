import { useState } from "react";
import {
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  XCircle,
  Phone,
  Camera,
  Play,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const MOCK_JOBS: any[] = [
  {
    id: "job-101",
    serviceName: "Split AC Foam Jet Wash",
    customerName: "Priya Sharma",
    phone: "+91 98765 43210",
    address: "Flat 402, Rainbow Vistas, Hitech City, Hyderabad",
    distance: "3.2 km",
    payout: 450,
    scheduledTime: "Today, 10:00 AM",
    status: "new_request",
    countdownSeconds: 45,
  },
  {
    id: "job-102",
    serviceName: "Bathroom Tap Leakage Repair",
    customerName: "Anand Verma",
    phone: "+91 98123 45678",
    address: "Plot 42, Jubilee Hills, Hyderabad",
    distance: "5.8 km",
    payout: 220,
    scheduledTime: "Today, 02:00 PM",
    status: "accepted",
  },
  {
    id: "job-103",
    serviceName: "Switchboard & MCB Repair",
    customerName: "Vikram Malhotra",
    phone: "+91 97111 22233",
    address: "Building 4, Gachibowli, Hyderabad",
    distance: "4.1 km",
    payout: 180,
    scheduledTime: "Yesterday, 04:00 PM",
    status: "completed",
  },
];

export default function JobList() {
  const [tab, setTab] = useState<"new" | "active" | "completed">("new");
  const [jobs, setJobs] = useState<any[]>(MOCK_JOBS);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [executionStep, setExecutionStep] = useState<"nav" | "arrived" | "in_progress" | "complete">("nav");
  const [photoUploaded, setPhotoUploaded] = useState(false);

  const handleAccept = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: "accepted" } : j))
    );
    const job = jobs.find((j) => j.id === jobId);
    if (job) setSelectedJob(job);
  };

  const handleDecline = (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const filteredJobs = jobs.filter((j) => {
    if (tab === "new") return j.status === "new_request";
    if (tab === "active") return j.status === "accepted" || j.status === "in_progress";
    if (tab === "completed") return j.status === "completed";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Job Dispatch Center</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Accept incoming service requests and update live job progress
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-surface border border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab("new")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === "new" ? "bg-primary text-white shadow-xs" : "text-foreground-secondary hover:text-primary"
            }`}
          >
            New Requests ({jobs.filter((j) => j.status === "new_request").length})
          </button>
          <button
            type="button"
            onClick={() => setTab("active")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === "active" ? "bg-primary text-white shadow-xs" : "text-foreground-secondary hover:text-primary"
            }`}
          >
            Active Jobs ({jobs.filter((j) => j.status === "accepted").length})
          </button>
          <button
            type="button"
            onClick={() => setTab("completed")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === "completed" ? "bg-primary text-white shadow-xs" : "text-foreground-secondary hover:text-primary"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* JOBS LIST GRID */}
      {filteredJobs.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border border-border">
          <Clock className="mx-auto h-10 w-10 text-foreground-muted" />
          <h3 className="font-heading text-base font-semibold text-primary">No jobs available</h3>
          <p className="text-xs text-foreground-secondary">No requests match this category right now.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-5 border border-border/80 space-y-4 shadow-sm hover:border-accent">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="accent" className="mb-1 text-[10px]">
                    Payout: {formatCurrency(job.payout)}
                  </Badge>
                  <h3 className="font-heading text-base font-bold text-primary">{job.serviceName}</h3>
                  <p className="text-xs text-foreground-secondary font-medium mt-0.5">{job.customerName}</p>
                </div>

                {job.status === "new_request" && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse block">
                      Expires in {job.countdownSeconds}s
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-foreground-secondary">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span className="line-clamp-1">{job.address} ({job.distance})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>{job.scheduledTime}</span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="pt-3 border-t border-border flex items-center gap-2">
                {job.status === "new_request" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecline(job.id)}
                      className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Decline
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => handleAccept(job.id)}
                      className="flex-1 font-bold text-xs shadow-glow"
                    >
                      Accept Job
                    </Button>
                  </>
                ) : job.status === "accepted" ? (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => setSelectedJob(job)}
                    className="w-full font-bold text-xs"
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Start Execution / Navigate
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-xs text-emerald-600 bg-emerald-50 w-full justify-center py-1">
                    ✓ Job Completed
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* JOB EXECUTION MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-6 border border-border shadow-2xl bg-background">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <Badge variant="accent" className="mb-1 text-[10px]">Active Execution</Badge>
                <h3 className="font-heading text-lg font-bold text-primary">{selectedJob.serviceName}</h3>
                <p className="text-xs text-foreground-secondary">Customer: {selectedJob.customerName}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="text-foreground-muted hover:text-primary cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Stepper Status */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground-secondary">Destination Address:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Navigation className="h-3.5 w-3.5 text-accent" />}
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(selectedJob.address)}`)}
                  >
                    Open Google Maps
                  </Button>
                </div>
                <p className="text-xs font-bold text-primary">{selectedJob.address}</p>
              </div>

              {/* Progress Stage Buttons */}
              <div className="space-y-2">
                {executionStep === "nav" && (
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full font-bold"
                    onClick={() => setExecutionStep("arrived")}
                  >
                    📍 Mark Arrived at Customer Doorstep
                  </Button>
                )}

                {executionStep === "arrived" && (
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full font-bold bg-amber-500 hover:bg-amber-400 text-white"
                    onClick={() => setExecutionStep("in_progress")}
                  >
                    ▶️ Start Work & Appliance Inspection
                  </Button>
                )}

                {executionStep === "in_progress" && (
                  <div className="space-y-3">
                    <input
                      id="tech-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={() => setPhotoUploaded(true)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Camera className="h-4 w-4" />}
                      onClick={() => document.getElementById("tech-photo-upload")?.click()}
                      className="w-full"
                    >
                      {photoUploaded ? "✓ Photo Uploaded Successfully" : "Upload Before / After Photos"}
                    </Button>
                    <Button
                      variant="accent"
                      size="lg"
                      className="w-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                      onClick={() => {
                        setExecutionStep("complete");
                        setJobs((prev) =>
                          prev.map((j) => (j.id === selectedJob.id ? { ...j, status: "completed" } : j))
                        );
                        setTimeout(() => setSelectedJob(null), 1500);
                      }}
                    >
                      ✓ Complete Job & Collect Payment ({formatCurrency(selectedJob.payout)})
                    </Button>
                  </div>
                )}

                {executionStep === "complete" && (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-center font-bold text-xs">
                    🎉 Job Successfully Completed! Payout added to your balance.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
