import React from "react";

export type CharacterState = "hero" | "relaxing" | "searching" | "celebrating" | "fixing";

interface HomeEFixCharacterProps {
  state?: CharacterState;
  className?: string;
  size?: number | string;
  title?: string;
}

/**
 * Home-e-Fix Brand Mascot: "Fixu" / The Home-e-Fix Guy
 * A friendly, relatable 22-25 year old Indian young man in a cool branded graphic tee,
 * blue shorts, and sneakers. High-fidelity vector illustration designed for Kolkata homeowners.
 */
export const HomeEFixCharacter: React.FC<HomeEFixCharacterProps> = ({
  state = "hero",
  className = "",
  size = 280,
  title = "Home-e-Fix Assistant",
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={title}
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0A97E" />
            <stop offset="100%" stopColor="#C98B5F" />
          </linearGradient>
          <linearGradient id="teeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="shortsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
          <linearGradient id="sneakerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A1B16" />
            <stop offset="100%" stopColor="#18110E" />
          </linearGradient>
          <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFEDD5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFEDD5" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Warm Aura */}
        <circle cx="200" cy="210" r="160" fill="url(#auraGlow)" />

        {/* ============================================================== */}
        {/* STATE: RELAXING (Lounge chair, chai kulhad, smartphone, AC breeze) */}
        {/* ============================================================== */}
        {state === "relaxing" && (
          <g id="state-relaxing">
            {/* Beanbag / Lounge Couch */}
            <path
              d="M100 280 C100 230, 160 210, 200 210 C240 210, 300 230, 300 280 C300 320, 260 340, 200 340 C140 340, 100 320, 100 280 Z"
              fill="#0F172A"
              opacity="0.9"
            />
            <path
              d="M110 280 C110 240, 160 225, 200 225 C240 225, 290 240, 290 280 C290 315, 250 330, 200 330 C150 330, 110 315, 110 280 Z"
              fill="#1E293B"
            />

            {/* Cool AC Breeze waves */}
            <path d="M280 110 Q310 100, 340 115" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
            <path d="M290 125 Q325 118, 355 130" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />

            {/* Legs kicked forward in comfy shorts */}
            <path d="M165 260 L140 310 L115 312" stroke="url(#skinGrad)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M235 260 L260 310 L285 312" stroke="url(#skinGrad)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
            {/* Shorts */}
            <path d="M160 240 L150 285 L180 285 L185 245 Z" fill="url(#shortsGrad)" />
            <path d="M240 240 L250 285 L220 285 L215 245 Z" fill="url(#shortsGrad)" />

            {/* Sneaker Feet */}
            <path d="M100 315 L125 315 L130 305 L110 305 Z" fill="url(#sneakerGrad)" />
            <circle cx="105" cy="315" r="4" fill="#EA580C" />
            <path d="M275 315 L300 315 L295 305 L275 305 Z" fill="url(#sneakerGrad)" />
            <circle cx="295" cy="315" r="4" fill="#EA580C" />

            {/* Torso & Tee leaning back */}
            <path d="M170 170 C165 210, 168 250, 200 250 C232 250, 235 210, 230 170 Z" fill="url(#teeGrad)" />
            {/* Graphic Icon on Shirt: Home wrench logo */}
            <circle cx="200" cy="205" r="14" fill="#FFFFFF" opacity="0.9" />
            <path d="M195 200 L205 210 M205 200 L195 210" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />

            {/* Arm 1: Holding earthen chai kulhad */}
            <path d="M170 185 Q135 195, 145 225" stroke="url(#skinGrad)" strokeWidth="14" strokeLinecap="round" />
            <path d="M140 220 L152 220 L150 234 L142 234 Z" fill="#B45309" />
            {/* Steam from chai */}
            <path d="M144 214 Q146 208, 144 204" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M148 214 Q150 208, 148 204" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />

            {/* Arm 2: Holding phone with green checkmark */}
            <path d="M230 185 Q260 200, 245 225" stroke="url(#skinGrad)" strokeWidth="14" strokeLinecap="round" />
            <rect x="238" y="215" width="16" height="26" rx="3" fill="#0F172A" />
            <rect x="240" y="218" width="12" height="20" rx="1.5" fill="#22C55E" />
            <path d="M243 228 L245 231 L250 225" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Neck & Head leaning back relaxed */}
            <rect x="193" y="145" width="14" height="25" fill="url(#skinGrad)" rx="4" />
            <ellipse cx="200" cy="130" rx="26" ry="28" fill="url(#skinGrad)" />

            {/* Friendly Smile & Calm Eyes */}
            <path d="M190 128 Q194 125, 198 128" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
            <path d="M204 128 Q208 125, 212 128" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
            <path d="M194 140 Q200 148, 208 140" stroke="#7C2D12" strokeWidth="2.5" fill="#FFFFFF" strokeLinecap="round" />

            {/* Hair: Modern quiff styled haircut */}
            <path
              d="M174 125 C172 100, 185 88, 205 88 C222 88, 230 100, 226 122 C222 110, 215 106, 200 106 C186 106, 178 114, 174 125 Z"
              fill="url(#hairGrad)"
            />
          </g>
        )}

        {/* ============================================================== */}
        {/* STATE: HERO (Standing confident, energetic thumbs up, Kolkata boy) */}
        {/* ============================================================== */}
        {state === "hero" && (
          <g id="state-hero">
            {/* Sneaker Footwear */}
            {/* Left Foot */}
            <path d="M152 355 L180 355 C185 355, 188 350, 184 345 L175 330 L155 330 Z" fill="url(#sneakerGrad)" />
            <path d="M150 355 L182 355" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" />
            {/* Right Foot */}
            <path d="M220 355 L248 355 C253 355, 256 350, 252 345 L243 330 L223 330 Z" fill="url(#sneakerGrad)" />
            <path d="M218 355 L250 355" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" />

            {/* Athletic Legs */}
            <path d="M168 260 L168 335" stroke="url(#skinGrad)" strokeWidth="20" strokeLinecap="round" />
            <path d="M232 260 L232 335" stroke="url(#skinGrad)" strokeWidth="20" strokeLinecap="round" />

            {/* Cool Blue Shorts */}
            <path d="M152 210 L150 265 L182 265 L195 220 L205 220 L218 265 L250 265 L248 210 Z" fill="url(#shortsGrad)" />
            {/* White Drawstring */}
            <path d="M198 213 L196 225 M202 213 L204 225" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

            {/* Vibrant Orange Graphic T-Shirt */}
            <path
              d="M156 135 L130 170 L152 182 L160 160 L160 215 C160 220, 240 220, 240 215 L240 160 L248 182 L270 170 L244 135 Z"
              fill="url(#teeGrad)"
            />
            {/* Graphic Badge: "HOME-E-FIX" Brand Emblem */}
            <rect x="185" y="160" width="30" height="30" rx="8" fill="#FFFFFF" />
            <path d="M192 175 L200 168 L208 175 V184 H192 Z" fill="#0F172A" />
            <circle cx="200" cy="178" r="3" fill="#FF6B35" />

            {/* Left Arm: Thumbs up gesture */}
            <path d="M140 165 L110 185 L108 170" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            {/* Thumbs up hand */}
            <circle cx="106" cy="165" r="10" fill="url(#skinGrad)" />
            <path d="M106 165 L106 150" stroke="url(#skinGrad)" strokeWidth="8" strokeLinecap="round" />

            {/* Right Arm: Casually in pocket or holding smart toolkit */}
            <path d="M260 165 L280 205 L265 220" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="272" y="195" width="22" height="26" rx="4" fill="#0F172A" />
            <rect x="277" y="190" width="12" height="6" rx="2" stroke="#FF6B35" strokeWidth="2" fill="none" />

            {/* Neck & Head */}
            <rect x="192" y="115" width="16" height="25" fill="url(#skinGrad)" rx="4" />
            <ellipse cx="200" cy="100" rx="26" ry="28" fill="url(#skinGrad)" />

            {/* Warm, Trustworthy Eyes & Cheerful Smile */}
            <ellipse cx="190" cy="98" rx="3" ry="4" fill="#0F172A" />
            <ellipse cx="210" cy="98" rx="3" ry="4" fill="#0F172A" />
            <circle cx="191" cy="96" r="1.2" fill="#FFFFFF" />
            <circle cx="211" cy="96" r="1.2" fill="#FFFFFF" />
            {/* Eyebrows */}
            <path d="M185 91 Q190 88, 195 90" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M205 90 Q210 88, 215 91" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            {/* Confident, friendly wide smile */}
            <path d="M192 110 Q200 120, 208 110" stroke="#7C2D12" strokeWidth="2.5" fill="#FFFFFF" strokeLinecap="round" />

            {/* Modern Hair: Stylish pompadour/fade cut */}
            <path
              d="M172 95 C170 65, 185 55, 206 55 C226 55, 232 68, 228 92 C222 78, 214 74, 200 74 C185 74, 178 82, 172 95 Z"
              fill="url(#hairGrad)"
            />
            {/* Sparkle Star Badge near head */}
            <path d="M250 80 L253 87 L260 90 L253 93 L250 100 L247 93 L240 90 L247 87 Z" fill="#F59E0B" />
          </g>
        )}

        {/* ============================================================== */}
        {/* STATE: CELEBRATING (Arms raised, jumping with joy, confetti!)   */}
        {/* ============================================================== */}
        {state === "celebrating" && (
          <g id="state-celebrating">
            {/* Confetti burst */}
            <circle cx="110" cy="90" r="4" fill="#3B82F6" />
            <circle cx="290" cy="80" r="4.5" fill="#EF4444" />
            <circle cx="140" cy="50" r="3.5" fill="#10B981" />
            <circle cx="260" cy="45" r="4" fill="#F59E0B" />
            <rect x="95" y="120" width="8" height="4" rx="1" fill="#EC4899" transform="rotate(25 95 120)" />
            <rect x="295" y="130" width="8" height="4" rx="1" fill="#8B5CF6" transform="rotate(-35 295 130)" />

            {/* Shoes in jumping pose */}
            <path d="M145 345 L175 348 C180 348, 182 342, 178 338 L168 320 L148 320 Z" fill="url(#sneakerGrad)" />
            <path d="M225 345 L255 348 C260 348, 262 342, 258 338 L248 320 L228 320 Z" fill="url(#sneakerGrad)" />

            {/* Legs bent slightly in energetic jump */}
            <path d="M165 240 L160 325" stroke="url(#skinGrad)" strokeWidth="18" strokeLinecap="round" />
            <path d="M235 240 L240 325" stroke="url(#skinGrad)" strokeWidth="18" strokeLinecap="round" />

            {/* Shorts */}
            <path d="M150 195 L145 245 L180 245 L195 205 L205 205 L220 245 L255 245 L250 195 Z" fill="url(#shortsGrad)" />

            {/* Tee Shirt */}
            <path d="M160 120 L160 200 C160 205, 240 205, 240 200 L240 120 Z" fill="url(#teeGrad)" />
            <circle cx="200" cy="155" r="12" fill="#FFFFFF" />
            <path d="M196 155 L199 158 L205 152" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Both Arms raised in victory */}
            <path d="M160 130 L115 80 L100 85" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="95" cy="85" r="9" fill="url(#skinGrad)" />
            <path d="M240 130 L285 80 L300 85" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="305" cy="85" r="9" fill="url(#skinGrad)" />

            {/* Head looking up happily */}
            <rect x="193" y="100" width="14" height="25" fill="url(#skinGrad)" rx="3" />
            <ellipse cx="200" cy="88" rx="26" ry="28" fill="url(#skinGrad)" />
            <path d="M190 85 Q194 82, 198 85" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
            <path d="M202 85 Q206 82, 210 85" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
            {/* Open overjoyed mouth */}
            <path d="M193 96 Q200 110, 207 96 Z" fill="#7C2D12" stroke="#7C2D12" strokeWidth="2" strokeLinejoin="round" />
            <path d="M196 97 Q200 102, 204 97" fill="#FFFFFF" />

            {/* Hair */}
            <path
              d="M172 82 C170 55, 185 45, 206 45 C226 45, 232 58, 228 80 C222 68, 214 64, 200 64 C185 64, 178 72, 172 82 Z"
              fill="url(#hairGrad)"
            />
          </g>
        )}

        {/* ============================================================== */}
        {/* STATE: SEARCHING (Holding magnifying glass, curious, attentive) */}
        {/* ============================================================== */}
        {state === "searching" && (
          <g id="state-searching">
            {/* Feet */}
            <path d="M152 355 L180 355 C185 355, 188 350, 184 345 L175 330 L155 330 Z" fill="url(#sneakerGrad)" />
            <path d="M220 355 L248 355 C253 355, 256 350, 252 345 L243 330 L223 330 Z" fill="url(#sneakerGrad)" />

            {/* Legs */}
            <path d="M168 250 L168 335" stroke="url(#skinGrad)" strokeWidth="18" strokeLinecap="round" />
            <path d="M232 250 L232 335" stroke="url(#skinGrad)" strokeWidth="18" strokeLinecap="round" />

            {/* Shorts */}
            <path d="M152 205 L150 255 L182 255 L195 215 L205 215 L218 255 L250 255 L248 205 Z" fill="url(#shortsGrad)" />

            {/* Tee */}
            <path d="M156 130 L160 210 C160 215, 240 215, 240 210 L244 130 Z" fill="url(#teeGrad)" />
            <circle cx="200" cy="165" r="12" fill="#FFFFFF" opacity="0.9" />
            <path d="M195 160 L205 170 M205 160 L195 170" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />

            {/* Arm 1: Holding Large Magnifying Glass */}
            <path d="M160 145 L125 155 L120 180" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" />
            {/* Magnifying Glass Lens */}
            <circle cx="115" cy="195" r="28" stroke="#1E293B" strokeWidth="6" fill="#E0F2FE" fillOpacity="0.7" />
            <path d="M135 215 L155 235" stroke="#78350F" strokeWidth="8" strokeLinecap="round" />
            {/* Lens Glare */}
            <path d="M102 185 Q115 175, 128 185" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

            {/* Arm 2: Hand on hip */}
            <path d="M240 145 L268 175 L248 205" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />

            {/* Head slightly tilted in inquiry */}
            <rect x="193" y="110" width="14" height="25" fill="url(#skinGrad)" rx="3" />
            <ellipse cx="202" cy="95" rx="26" ry="28" fill="url(#skinGrad)" />

            {/* Curious Eyes */}
            <ellipse cx="193" cy="94" rx="4" ry="5" fill="#0F172A" />
            <ellipse cx="211" cy="94" rx="4" ry="5" fill="#0F172A" />
            <circle cx="195" cy="92" r="1.5" fill="#FFFFFF" />
            <circle cx="213" cy="92" r="1.5" fill="#FFFFFF" />
            {/* Inquisitive Eyebrows */}
            <path d="M188 85 Q193 83, 198 87" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M206 87 Q212 83, 217 84" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            {/* Small thoughtful smile */}
            <path d="M198 108 Q204 112, 210 106" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />

            {/* Hair */}
            <path
              d="M174 90 C172 62, 187 52, 208 52 C228 52, 234 65, 230 87 C224 75, 216 71, 202 71 C187 71, 180 79, 174 90 Z"
              fill="url(#hairGrad)"
            />
          </g>
        )}

        {/* ============================================================== */}
        {/* STATE: FIXING (Holding spanner tool & digital diagnostic pad)   */}
        {/* ============================================================== */}
        {state === "fixing" && (
          <g id="state-fixing">
            {/* Footwear */}
            <path d="M152 355 L180 355 C185 355, 188 350, 184 345 L175 330 L155 330 Z" fill="url(#sneakerGrad)" />
            <path d="M220 355 L248 355 C253 355, 256 350, 252 345 L243 330 L223 330 Z" fill="url(#sneakerGrad)" />

            {/* Legs */}
            <path d="M168 250 L168 335" stroke="url(#skinGrad)" strokeWidth="18" strokeLinecap="round" />
            <path d="M232 250 L232 335" stroke="url(#skinGrad)" strokeWidth="18" strokeLinecap="round" />

            {/* Shorts with tool loop */}
            <path d="M152 205 L150 255 L182 255 L195 215 L205 215 L218 255 L250 255 L248 205 Z" fill="url(#shortsGrad)" />

            {/* Tee */}
            <path d="M156 130 L160 210 C160 215, 240 215, 240 210 L244 130 Z" fill="url(#teeGrad)" />

            {/* Arm 1: Holding shiny chrome spanner/wrench */}
            <path d="M155 145 L120 170 L110 150" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
            {/* Spanner Vector */}
            <g transform="translate(95, 125) rotate(-30)">
              <rect x="15" y="5" width="30" height="7" rx="2" fill="#94A3B8" />
              <circle cx="15" cy="8.5" r="9" fill="#94A3B8" />
              <rect x="8" y="6" width="9" height="5" fill="#FFFFFF" />
              <circle cx="45" cy="8.5" r="8" fill="#94A3B8" />
            </g>

            {/* Arm 2: Holding digital job card / diagnostic tablet */}
            <path d="M245 145 L275 180 L260 205" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="250" y="195" width="28" height="38" rx="4" fill="#0F172A" />
            <rect x="254" y="200" width="20" height="28" rx="2" fill="#38BDF8" />
            <path d="M257 206 H271 M257 211 H268 M257 216 H265" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

            {/* Head */}
            <rect x="193" y="110" width="14" height="25" fill="url(#skinGrad)" rx="3" />
            <ellipse cx="200" cy="95" rx="26" ry="28" fill="url(#skinGrad)" />

            {/* Focused, confident smile */}
            <ellipse cx="191" cy="94" rx="3.5" ry="4" fill="#0F172A" />
            <ellipse cx="209" cy="94" rx="3.5" ry="4" fill="#0F172A" />
            <circle cx="192" cy="92" r="1.2" fill="#FFFFFF" />
            <circle cx="210" cy="92" r="1.2" fill="#FFFFFF" />
            <path d="M192 108 Q200 116, 208 108" stroke="#7C2D12" strokeWidth="2.5" fill="#FFFFFF" strokeLinecap="round" />

            {/* Hair */}
            <path
              d="M172 90 C170 62, 185 52, 206 52 C226 52, 232 65, 228 87 C222 75, 214 71, 200 71 C185 71, 178 79, 172 90 Z"
              fill="url(#hairGrad)"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
