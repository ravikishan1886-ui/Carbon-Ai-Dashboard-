import assert from 'node:assert';
import { getScoreDetails, calculatePoints } from '../src/utils';

console.log('🏃 Starting Carbon AI Dashboard automated unit test suite...');

try {
  // Test 1: High Carbon Score Details
  const ecoHero = getScoreDetails(95);
  assert.strictEqual(ecoHero.title, 'Eco Hero 🌱');
  assert.match(ecoHero.color, /text-emerald-500/);
  console.log('✅ Test 1 Passed: Eco Hero score category verified.');

  // Test 2: Mid High Carbon Score Details
  const champion = getScoreDetails(80);
  assert.strictEqual(champion.title, 'Green Champion ♻️');
  console.log('✅ Test 2 Passed: Green Champion score category verified.');

  // Test 3: Improving Rating Details
  const improving = getScoreDetails(65);
  assert.strictEqual(improving.title, 'Improving 🌍');
  console.log('✅ Test 3 Passed: Improving score category verified.');

  // Test 4: Low Carbon Score Needs Attention
  const needsAttention = getScoreDetails(30);
  assert.strictEqual(needsAttention.title, 'Needs Attention ⚠️');
  console.log('✅ Test 4 Passed: Needs Attention score category verified.');

  // Test 5: Points Calculation
  // 2100 base + (1 * 120) + (2 * 250) + (3 * 400) = 3920
  const points = calculatePoints(1, 2, 3);
  assert.strictEqual(points, 3920);
  console.log('✅ Test 5 Passed: Points metric counting verified.');

  console.log('🎉 All automated tests completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Unit test suite execution failed:', error);
  process.exit(1);
}
