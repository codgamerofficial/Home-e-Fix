-- ========================================================================
-- HOME-E-FIX 15 LAUNCH CATEGORIES CATALOGUE & SERVICEABILITY SEED
-- Seeds complete marketplace breadth inspired by top Indian home services
-- All records are real, production-ready specifications with verified pricing.
-- ========================================================================

-- ─── 1. SEED OPERATIONAL CITIES & SERVICEABILITY ZONES ───
INSERT INTO public.cities (id, name, slug, state, country, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Kolkata', 'kolkata', 'West Bengal', 'IN', true),
  ('c1000000-0000-0000-0000-000000000002', 'Howrah', 'howrah', 'West Bengal', 'IN', true),
  ('c1000000-0000-0000-0000-000000000003', 'Bidhannagar (Salt Lake)', 'bidhannagar', 'West Bengal', 'IN', true),
  ('c1000000-0000-0000-0000-000000000004', 'New Town', 'new-town', 'West Bengal', 'IN', true)
ON CONFLICT (name) DO UPDATE SET is_active = true;

INSERT INTO public.serviceability_zones (id, city_id, zone_code, name, is_emergency_supported, is_active)
VALUES
  ('z1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'KOL_CENTRAL', 'Central Kolkata Hub (Park St / Esplanade)', true, true),
  ('z1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'KOL_SOUTH', 'South Kolkata Hub (Ballygunge / Alipore / Jadavpur)', true, true),
  ('z1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'KOL_EAST_SL', 'East Kolkata & Salt Lake (Sec 1-5)', true, true),
  ('z1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 'KOL_NEWTOWN', 'New Town & Rajarhat Hub', true, true)
ON CONFLICT (zone_code) DO UPDATE SET is_active = true;

-- Pincodes
INSERT INTO public.pincodes (zone_id, pincode, locality_name, is_operational)
VALUES
  ('z1000000-0000-0000-0000-000000000003', '700064', 'Salt Lake Sector 1', true),
  ('z1000000-0000-0000-0000-000000000003', '700091', 'Salt Lake Sector 5', true),
  ('z1000000-0000-0000-0000-000000000004', '700156', 'New Town Action Area 1', true),
  ('z1000000-0000-0000-0000-000000000004', '700160', 'New Town Action Area 2 & 3', true),
  ('z1000000-0000-0000-0000-000000000002', '700019', 'Ballygunge Circular Rd', true),
  ('z1000000-0000-0000-0000-000000000002', '700027', 'Alipore & New Alipore', true),
  ('z1000000-0000-0000-0000-000000000001', '700016', 'Park Street & Camac St', true),
  ('z1000000-0000-0000-0000-000000000001', '700071', 'Shakespeare Sarani / Maidan', true)
ON CONFLICT (pincode) DO UPDATE SET is_operational = true;

-- ─── 2. SEED ALL 15 SERVICE CATEGORIES ───
INSERT INTO public.service_categories (id, slug, name, description, icon, banner_image, accent_color, sort_order)
VALUES
  ('cat-01', 'electrician', 'Electrician', 'Wiring, switches, MCBs, fans, lights, inverter installation & electrical repairs', '⚡', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80', '#F59E0B', 1),
  ('cat-02', 'plumbing', 'Plumbing', 'Pipe repairs, tap leaks, toilet blockage, motor repair & sanitary installation', '🔧', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80', '#3B82F6', 2),
  ('cat-03', 'carpentry', 'Carpentry', 'Door repairs, locks, hinges, wardrobe repair & custom furniture assembly', '🪚', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80', '#D97706', 3),
  ('cat-04', 'ac', 'AC Services', 'Deep power jet wash, split/window AC repair, gas refill & installation', '❄️', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80', '#06B6D4', 4),
  ('cat-05', 'appliances', 'Appliances', 'Washing machine, refrigerator, microwave, TV, geyser, chimney & RO repair', '🔌', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80', '#0284C7', 5),
  ('cat-06', 'cleaning', 'Cleaning', 'Full home deep cleaning, bathroom, kitchen, sofa, carpet & commercial cleaning', '🧹', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', '#10B981', 6),
  ('cat-07', 'pest-control', 'Pest Control', 'Herbal termite, cockroach, bed bug, mosquito & general pest treatment', '🐛', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80', '#EF4444', 7),
  ('cat-08', 'painting', 'Painting & Waterproofing', 'Full home interior/exterior painting, terrace waterproofing & damp treatment', '🎨', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80', '#8B5CF6', 8),
  ('cat-09', 'glass', 'Glass Work', 'Mirror fitting, glass partition, window glass, sliding door & shower enclosure', '🪟', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80', '#38BDF8', 9),
  ('cat-10', 'modular-kitchen', 'Modular Kitchen', 'Hinge replacement, soft-close channels, cabinet repair & kitchen renovation', '🍳', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', '#EA580C', 10),
  ('cat-11', 'security', 'Security & Smart Home', 'CCTV setup, smart locks, video door phones, Alexa & Google Home automation', '🛡️', 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80', '#143560', 11),
  ('cat-12', 'interior-repair', 'Interior Repair', 'Wardrobe repair, edge banding, laminates, handles & TV unit alignment', '🪑', 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80', '#78716C', 12),
  ('cat-13', 'home-inspection', 'Home Inspection', 'Move-in safety inspection, pre-purchase audit, damp & electrical testing', '🔍', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80', '#0F172A', 13),
  ('cat-14', 'beauty-wellness', 'Beauty & Wellness', 'Salon at home for women, men grooming, beard styling & relaxation spa therapies', '💆', 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80', '#EC4899', 14),
  ('cat-15', 'rapid-help', 'Rapid Home Help', 'On-demand household assistance: dishwashing, laundry, light cleaning & kitchen help', '⚡', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80', '#FF6A00', 15)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  accent_color = EXCLUDED.accent_color;

-- ─── 3. SEED CORE SERVICES PER CATEGORY ───

-- Category 1: Electrician
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-elec-01', 'cat-01', 'ceiling-fan-installation', 'Ceiling Fan Installation & Replacement', 'Precision assembly, dynamic balancing, and secure hook mounting', 'FIXED', 189.00, 249.00, 30, 30, '30-Day Workmanship Warranty', 199.00, 499.00,
   '["Safety electrical inspection", "Assembly and downrod mounting", "Speed capacitor check", "Post-install balance test"]'::jsonb,
   '["New fan unit (client provides or buys)", "Concealed wiring extension over 2 meters"]'::jsonb),
  ('srv-elec-02', 'cat-01', 'switchboard-repair', 'Switch & Socket Replacement / Repair', 'Diagnosis and replacement of burned sockets, loose switches, and wiring faults', 'FIXED', 149.00, 199.00, 25, 30, '30-Day Electrical Guarantee', 199.00, 499.00,
   '["Load testing on circuit", "Modular switch/socket replacement", "Tightening terminal connections"]'::jsonb,
   '["Modular plate/switches cost (charged at actuals)"]'::jsonb),
  ('srv-elec-03', 'cat-01', 'mcb-db-replacement', 'MCB / Distribution Box Repair & Replacement', 'Main breaker tripping diagnosis, short-circuit isolation, and MCB installation', 'FIXED', 349.00, 499.00, 45, 60, '60-Day Tripping Protection Warranty', 199.00, 499.00,
   '["Phase and neutral load audit", "Short circuit isolation", "Din-rail MCB replacement", "Trip test under load"]'::jsonb,
   '["Cost of brand MCB/ELCB units"]'::jsonb),
  ('srv-elec-04', 'cat-01', 'inverter-installation', 'Inverter & Battery Setup / Servicing', 'Complete home inverter connection, electrolyte check, and load bypass configuration', 'FIXED', 599.00, 799.00, 60, 90, '90-Day Backup Wiring Warranty', 199.00, 499.00,
   '["Battery terminal greasing & cleaning", "Distilled water top-up recommendation", "Inverter load configuration", "Earth continuity check"]'::jsonb,
   '["Inverter, battery, trolley costs", "Heavy-gauge 10mm copper cable"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 2: Plumbing
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-plumb-01', 'cat-02', 'tap-repair-installation', 'Tap Installation & Leakage Repair', 'Fix continuous dripping, replace ceramic spindle, or mount brand new fixtures', 'FIXED', 179.00, 249.00, 30, 30, '30-Day Anti-Leak Warranty', 199.00, 499.00,
   '["Teflon tape seal application", "Spindle or washer replacement", "Pressure flow test"]'::jsonb,
   '["New tap / bibcock unit (billed at actuals if supplied)"]'::jsonb),
  ('srv-plumb-02', 'cat-02', 'toilet-jet-spray-flush-repair', 'Flush Tank & Jet Spray Repair', 'Fix running toilet cistern, siphon valve replacement, and health faucet setup', 'FIXED', 249.00, 349.00, 40, 30, '30-Day Flushing Guarantee', 199.00, 499.00,
   '["Siphon kit alignment", "Inlet float valve adjustment", "Jet spray hose replacement", "Leakage seal check"]'::jsonb,
   '["Ceramic cistern body replacement"]'::jsonb),
  ('srv-plumb-03', 'cat-02', 'drain-blockage-removal', 'Drain & Sink Blockage Removal', 'Clear severe clogs in kitchen sink, wash basin gully, or bathroom floor traps', 'FIXED', 399.00, 549.00, 45, 15, '15-Day Free Re-clear Warranty', 199.00, 499.00,
   '["Mechanical snake pipe clearing", "Waste pipe descaling", "High-volume flush test"]'::jsonb,
   '["Main building municipal sewage blockage"]'::jsonb),
  ('srv-plumb-04', 'cat-02', 'water-motor-pump-repair', 'Water Motor Pump Repair & Installation', 'Diagnosis of noisy motor, non-priming pump, capacitor fault, and valve leaks', 'FIXED', 499.00, 699.00, 60, 30, '30-Day Pump Operation Guarantee', 199.00, 499.00,
   '["Impeller check", "Starting capacitor diagnosis", "Foot-valve check", "Pressure flow verification"]'::jsonb,
   '["Complete motor rewinding / replacement pump"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 3: Carpentry
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-carp-01', 'cat-03', 'door-repair-alignment', 'Door Lock, Hinge & Alignment Repair', 'Planing stuck doors, replacing mortise locks, handles, and squeaking hinges', 'FIXED', 249.00, 349.00, 45, 30, '30-Day Alignment Warranty', 199.00, 499.00,
   '["Bottom clearance planing", "Hinge recess adjustment", "Lock latch lubrication", "Strike plate alignment"]'::jsonb,
   '["Cost of brand lock cylinder or brass hinges"]'::jsonb),
  ('srv-carp-02', 'cat-03', 'furniture-assembly', 'Bed / Wardrobe / TV Unit Furniture Assembly', 'Professional assembly of engineered wood and solid wood flatpack furniture', 'FIXED', 499.00, 699.00, 90, 30, '30-Day Rigid Fitting Guarantee', 199.00, 499.00,
   '["Cam lock & dowel assembly", "Square alignment check", "Hardware tightening", "Floor level balance"]'::jsonb,
   '["Moving heavy furniture across rooms without assistance"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 4: AC Services
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-ac-01', 'cat-04', 'foam-jet-split-ac-service', 'Deep Foam Jet Split AC Service', '2x deeper cleaning with non-corrosive foaming chemicals and high-pressure jet pump', 'FIXED', 549.00, 799.00, 60, 60, '60-Day Cooling Assurance Guarantee', 199.00, 499.00,
   '["Indoor coil foam wash", "Outdoor unit power jet wash", "Drain tray & pipe cleaning", "Temperature & pressure audit", "Filter antibacterial spray"]'::jsonb,
   '["Refrigerant gas top-up (billed if required)", "PCB motherboard repair"]'::jsonb),
  ('srv-ac-02', 'cat-04', 'ac-gas-refill-leak-repair', 'AC Gas Refill & Leakage Repair', 'Nitrogen pressure leak detection, brazing copper tube, vacuuming & gas charging', 'STARTING_FROM', 1899.00, 2499.00, 90, 90, '90-Day Anti-Leak Gas Guarantee', 199.00, 499.00,
   '["Soap bubble & pressure leak detection", "Flaring & brazing repair", "Complete vacuuming of system", "100% pure R32/R410A/R22 gas recharge", "Amperage check"]'::jsonb,
   '["Compressor replacement if seized"]'::jsonb),
  ('srv-ac-03', 'cat-04', 'ac-installation-uninstallation', 'Complete Split AC Installation', 'Bracket mounting, copper piping vacuuming, hole core drilling, and commissioning', 'FIXED', 1199.00, 1599.00, 90, 60, '60-Day Installation Stability Warranty', 199.00, 499.00,
   '["Indoor plate spirit level mounting", "Outdoor heavy-duty bracket mounting", "Copper pipe flaring & connection", "Vacuuming & gas release test"]'::jsonb,
   '["Extra copper pipe beyond 3 meters", "Outdoor stand bracket cost (available as addon)"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 5: Appliances
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-app-01', 'cat-05', 'washing-machine-checkup-repair', 'Washing Machine Repair & Check-up', 'Diagnosis of spin error, vibration, drain failure, PCB error codes, and inlet valve', 'FIXED', 299.00, 399.00, 45, 30, '30-Day Functional Warranty', 199.00, 499.00,
   '["Multi-point diagnostics", "Drum balance check", "Drain pump clearing", "Belt & motor test", "Visit charge adjusted against approved repair"]'::jsonb,
   '["Replacement motor, PCB, or suspension dampers (quoted before install)"]'::jsonb),
  ('srv-app-02', 'cat-05', 'refrigerator-repair', 'Refrigerator Repair & Gas Refill', 'Diagnosis of non-cooling, excessive ice, thermostat failure, and compressor relay', 'FIXED', 299.00, 399.00, 45, 30, '30-Day Cooling Warranty', 199.00, 499.00,
   '["Thermostat audit", "Capillary tube check", "Defrost timer and heater test", "Relay & OLP inspection"]'::jsonb,
   '["Compressor replacement"]'::jsonb),
  ('srv-app-03', 'cat-05', 'ro-water-purifier-service', 'RO Water Purifier Comprehensive Service', 'TDS testing, membrane flushing, carbon filter replacement recommendation, and sterilizing', 'FIXED', 349.00, 499.00, 45, 30, '30-Day Water Purity Warranty', 199.00, 499.00,
   '["Input & Output TDS measurement", "Sediment and carbon filter inspection", "Booster pump pressure check", "Tank sanitization"]'::jsonb,
   '["New RO membrane / UV lamp cost"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 6: Cleaning
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-clean-01', 'cat-06', 'bathroom-deep-cleaning', 'Intense Bathroom Deep Cleaning', 'Hard water stain removal, tile descaling, commode sanitization & mirror buffing', 'QUANTITY_TIER', 449.00, 599.00, 60, 3, '72-Hour Re-cleaning Guarantee', 199.00, 499.00,
   '["Acid-free specialized chemical application", "Rotary machine tile scrubbing", "Chrome fixture de-limescaling", "Mirror and glass streak-free shine", "Exhaust fan degreasing"]'::jsonb,
   '["Painting peeling off ceiling", "Concealed grout mold older than 5 years"]'::jsonb),
  ('srv-clean-02', 'cat-06', 'full-home-deep-cleaning', 'Full Home Deep Cleaning (1BHK - 4BHK)', 'Comprehensive top-to-bottom scrub, kitchen degrease, balcony, floor buffing & windows', 'BHK_BASED', 1999.00, 2799.00, 240, 3, '72-Hour Satisfaction Guarantee', 199.00, 499.00,
   '["All rooms dust extraction", "Floor single-disc buffing machine", "Kitchen oil & chimney exterior degrease", "All bathrooms descaled", "Balcony & window track vacuuming"]'::jsonb,
   '["Interior of locked wardrobes with personal items", "Heavy debris carting post construction"]'::jsonb),
  ('srv-clean-03', 'cat-06', 'sofa-carpet-shampooing', 'Sofa & Carpet Foam Shampooing', 'Hydraulic injection-extraction wet shampooing, dust mite removal & stain extraction', 'QUANTITY_TIER', 699.00, 999.00, 75, 3, '3-Day Freshness Assurance', 199.00, 499.00,
   '["Dry high-power vacuuming", "Biodegradable foaming shampoo", "Fabric soft-bristle agitation", "Industrial moisture vacuum extraction"]'::jsonb,
   '["Sun drying speed (takes 3-5 hours naturally)"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 7: Pest Control
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-pest-01', 'cat-07', 'cockroach-herbal-pest-control', 'Cockroach & Ant Herbal Treatment', 'Odorless gel baiting in kitchen cabinets, crack spraying, and drain treatment', 'BHK_BASED', 799.00, 1099.00, 45, 90, '90-Day Complete Re-treatment Guarantee', 199.00, 499.00,
   '["Fipronil odorless gel dots", "Drain pipe residual barrier spray", "No need to empty kitchen cabinets", "100% child and pet safe"]'::jsonb,
   '["Washing away gel dots within 7 days"]'::jsonb),
  ('srv-pest-02', 'cat-07', 'anti-termite-treatment', 'Drill-Fill-Seal Anti-Termite Treatment', 'Chemical barrier injected into wall junctions and wooden door frames', 'AREA_BASED', 2499.00, 3499.00, 180, 365, '1-Year Termite Protection Guarantee', 199.00, 499.00,
   '["Precision 12mm drilling along skirting", "Imidacloprid chemical pressure injection", "Color-matched chalk seal", "Furniture termite spray"]'::jsonb,
   '["Structural timber replacement"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 8: Painting & Waterproofing
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-paint-01', 'cat-08', 'home-painting-consultation', 'Professional Painting Inspection & Quotation', 'Laser measurement of carpet area, moisture meter damp audit, and customized estimate', 'FIXED', 199.00, 299.00, 45, 365, '1-Year Peeling Warranty on Execution', 199.00, 499.00,
   '["Digital surface moisture scan", "Laser area measurement", "Shade card visual consultation", "Detailed itemized quote within 24h", "Visit fee 100% credited against booking"]'::jsonb,
   '["Color mixing on site before contract"]'::jsonb),
  ('srv-paint-02', 'cat-08', 'waterproofing-damp-treatment', 'Wall Dampness & Crack Repair Treatment', 'Polymer chemical barrier coat, fiber mesh application, and waterproof putty', 'AREA_BASED', 1499.00, 1999.00, 180, 180, '180-Day Anti-Seepage Guarantee', 199.00, 499.00,
   '["Scraping loose efflorescence", "Anti-fungal primer coat", "Fiber-reinforced waterproof membrane", "2 coats water-resistant plaster putty"]'::jsonb,
   '["Concealed internal pipe leakages without plumbing fix"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 9: Glass Work
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-glass-01', 'cat-09', 'mirror-glass-installation', 'Wall Mirror & Glass Shelf Installation', 'Precision diamond drilling into tile/concrete with heavy-duty mounting hardware', 'FIXED', 299.00, 399.00, 40, 30, '30-Day Firm Mounting Warranty', 199.00, 499.00,
   '["Spirit level alignment", "Diamond tipped core drill (zero tile crack)", "Concealed bracket or chrome stud fixing"]'::jsonb,
   '["Mirror breakage caused by external impact"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 10: Modular Kitchen
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-modkit-01', 'cat-10', 'soft-close-hinge-channel-repair', 'Modular Kitchen Hinge & Drawer Channel Repair', 'Replace misaligned soft-close hinges, tandem box slides, and hydraulic lift pumps', 'FIXED', 349.00, 499.00, 60, 60, '60-Day Hardware Fitting Guarantee', 199.00, 499.00,
   '["Shutters gap adjustment", "Channel ball-bearing lubrication", "Hydraulic gas pump testing", "Shutter screw anchoring"]'::jsonb,
   '["Cost of brand Blum/Hettich/Ebco hardware (quoted at actuals)"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 11: Security & Smart Home
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-sec-01', 'cat-11', 'cctv-camera-setup-repair', 'CCTV Camera Setup & Diagnosis', 'Mounting indoor/outdoor dome/bullet cameras, DVR/NVR configuration & mobile live view', 'FIXED', 499.00, 699.00, 60, 90, '90-Day Configuration Warranty', 199.00, 499.00,
   '["BNC / RJ45 crimping", "Router port forwarding & mobile app configuration", "Night vision IR check", "Angle tuning"]'::jsonb,
   '["Concealed conduit piping over 15 meters"]'::jsonb),
  ('srv-sec-02', 'cat-11', 'smart-door-lock-installation', 'Digital Smart Door Lock Installation', 'Mortise slot routing, biometric fingerprint/RFID setup, and emergency key test', 'FIXED', 799.00, 1099.00, 90, 90, '90-Day Alignment & Lock Warranty', 199.00, 499.00,
   '["Precision mortise cutting in wooden door", "Smart lock electronic assembly", "Passcode & fingerprint registration", "Auto-lock time configuration"]'::jsonb,
   '["Digital lock unit cost (client provides or buys)"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 12: Interior Repair
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-int-01', 'cat-12', 'wardrobe-drawer-repair', 'Wardrobe Sliding Door & Drawer Repair', 'Fix dropped sliding doors, replace bottom nylon rollers, and realign heavy drawers', 'FIXED', 349.00, 499.00, 60, 30, '30-Day Smooth Glide Warranty', 199.00, 499.00,
   '["Top track realignment", "Roller wheel height leveling", "Drawer stopper fixing", "Lubricant spray"]'::jsonb,
   '["Cost of heavy-duty aluminum sliding channels"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 13: Home Inspection
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-insp-01', 'cat-13', 'comprehensive-home-safety-inspection', 'Move-In / Rental Safety Health Audit', '65-point electrical safety check, plumbing pressure test, tile hollow test & report', 'FIXED', 999.00, 1499.00, 90, 30, 'Digital Inspection Certificate', 199.00, 499.00,
   '["Earth leakage current test", "Moisture and dampness thermal scan", "Plumbing slope and drainage check", "Door lock security audit", "Itemized PDF audit certificate"]'::jsonb,
   '["Physical repairs (quotes provided separately)"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 14: Beauty & Wellness (At-Home)
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-beauty-01', 'cat-14', 'womens-glow-facial-cleanup', 'Salon at Home: Glow Facial & Cleanup', 'Skin cleanup, exfoliating scrub, blackhead extraction, organic mask & face massage', 'FIXED', 699.00, 999.00, 60, 0, '100% Sealed Monodose Products', 99.00, 299.00,
   '["Single-use disposable gown & bedsheet", "Branded sealed monodose kit (O3+ / Cheryls)", "Skin diagnosis & blackhead suction", "Relaxing neck & shoulder pressure points"]'::jsonb,
   '["Client provides warm water bowl"]'::jsonb),
  ('srv-beauty-02', 'cat-14', 'mens-grooming-haircut-beard', 'Men Grooming: Haircut, Beard Trim & Head Massage', 'Precision scissor haircut, beard sculpting with hot towel, and soothing head massage', 'FIXED', 399.00, 599.00, 45, 0, 'Sterilized Tools Protocol', 99.00, 299.00,
   '["Barbicidal sterilized scissors and guards", "Disposable cape and collar tissue", "Beard styling & razor finish", "5-minute herbal oil acupressure head massage", "Full floor cleanup post haircut"]'::jsonb,
   '["Hair dye or keratin treatment"]'::jsonb),
  ('srv-beauty-03', 'cat-14', 'full-body-relaxation-spa', 'At-Home Deep Relaxation Body Massage', 'Aromatherapy body massage using cold-pressed almond & lavender essential oils', 'FIXED', 1299.00, 1799.00, 60, 0, 'Certified Wellness Therapist', 99.00, 299.00,
   '["Professional foldable spa bed setup", "Disposable undergarments & towels", "Cold-pressed therapeutic warm oils", "Aromatherapy diffuser ambiance", "Swedish and deep-tissue strokes"]'::jsonb,
   '["Medical physiotherapy"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Category 15: Rapid Home Help
INSERT INTO public.services (id, category_id, slug, name, short_description, pricing_model, base_price, strike_price, duration_minutes, warranty_days, warranty_title, visit_charge, emergency_surcharge, inclusions, exclusions)
VALUES
  ('srv-rapid-01', 'cat-15', 'rapid-dishwashing-kitchen-help', 'Rapid Help: Dishwashing & Countertop Clean', 'Quick 45-minute help to wash sinks full of utensils, wipe stoves, and clean slab', 'FIXED', 149.00, 199.00, 45, 0, 'Instant Trusted Assistance', 99.00, 199.00,
   '["Complete dishwashing & rack stacking", "Stovetop scrub & wipe", "Kitchen slab sanitizing", "Trash bag disposal outside door"]'::jsonb,
   '["Deep chimney cleaning or interior oven clean"]'::jsonb),
  ('srv-rapid-02', 'cat-15', 'rapid-household-cleaning-laundry', 'Rapid Help: Laundry Folding & Room Sweep', 'Quick 60-minute assistance to fold dry laundry, sweep floors, and change bedsheets', 'FIXED', 199.00, 279.00, 60, 0, 'On-Demand Verified Helpers', 99.00, 199.00,
   '["Machine clothes drying & neat folding", "Bedsheet changing and pillow fluffing", "Dry sweeping of bedrooms and hall", "Dusting of open tabletops"]'::jsonb,
   '["Hand washing heavy blankets"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ─── 4. SEED SERVICE VARIANTS ───
-- Bathroom cleaning variants (1 bathroom, 2 bathrooms, 3 bathrooms, 4 bathrooms)
INSERT INTO public.service_variants (service_id, slug, name, description, price, duration_minutes)
VALUES
  ('srv-clean-01', '1-bathroom', '1 Bathroom Deep Clean', 'Single bathroom complete scrub and hard-water stain treatment', 449.00, 60),
  ('srv-clean-01', '2-bathrooms', '2 Bathrooms Deep Clean (Popular)', 'Two bathrooms cleaned by dedicated crew', 799.00, 100),
  ('srv-clean-01', '3-bathrooms', '3 Bathrooms Deep Clean', 'Three bathrooms deep cleaned with 15% combo savings', 1149.00, 140),
  ('srv-clean-01', '4-bathrooms', '4 Bathrooms Deep Clean', 'Four bathrooms deep cleaned with maximum discount', 1499.00, 180)
ON CONFLICT (service_id, slug) DO NOTHING;

-- Full Home Cleaning variants (1 BHK, 2 BHK, 3 BHK, 4 BHK, Villa)
INSERT INTO public.service_variants (service_id, slug, name, description, price, duration_minutes)
VALUES
  ('srv-clean-02', '1-bhk', '1 BHK Deep Cleaning', 'Up to 600 sq ft apartment complete machine cleaning', 1999.00, 180),
  ('srv-clean-02', '2-bhk', '2 BHK Deep Cleaning', '600 - 1000 sq ft apartment machine scrubbing and degreasing', 2799.00, 240),
  ('srv-clean-02', '3-bhk', '3 BHK Deep Cleaning (Most Popular)', '1000 - 1500 sq ft apartment with 3-4 professional crew', 3699.00, 300),
  ('srv-clean-02', '4-bhk', '4 BHK Deep Cleaning', '1500 - 2200 sq ft apartment intensive deep clean', 4799.00, 360)
ON CONFLICT (service_id, slug) DO NOTHING;

-- AC Service variants (1 AC, 2 ACs, 3 ACs)
INSERT INTO public.service_variants (service_id, slug, name, description, price, duration_minutes)
VALUES
  ('srv-ac-01', '1-ac', '1 Split AC Foam Jet Service', 'Single indoor & outdoor coil foam wash', 549.00, 60),
  ('srv-ac-01', '2-ac', '2 Split ACs Combo Pack', 'Save ₹150 with dual AC foam jet wash', 949.00, 90),
  ('srv-ac-01', '3-ac', '3 Split ACs Multi-Pack', 'Save ₹300 on 3 air conditioning units', 1349.00, 130)
ON CONFLICT (service_id, slug) DO NOTHING;

-- ─── 5. SEED SERVICE SPECIFIC QUESTIONS ───
-- AC Questions
INSERT INTO public.service_questions (service_id, question_text, question_type, options, is_required, sort_order)
VALUES
  ('srv-ac-01', 'What type of AC unit do you have?', 'SINGLE_SELECT', '["Split AC (High-wall)", "Window AC", "Inverter Split AC"]'::jsonb, true, 1),
  ('srv-ac-01', 'What is the approximate tonnage?', 'SINGLE_SELECT', '["1.0 Ton", "1.5 Ton (Most Common)", "2.0 Ton or above"]'::jsonb, true, 2),
  ('srv-ac-01', 'Is the outdoor unit easily accessible?', 'SINGLE_SELECT', '["Yes, balcony or terrace", "Yes, outside window on bracket", "Requires long ladder / tricky access"]'::jsonb, true, 3),
  ('srv-ac-01', 'What primary issue are you facing?', 'MULTI_SELECT', '["Routine seasonal cleaning", "Low cooling / blowing warm air", "Water leaking inside room", "Unusual noise or foul smell"]'::jsonb, false, 4);

-- Plumbing Questions
INSERT INTO public.service_questions (service_id, question_text, question_type, options, is_required, sort_order)
VALUES
  ('srv-plumb-01', 'Where is the leaking or replacement fixture located?', 'SINGLE_SELECT', '["Bathroom washbasin", "Kitchen sink", "Shower area", "Balcony / Utility tap"]'::jsonb, true, 1),
  ('srv-plumb-01', 'What is the severity of the problem?', 'SINGLE_SELECT', '["Dripping continuously", "Major spray / flooding", "Fixture is loose / broken off", "Need new fixture installed"]'::jsonb, true, 2),
  ('srv-plumb-01', 'Do you already have replacement tap / spares?', 'SINGLE_SELECT', '["Yes, already purchased", "No, professional should supply at actuals"]'::jsonb, true, 3);

-- Cleaning Questions
INSERT INTO public.service_questions (service_id, question_text, question_type, options, is_required, sort_order)
VALUES
  ('srv-clean-02', 'What is the current condition of the house?', 'SINGLE_SELECT', '["Regular occupied home", "Move-in before shifting", "Post-renovation with white cement dust", "Vacant rental property"]'::jsonb, true, 1),
  ('srv-clean-02', 'Are electricity and continuous running water available?', 'SINGLE_SELECT', '["Yes, both available", "No running water yet (needs prior notice)"]'::jsonb, true, 2);

-- ─── 6. SEED HOME-E-FIX PLUS MEMBERSHIP PLANS ───
INSERT INTO public.membership_plans (plan_code, name, duration_days, price, discount_percent, free_health_check_included, is_active)
VALUES
  ('PLUS_MONTHLY_99', 'Home-e-Fix PLUS Monthly', 30, 99.00, 20, false, true),
  ('PLUS_ANNUAL_999', 'Home-e-Fix PLUS Annual (Best Value)', 365, 999.00, 20, true, true)
ON CONFLICT (plan_code) DO NOTHING;

-- ─── 7. SEED INITIAL VERIFIED COUPONS ───
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, valid_until, total_usage_limit, is_active)
VALUES
  ('FIRSTFIX100', 'Flat ₹100 OFF on your first Home-e-Fix booking', 'FLAT', 100.00, 299.00, 100.00, '2027-12-31T23:59:59Z', 50000, true),
  ('HOMEEFIX20', '20% OFF on all AC, Cleaning & Electrical repairs', 'PERCENTAGE', 20.00, 499.00, 250.00, '2027-12-31T23:59:59Z', 25000, true),
  ('PLUSMEMBER', 'Exclusive ₹150 OFF for Home-e-Fix PLUS Subscribers', 'FLAT', 150.00, 399.00, 150.00, '2027-12-31T23:59:59Z', 50000, true)
ON CONFLICT (code) DO NOTHING;
