import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import React from 'react';
import { getScoreDetails, calculatePoints } from './utils';
import { generateFallbackEcoResponse, generateFallbackChatResponse } from './fallback-helpers';

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

const mockConfirm = vi.fn(() => true);
const mockPrint = vi.fn();

// Register the custom matcher toBeInTheDocument for maximum environment compatibility
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && received !== undefined;
    if (pass) {
      return {
        pass: true,
        message: () => `expected element to not be in the document`,
      };
    } else {
      return {
        pass: false,
        message: () => `expected element to be in the document`,
      };
    }
  }
});

// Configure mocking for browser environments
Object.defineProperty(window, 'confirm', { value: mockConfirm, writable: true });
Object.defineProperty(window, 'print', { value: mockPrint, writable: true });

describe('Sustaina Utilities and Score Engine Tests', () => {
  test('evaluates score details >= 90 as Eco Hero', () => {
    const detailsHigh = getScoreDetails(90);
    const detailsSuper = getScoreDetails(100);
    const detailsOver = getScoreDetails(120);

    expect(detailsHigh.title).toBe('Eco Hero 🌱');
    expect(detailsHigh.color).toContain('text-emerald-500');
    expect(detailsSuper.title).toBe('Eco Hero 🌱');
    expect(detailsOver.title).toBe('Eco Hero 🌱');
  });

  test('evaluates score details >= 70 and < 90 as Green Champion', () => {
    const detailsChamp = getScoreDetails(70);
    const detailsAlmostHero = getScoreDetails(89);

    expect(detailsChamp.title).toBe('Green Champion ♻️');
    expect(detailsChamp.color).toContain('text-teal-500');
    expect(detailsAlmostHero.title).toBe('Green Champion ♻️');
  });

  test('evaluates score details >= 50 and < 70 as Improving', () => {
    const detailsImp = getScoreDetails(50);
    const detailsUpperImp = getScoreDetails(69);

    expect(detailsImp.title).toBe('Improving 🌍');
    expect(detailsImp.color).toContain('text-amber-500');
    expect(detailsUpperImp.title).toBe('Improving 🌍');
  });

  test('evaluates score details < 50 as Needs Attention', () => {
    const detailsWarning = getScoreDetails(49);
    const detailsLow = getScoreDetails(10);
    const detailsNegative = getScoreDetails(-5);

    expect(detailsWarning.title).toBe('Needs Attention ⚠️');
    expect(detailsWarning.color).toContain('text-rose-500');
    expect(detailsLow.title).toBe('Needs Attention ⚠️');
    expect(detailsNegative.title).toBe('Needs Attention ⚠️');
  });

  test('calculates cumulative reward points based on tips, goals, and badges', () => {
    // Equation: 2100 + (completedTipsCount * 120) + (completedGoalsCount * 250) + (achievedBadgesCount * 400)
    expect(calculatePoints(0, 0, 0)).toBe(2100);
    expect(calculatePoints(1, 0, 0)).toBe(2220);
    expect(calculatePoints(0, 1, 0)).toBe(2350);
    expect(calculatePoints(0, 0, 1)).toBe(2500);
    expect(calculatePoints(3, 2, 1)).toBe(3360);
    expect(calculatePoints(10, 10, 10)).toBe(9800);
  });
});

describe('Heuristic Carbon & AI Coach Fallback Routines', () => {
  test('assigns high score and low carbon for active human commuting', () => {
    const bikeEstimate = generateFallbackEcoResponse('I rode a bicycle and did some walking');
    expect(bikeEstimate.carbonScore).toBe(98);
    expect(bikeEstimate.estimatedCarbonKg).toBe(0.5);
    expect(bikeEstimate.topEmissionSources).toContain('Equipment production cycle');
  });

  test('assigns low score and high carbon for fossil driving journeys', () => {
    const driveEstimate = generateFallbackEcoResponse('commuting to town in gasoline passenger car');
    expect(driveEstimate.carbonScore).toBe(35);
    expect(driveEstimate.estimatedCarbonKg).toBe(24.5);
    expect(driveEstimate.topEmissionSources).toContain('Fossil fuel combustion');
  });

  test('recognizes vegan foods and veggie options as clean', () => {
    const plantEstimate = generateFallbackEcoResponse('had a nice vegan bowl with tofu salad');
    expect(plantEstimate.carbonScore).toBe(92);
    expect(plantEstimate.estimatedCarbonKg).toBe(2.1);
  });

  test('identifies high carbon overhead from animal meats', () => {
    const beefEstimate = generateFallbackEcoResponse('cooked a beef steak and some pork chops');
    expect(beefEstimate.carbonScore).toBe(48);
    expect(beefEstimate.estimatedCarbonKg).toBe(12.8);
  });

  test('attributes heavy carbon weight to flight journeys', () => {
    const flightEstimate = generateFallbackEcoResponse('took a flying regional flight plane journey');
    expect(flightEstimate.carbonScore).toBe(15);
    expect(flightEstimate.estimatedCarbonKg).toBe(280.0);
  });

  test('applies robust fallback standards for unspecified messages', () => {
    const generalEstimate = generateFallbackEcoResponse('cleaning the house and sorting letters');
    expect(generalEstimate.carbonScore).toBe(65);
    expect(generalEstimate.estimatedCarbonKg).toBe(15.2);
  });

  test('handles diverse dialogue queries elegantly', () => {
    const helloGreeting = generateFallbackChatResponse([{ role: 'user', parts: [{ text: 'hi coach' }] }], null);
    expect(helloGreeting.reply).toContain('Sustaina');
    expect(helloGreeting.reply).toContain('green journey');

    const foodConcept = generateFallbackChatResponse([{ role: 'user', parts: [{ text: 'tell me about diet habits' }] }], null);
    expect(foodConcept.reply).toContain('Low-Carbon Diets');
    expect(foodConcept.reply).toContain('Plant proteins');

    const transitConcept = generateFallbackChatResponse([{ role: 'user', parts: [{ text: 'best transit choice' }] }], null);
    expect(transitConcept.reply).toContain('Travel Tips');
    expect(transitConcept.reply).toContain('Public Transit');

    const energyConcept = generateFallbackChatResponse([{ role: 'user', parts: [{ text: 'household electricity savings' }] }], null);
    expect(energyConcept.reply).toContain('Home Energy Use');
    expect(energyConcept.reply).toContain('Vampire Draw');

    const otherConcept = generateFallbackChatResponse([{ role: 'user', parts: [{ text: 'something else' }] }], null);
    expect(otherConcept.reply).toContain('Sustaina');
  });
});

