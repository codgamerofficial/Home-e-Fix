import test from "node:test";
import assert from "node:assert/strict";
import { matchingEngine, type CandidateProfile } from "../src/services/marketplace/matching.engine";

test("Matching Engine - Ranks candidate with matching trade and closer hub higher", () => {
  const candidates: CandidateProfile[] = [
    {
      id: "pro-1",
      name: "Suresh Reddy",
      phone: "+91 98765 43210",
      rating: 4.9,
      completedJobsCount: 120,
      completionRate: 98,
      tradeCategories: ["electrical", "plumbing"],
      primaryHub: "SALT_LAKE",
      isAvailable: true,
      activeJobsCount: 0,
    },
    {
      id: "pro-2",
      name: "Amit Sen",
      phone: "+91 98300 12345",
      rating: 4.8,
      completedJobsCount: 85,
      completionRate: 95,
      tradeCategories: ["electrical"],
      primaryHub: "HOWRAH",
      isAvailable: true,
      activeJobsCount: 0,
    },
    {
      id: "pro-3",
      name: "Rajesh Das",
      phone: "+91 98311 99999",
      rating: 5.0,
      completedJobsCount: 200,
      completionRate: 100,
      tradeCategories: ["cleaning"], // Different trade
      primaryHub: "SALT_LAKE",
      isAvailable: true,
      activeJobsCount: 0,
    },
  ];

  const ranked = matchingEngine.rankCandidates(candidates, "electrical", "SALT_LAKE");

  assert.equal(ranked.length, 3);
  // pro-1 should be #1: skill match (40) + same zone (30) + high rating (19.6) + reliability (9.8) = ~99 pts
  assert.equal(ranked[0].professionalId, "pro-1");
  assert.ok(ranked[0].totalScore > ranked[1].totalScore);

  // pro-2 has skill match (40) but different zone (12)
  assert.equal(ranked[1].professionalId, "pro-2");

  // pro-3 has no skill match (0)
  assert.equal(ranked[2].professionalId, "pro-3");
});

test("Matching Engine - Filters out unavailable professionals", () => {
  const candidates: CandidateProfile[] = [
    {
      id: "busy-pro",
      name: "Busy Pro",
      phone: "+91 98000 00000",
      rating: 5.0,
      completedJobsCount: 50,
      completionRate: 100,
      tradeCategories: ["plumbing"],
      primaryHub: "SALT_LAKE",
      isAvailable: false, // Busy
      activeJobsCount: 1,
    },
  ];

  const ranked = matchingEngine.rankCandidates(candidates, "plumbing", "SALT_LAKE");
  assert.equal(ranked.length, 0);
});

test("Matching Engine - Returns 45s dispatch timeout", () => {
  assert.equal(matchingEngine.getAssignmentTimeoutSeconds(), 45);
});
