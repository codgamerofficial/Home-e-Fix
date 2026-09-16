/**
 * HOME-E-FIX: SERVICE WORKFLOW STATE MACHINE ENGINE
 * Governs operational step transitions, tracking enablement,
 * and customer approval requirements for all 11 delivery types.
 */

import type {
  ServiceDeliveryType,
  DeliveryWorkflowDefinition,
  WorkflowStep,
} from "@/types/service-architecture.types";

export const DELIVERY_WORKFLOWS: Record<ServiceDeliveryType, DeliveryWorkflowDefinition> = {
  // 1. FIXED_PRICE
  FIXED_PRICE: {
    deliveryType: "FIXED_PRICE",
    name: "Fixed Price Direct Service",
    allowsTracking: true,
    requiresDiagnosisEstimate: false,
    steps: [
      { key: "BOOKING_CONFIRMED", label: "Booking Confirmed", description: "Your booking is locked and confirmed." },
      { key: "PROFESSIONAL_ASSIGNED", label: "Professional Assigned", description: "A certified technician has been assigned." },
      { key: "PROFESSIONAL_ACCEPTED", label: "Professional Accepted", description: "Technician confirmed appointment schedule." },
      { key: "ON_THE_WAY", label: "On The Way", description: "Technician is travelling to your location." },
      { key: "ARRIVED", label: "Arrived", description: "Technician has reached your doorstep." },
      { key: "SERVICE_STARTED", label: "Service Started", description: "Work is in progress." },
      { key: "SERVICE_COMPLETED", label: "Service Completed", description: "Work completed & tested." },
      { key: "INVOICE_GENERATED", label: "Invoice Ready", description: "Digital tax invoice issued with warranty." },
      { key: "COMPLETED", label: "Closed", description: "Booking fulfilled.", isTerminal: true },
    ],
  },

  // 2. DIAGNOSIS_FIRST
  DIAGNOSIS_FIRST: {
    deliveryType: "DIAGNOSIS_FIRST",
    name: "Diagnosis First with Repair Estimate",
    allowsTracking: true,
    requiresDiagnosisEstimate: true,
    steps: [
      { key: "BOOKING_CONFIRMED", label: "Inspection Booked", description: "Visit fee paid. Diagnostic slot confirmed." },
      { key: "PROFESSIONAL_ASSIGNED", label: "Diagnostician Assigned", description: "Appliance specialist allocated." },
      { key: "ON_THE_WAY", label: "On The Way", description: "Technician is en route with diagnostic equipment." },
      { key: "ARRIVED", label: "Arrived", description: "Technician reached customer premises." },
      { key: "DIAGNOSING", label: "Fault Diagnosis", description: "Comprehensive hardware & electrical testing." },
      { key: "QUOTE_SUBMITTED", label: "Estimate Submitted", description: "Technician submitted itemized parts & labour quote.", requiresCustomerAction: true },
      { key: "CUSTOMER_APPROVED", label: "Quote Approved", description: "Customer approved repair estimate." },
      { key: "REPAIR_STARTED", label: "Repair Underway", description: "Component replacement and repair in progress." },
      { key: "TESTING_PASSED", label: "Performance Tested", description: "Post-repair diagnostic checks passed." },
      { key: "PAYMENT_COMPLETED", label: "Balance Paid", description: "Repair charges settled online." },
      { key: "WARRANTY_ACTIVE", label: "Warranty Active", description: "30-day post-repair warranty activated.", isTerminal: true },
    ],
  },

  // 3. QUOTATION
  QUOTATION: {
    deliveryType: "QUOTATION",
    name: "Site Inspection & Formal Quotation",
    allowsTracking: false,
    requiresDiagnosisEstimate: true,
    steps: [
      { key: "REQUEST_RECEIVED", label: "Requirement Received", description: "Project specifications registered." },
      { key: "INSPECTION_SCHEDULED", label: "Site Inspection Set", description: "Project expert scheduled for laser measurement." },
      { key: "INSPECTION_COMPLETED", label: "Site Inspected", description: "Area measured, moisture/damp checked." },
      { key: "FORMAL_QUOTE_ISSUED", label: "Detailed Quote Issued", description: "Comprehensive material & labour quote generated.", requiresCustomerAction: true },
      { key: "QUOTE_APPROVED", label: "Quote Approved", description: "Advance deposit confirmed and work scheduled." },
      { key: "WORK_SCHEDULED", label: "Team Dispatched", description: "Dedicated painting/waterproofing team allocated." },
      { key: "WORK_STARTED", label: "Execution in Progress", description: "Wall preparation, priming and coating." },
      { key: "FINAL_INSPECTION", label: "Quality Audit", description: "Supervisor finish and gloss inspection." },
      { key: "COMPLETED", label: "Project Handed Over", description: "1-Year warranty certificate generated.", isTerminal: true },
    ],
  },

  // 4. PACKAGE
  PACKAGE: {
    deliveryType: "PACKAGE",
    name: "Standardized Package Service",
    allowsTracking: true,
    requiresDiagnosisEstimate: false,
    steps: [
      { key: "BOOKING_CONFIRMED", label: "Package Confirmed", description: "Full package scope locked." },
      { key: "TEAM_ASSIGNED", label: "Cleaning Crew Assigned", description: "Lead supervisor and crew allocated." },
      { key: "ON_THE_WAY", label: "Crew En Route", description: "Team travelling with industrial machines." },
      { key: "ARRIVED", label: "Crew Arrived", description: "Equipment setup and pre-cleaning walkthrough." },
      { key: "CLEANING_STARTED", label: "Deep Clean in Progress", description: "Mechanized floor scrubbing and chemical cleaning." },
      { key: "CUSTOMER_WALKTHROUGH", label: "Quality Walkthrough", description: "Customer inspects spotless outcome." },
      { key: "COMPLETED", label: "Service Certified", description: "Completed with 24-hour guarantee.", isTerminal: true },
    ],
  },

  // 5. QUANTITY_BASED
  QUANTITY_BASED: {
    deliveryType: "QUANTITY_BASED",
    name: "Quantity Scaled Service",
    allowsTracking: true,
    requiresDiagnosisEstimate: false,
    steps: [
      { key: "BOOKING_CONFIRMED", label: "Units Confirmed", description: "Per-seat / per-unit count locked." },
      { key: "PROFESSIONAL_ASSIGNED", label: "Specialist Assigned", description: "Upholstery technician assigned." },
      { key: "ON_THE_WAY", label: "On The Way", description: "Technician en route with injection extraction tools." },
      { key: "ARRIVED", label: "Arrived", description: "Technician at doorstep." },
      { key: "SERVICE_STARTED", label: "Shampooing Started", description: "Foam application and dirt extraction." },
      { key: "COMPLETED", label: "Finished & Dry Tested", description: "Upholstery sanitized.", isTerminal: true },
    ],
  },

  // 6. AREA_BASED
  AREA_BASED: {
    deliveryType: "AREA_BASED",
    name: "Area / Square Foot Model",
    allowsTracking: false,
    requiresDiagnosisEstimate: true,
    steps: [
      { key: "ESTIMATE_BOOKED", label: "Measurement Visit Booked", description: "Initial area estimate provided." },
      { key: "AREA_MEASURED", label: "Area Verified", description: "Technician verified exact square footage." },
      { key: "RATE_APPROVED", label: "Final Rate Approved", description: "Customer confirmed adjusted area price.", requiresCustomerAction: true },
      { key: "EXECUTION_STARTED", label: "Grouting / Tiling Started", description: "Surface prep and grouting application." },
      { key: "COMPLETED", label: "Completed & Cured", description: "Job finished with warranty.", isTerminal: true },
    ],
  },

  // 7. INSTALLATION
  INSTALLATION: {
    deliveryType: "INSTALLATION",
    name: "Appliance & Hardware Installation",
    allowsTracking: true,
    requiresDiagnosisEstimate: false,
    steps: [
      { key: "BOOKING_CONFIRMED", label: "Installation Booked", description: "Fixture & unit details recorded." },
      { key: "PROFESSIONAL_ASSIGNED", label: "Installer Assigned", description: "Certified installer with masonry drill kit." },
      { key: "ON_THE_WAY", label: "On The Way", description: "Technician en route." },
      { key: "ARRIVED", label: "Arrived", description: "Unboxing and mounting position consultation." },
      { key: "INSTALLATION_STARTED", label: "Installation Underway", description: "Bracket mounting, piping, and power test." },
      { key: "DEMO_COMPLETED", label: "Operational Demo", description: "Technician demonstrated functional checks." },
      { key: "COMPLETED", label: "Installation Certified", description: "Warranty registered.", isTerminal: true },
    ],
  },

  // 8. REPAIR
  REPAIR: {
    deliveryType: "REPAIR",
    name: "Appliance Hardware Repair",
    allowsTracking: true,
    requiresDiagnosisEstimate: true,
    steps: [
      { key: "BOOKING_CONFIRMED", label: "Repair Visit Confirmed", description: "Diagnostic visit registered." },
      { key: "PROFESSIONAL_ASSIGNED", label: "Technician Assigned", description: "Spare part diagnostic specialist allocated." },
      { key: "ON_THE_WAY", label: "On The Way", description: "Technician en route." },
      { key: "ARRIVED", label: "Arrived", description: "Fault isolation underway." },
      { key: "PART_ESTIMATE_SUBMITTED", label: "Spare Part Estimate", description: "Itemized quote for replacement components.", requiresCustomerAction: true },
      { key: "REPAIR_EXECUTED", label: "Part Replaced", description: "Original OEM spare installed." },
      { key: "COMPLETED", label: "Testing Complete", description: "30-Day spare warranty activated.", isTerminal: true },
    ],
  },

  // 9. APPOINTMENT
  APPOINTMENT: {
    deliveryType: "APPOINTMENT",
    name: "Dedicated Time Slot Appointment",
    allowsTracking: true,
    requiresDiagnosisEstimate: false,
    steps: [
      { key: "APPOINTMENT_CONFIRMED", label: "Appointment Confirmed", description: "Time slot & beautician reserved." },
      { key: "PROFESSIONAL_CONFIRMED", label: "Professional Allocated", description: "Specialist reviewed treatment preferences." },
      { key: "ON_THE_WAY", label: "Professional On The Way", description: "Beautician en route with sealed hygiene kits." },
      { key: "ARRIVED", label: "Arrived", description: "Pre-service consultation and sanitization." },
      { key: "SERVICE_IN_PROGRESS", label: "Session Underway", description: "Relaxing at-home treatment." },
      { key: "COMPLETED", label: "Session Completed", description: "Completed in private comfort.", isTerminal: true },
    ],
  },

  // 10. RAPID
  RAPID: {
    deliveryType: "RAPID",
    name: "Rapid On-Demand Dispatch (InstaHelp)",
    allowsTracking: true,
    requiresDiagnosisEstimate: false,
    steps: [
      { key: "REQUESTED", label: "Rapid Request Submitted", description: "Broadcasting to nearest available professionals." },
      { key: "PROFESSIONAL_MATCHED", label: "Professional Accepted", description: "Nearest verified technician locked." },
      { key: "ON_THE_WAY", label: "Live GPS Active", description: "Technician heading to your exact pin." },
      { key: "ARRIVED", label: "Arrived at Doorstep", description: "Technician is outside." },
      { key: "SERVICE_STARTED", label: "Fix Started", description: "Resolving household issue." },
      { key: "COMPLETED", label: "Rapid Fix Done", description: "Payment auto-reconciled.", isTerminal: true },
    ],
  },

  // 11. EMERGENCY
  EMERGENCY: {
    deliveryType: "EMERGENCY",
    name: "Critical Breakdown 24/7",
    allowsTracking: true,
    requiresDiagnosisEstimate: false,
    steps: [
      { key: "EMERGENCY_DISPATCHED", label: "Emergency Siren Broadcast", description: "Priority high-alert technician dispatch." },
      { key: "FIRST_RESPONDER_ACCEPTED", label: "First Responder Locked", description: "Emergency specialist moving toward location." },
      { key: "ON_THE_WAY", label: "Live Urgent En Route", description: "Live tracking with priority route calculation." },
      { key: "ARRIVED", label: "Arrived on Scene", description: "Immediate safety containment." },
      { key: "HAZARD_CONTAINED", label: "Hazard Secured", description: "Water/power main secured." },
      { key: "PERMANENT_FIX_DONE", label: "Restored to Normal", description: "Breakdown safely resolved.", isTerminal: true },
    ],
  },

  // 12. RECURRING
  RECURRING: {
    deliveryType: "RECURRING",
    name: "Recurring Maintenance Subscription",
    allowsTracking: true,
    requiresDiagnosisEstimate: false,
    steps: [
      { key: "CYCLE_SCHEDULED", label: "Cycle Scheduled", description: "Next scheduled maintenance date locked." },
      { key: "PROFESSIONAL_ASSIGNED", label: "Care Specialist Assigned", description: "Assigned for regular visit." },
      { key: "ON_THE_WAY", label: "On The Way", description: "En route for maintenance audit." },
      { key: "ARRIVED", label: "Arrived", description: "Checklist audit underway." },
      { key: "CYCLE_COMPLETED", label: "Cycle Done", description: "Maintenance log updated.", isTerminal: true },
    ],
  },
};

export const workflowEngine = {
  /**
   * Get workflow definition for a delivery type
   */
  getWorkflow(deliveryType: ServiceDeliveryType): DeliveryWorkflowDefinition {
    return DELIVERY_WORKFLOWS[deliveryType] || DELIVERY_WORKFLOWS.FIXED_PRICE;
  },

  /**
   * Determine whether tracking should be shown for a booking step
   */
  shouldShowLiveTracking(deliveryType: ServiceDeliveryType, currentStepKey: string): boolean {
    const workflow = this.getWorkflow(deliveryType);
    if (!workflow.allowsTracking) return false;

    // Only show live GPS while professional is actively on the way
    return currentStepKey === "ON_THE_WAY" || currentStepKey === "PROFESSIONAL_ON_THE_WAY";
  },

  /**
   * Check if a step requires customer approval
   */
  isCustomerApprovalRequired(deliveryType: ServiceDeliveryType, currentStepKey: string): boolean {
    const workflow = this.getWorkflow(deliveryType);
    const step = workflow.steps.find((s) => s.key === currentStepKey);
    return Boolean(step?.requiresCustomerAction);
  },
};
