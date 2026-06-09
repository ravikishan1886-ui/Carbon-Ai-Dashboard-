import { describe, it, expect } from 'vitest';
import { getScoreDetails, calculatePoints } from './utils';

describe('Carbon AI Dashboard Core Engine Tests', () => {
  it('should evaluate score categories correctly for Green Champion rating', () => {
    const details = getScoreDetails(80);
    expect(details.title).toBe('Green Champion ♻️');
    expect(details.color).toContain('text-teal-500');
  });

  it('should evaluate score categories correctly for Eco Hero rating', () => {
    const details = getScoreDetails(95);
    expect(details.title).toBe('Eco Hero 🌱');
    expect(details.color).toContain('text-emerald-500');
  });

  it('should evaluate low score categories as Needs Attention', () => {
    const details = getScoreDetails(30);
    expect(details.title).toBe('Needs Attention ⚠️');
    expect(details.color).toContain('text-rose-500');
  });

  it('should calculate points including completion modifiers correctly', () => {
    // Base: 2100 points
    // completedTipsCount: 3 * 120 = 360
    // completedGoalsCount: 2 * 250 = 500
    // achievedBadgesCount: 1 * 400 = 400
    // Expected: 2100 + 360 + 500 + 400 = 3360
    const points = calculatePoints(3, 2, 1);
    expect(points).toBe(3360);
  });
});