describe('Carbon AI Dashboard Interactive Core Interface Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('mounts successfully and renders the primary sidebar options', () => {
    render(<App />);
    expect(document.getElementById('tab-dashboard')).toBeInTheDocument();
    expect(document.getElementById('tab-chat')).toBeInTheDocument();
    expect(document.getElementById('tab-rewards')).toBeInTheDocument();
  });

  test('switches visual themes between light and dark modes upon button click', () => {
    render(<App />);
    const button = screen.getByTitle(/Toggle color theme/i);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(localStorage.getItem('theme_dark')).toBe('true');

    fireEvent.click(button);
    expect(localStorage.getItem('theme_dark')).toBe('false');
  });

  test('populates the input area when user triggers quick smart presets', () => {
    render(<App />);
    const presetBtn = screen.getByText(/Low-Carbon Transit Day/i);
    expect(presetBtn).toBeInTheDocument();

    fireEvent.click(presetBtn);
    const inputArea = screen.getByPlaceholderText(/e.g., I drove 12 miles/i) as HTMLTextAreaElement;
    expect(inputArea.value).toContain('subway');
  });

  test('performs footprint computations correctly on successful fetch response', async () => {
    const mockOutput = {
      estimatedCarbonKg: 0.8,
      carbonScore: 97,
      analysis: "Highly sustainable transit day pattern.",
      actionableTips: ["Optimize route sequences", "Avoid sudden speeds", "Maintain tire pressures"],
      topEmissionSources: ["Electricity storage", "Grid charging logistics", "Manufacturing overhead"],
      estimatedMonthlyReductionKg: 110,
      weeklyGoals: ["Incorporate clean cycles", "Perform bike checks", "Conduct active mileage tracks"]
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOutput)
    });

    render(<App />);
    const inputArea = screen.getByPlaceholderText(/e.g., I drove 12 miles/i);
    fireEvent.change(inputArea, { target: { value: 'Biking along the harbor lanes' } });

    const runButton = screen.getByText(/Analyze Day Footprint/i);
    fireEvent.click(runButton);

    expect(global.fetch).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/Highly sustainable transit day pattern/i)).toBeInTheDocument();
    });
  });

  test('displays warning notifications when carbon footprint requests fail', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Rate limit exhausted" })
    });

    render(<App />);
    const inputArea = screen.getByPlaceholderText(/e.g., I drove 12 miles/i);
    fireEvent.change(inputArea, { target: { value: 'Drove SUV to office' } });

    const runButton = screen.getByText(/Analyze Day Footprint/i);
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText(/Unable to fetch real-time footprint data/i)).toBeInTheDocument();
    });
  });

  test('navigates to Coach Tab and handles dialogues with the bot successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reply: "Sustaina reply: Keep up the fantastic transit score!" })
    });

    render(<App />);

    // Click on Coach tab in sidebar navigation
    const coachTab = document.getElementById('tab-chat');
    expect(coachTab).not.toBeNull();
    if (coachTab) {
      fireEvent.click(coachTab);
    }

    // Verify chat interface is loaded
    const coachInput = screen.getByPlaceholderText(/Ask Sustaina how to make/i);
    expect(coachInput).toBeInTheDocument();

    // Type a question
    fireEvent.change(coachInput, { target: { value: 'How can I maintain Eco Hero rating?' } });

    // Submit the chat form
    const chatForm = coachInput.closest('form');
    expect(chatForm).not.toBeNull();
    if (chatForm) {
      fireEvent.submit(chatForm);
    }

    await waitFor(() => {
      expect(screen.getByText(/Keep up the fantastic transit score!/i)).toBeInTheDocument();
    });
  });
});
