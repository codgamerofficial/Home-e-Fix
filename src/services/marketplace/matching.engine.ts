import type { MatchedProfessionalCandidate } from "@/types/marketplace.types";

export interface CandidateProfile {
  id: string;
  name: string;
  phone: string;
  rating: number;
  completedJobsCount: number;
  completionRate: number;
  tradeCategories: string[];
  primaryHub: string;
  isAvailable: boolean;
  activeJobsCount: number;
}

export const matchingEngine = {
  /**
   * Score and rank eligible professionals for an incoming booking request.
   */
  rankCandidates(
    candidates: CandidateProfile[],
    categorySlug: string,
    targetZone: string
  ): MatchedProfessionalCandidate[] {
    const scored = candidates
      .filter((pro) => pro.isAvailable)
      .map((pro) => {
        let score = 0;

        // 1. Skill Match (40 pts)
        const hasTrade = pro.tradeCategories.some(
          (c) => c.toLowerCase() === categorySlug.toLowerCase()
        );
        if (hasTrade) score += 40;

        // 2. Hub/Zone Match (30 pts max)
        const isSameZone = pro.primaryHub.toUpperCase() === targetZone.toUpperCase();
        const distanceKm = isSameZone ? 3.5 : 12.0;
        score += isSameZone ? 30 : 12;

        // 3. Rating Score (up to 20 pts)
        const ratingScore = Math.min(20, (pro.rating || 4.5) * 4);
        score += ratingScore;

        // 4. Reliability & Completion Rate (up to 10 pts)
        const reliabilityScore = Math.min(10, ((pro.completionRate || 95) / 100) * 10);
        score += reliabilityScore;

        // 5. Active Workload Penalty (-10 pts per current active job)
        const workloadPenalty = (pro.activeJobsCount || 0) * 10;
        score = Math.max(0, score - workloadPenalty);

        return {
          professionalId: pro.id,
          name: pro.name,
          phone: pro.phone,
          rating: pro.rating,
          completedJobs: pro.completedJobsCount,
          completionRate: pro.completionRate,
          distanceKm,
          zone: pro.primaryHub,
          totalScore: Math.round(score),
        };
      });

    // Rank highest score first
    return scored.sort((a, b) => b.totalScore - a.totalScore);
  },

  /**
   * Calculate assignment timeout in seconds (Default 45s).
   */
  getAssignmentTimeoutSeconds(): number {
    return 45;
  },
};
