/**
 * Heuristic eco response generator for direct user feedback fallback during transient 503 API outages.
 * It analyzes the text input for keywords and returns a realistic estimated carbon footprint and action plan.
 * 
 * @param activityText - The raw activity text entered by the user.
 * @returns A structured eco calculation result matching the carbon dashboard schemas.
 */
export function generateFallbackEcoResponse(activityText: string) {
  const text = (activityText || "").toLowerCase();
  let carbonKg = 15.2;
  let score = 65;
  let analysis = `A robust eco estimate for your daily option: "${activityText}". Fossil fuels and manufacturing energy overheads are estimated to be the primary drivers for this type of lifestyle profile. Encourage transitioning towards active transit and plant-based foods where practical.`;
  let tips = [
    "Switch to public transit or electric mobility modes where possible.",
    "Optimize home climate control settings to conserve standby power.",
    "Adopt localized, plant-centric dietary options to minimize supply chain impact."
  ];
  let sources = ["Transportation energy", "Grid electricity output", "Food production footprint"];
  let monthlyReduction = 45;
  let goals = [
    "Log at least two active commuting days this week.",
    "Reduce warm water usage during personal care routines.",
    "Unplug non-essential electronic power blocks when inactive."
  ];

  if (text.includes("bike") || text.includes("bicycle") || text.includes("walk") || text.includes("foot")) {
    carbonKg = 0.5;
    score = 98;
    analysis = "Zero-emission personal travel methods have an exceptionally small ecosystem footprint. Your choice to travel under personal human power drastically supports localized carbon reduction.";
    tips = [
      "Inspire others to choose physical commuting form factors.",
      "Ensure proper gear safety during nocturnal or wet weather biking.",
      "Track your cumulative weekly mileage to visualize your ongoing carbon displacement."
    ];
    sources = ["Body metabolic energy", "Equipment production cycle", "Hydration carbon overhead"];
    monthlyReduction = 120;
    goals = [
      "Keep standard daily trips under 5 kilometers fully human-powered.",
      "Maintain active tire pressure on your bicycle regularly.",
      "Log your active transit patterns in your journal tracker."
    ];
  } else if (text.includes("car") || text.includes("drive") || text.includes("vehicle") || text.includes("gasoline") || text.includes("petrol")) {
    carbonKg = 24.5;
    score = 35;
    analysis = "Internal combustion single-occupancy driving is typically high in fossil carbon emissions. A single day of personal driving contributes significantly to atmospheric carbon burden.";
    tips = [
      "Consolidate multiple separate distance errands into a single efficient driving loop.",
      "Explore ridesharing, carpooling, or public transit to split collective emissions.",
      "Transition toward hybrid or electric vehicles for mandatory commutes."
    ];
    sources = ["Fossil fuel combustion", "Vehicle tire friction", "Fuel transportation logistics"];
    monthlyReduction = 160;
    goals = [
      "Reduce personal driving mileage by at least 15% this coming week.",
      "Keep highway driving speeds steady to optimize internal engine efficiency.",
      "Commit to one completely car-free day over the next seven days."
    ];
  } else if (text.includes("vegan") || text.includes("vegetarian") || text.includes("plant") || text.includes("salad") || text.includes("vegetables") || text.includes("tofu")) {
    carbonKg = 2.1;
    score = 92;
    analysis = "A plant-based intake footprint is exceptionally low. Minimizing animal-derived dairy and meat products bypasses intensive industrial livestock digestion and high water consumption overheads. Great work!";
    tips = [
      "Prioritize localized, seasonal organic produce to lower transit emissions.",
      "Incorporate legume proteins like lentils or chickpeas instead of processed meats.",
      "Compost food scraps to restrict household refuse landfill gas releases."
    ];
    sources = ["Agricultural soil cultivation", "Cold chain storage refrigeration", "Localized retail transportation"];
    monthlyReduction = 85;
    goals = [
      "Keep all daily courses fully plant-derived for three days this week.",
      "Shop primarily at a local farmers' market or neighborhood greengrocer.",
      "Batch prep portions to cut down on gas/electricity stove heating cycles."
    ];
  } else if (text.includes("beef") || text.includes("meat") || text.includes("pork") || text.includes("steak") || text.includes("chicken")) {
    carbonKg = 12.8;
    score = 48;
    analysis = "Animal product consumption produces high methane and feed-growth emissions compared to grains/beans. Transitioning to green protein choices is a highly impactful pathway to lower personal footprints.";
    tips = [
      "Incorporate a few meat-free days per week to diversify your protein source footprints.",
      "Substitute low-carbon poultry or egg proteins for high-impact beef or mutton.",
      "Buy sustainably pasture-raised products from local providers where feasible."
    ];
    sources = ["Livestock enteric fermentation", "Farming feed logistics", "Processing refrigeration power"];
    monthlyReduction = 70;
    goals = [
      "Commit to a complete 'Green Monday' meatless day this week.",
      "Limit red meat portions to under 150 grams per serving.",
      "Familiarize yourself with delicious tofu or direct bean-based recipes."
    ];
  } else if (text.includes("flight") || text.includes("plane") || text.includes("fly") || text.includes("airport")) {
    carbonKg = 280.0;
    score = 15;
    analysis = "Aviation is highly concentrated in carbon gas emissions released directly into the upper atmosphere. Air travel represents a massive proportion of personal annual carbon expenditures.";
    tips = [
      "Choose non-stop routes to bypass fuel-intensive takeoff and landing cycles.",
      "Explore regional train or high-efficiency motorcoach alternatives for land routing.",
      "Support standard audited carbon offset options provided by verified agencies."
    ];
    sources = ["Aviation fuel combustion", "High-altitude radiative forcing", "Airport transit operations"];
    monthlyReduction = 450;
    goals = [
      "Substitute at least one domestic short-haul flight with high-speed rail travel.",
      "Conduct long-distance syncs via modern telepresence channels.",
      "Fund equivalent green reforestation programs to match historical mileage."
    ];
  }

  return {
    estimatedCarbonKg: carbonKg,
    carbonScore: score,
    analysis: analysis,
    actionableTips: tips,
    topEmissionSources: sources,
    estimatedMonthlyReductionKg: monthlyReduction,
    weeklyGoals: goals
  };
}

/**
 * Heuristic coach chat response generator for direct user feedback fallback during transient 503 API outages.
 * It provides helpful sustainable recommendations and keeps the chat interface functional even without Gemini coverage.
 * 
 * @param messages - The history of messages in the dialogue.
 * @param currentContext - The background carbon footprints logged earlier.
 * @returns A structured chatbot response containing the text reply.
 */
export function generateFallbackChatResponse(messages: any[], currentContext: any) {
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.parts?.[0]?.text?.toLowerCase() || "";
  
  let reply = "Hello! I am Sustaina, your eco coach. Although the AI is currently seeing highly heavy demand, I can absolutely help you: reduce commuting emissions, plan a plant-rich diet, or optimize home energy conservation! What would you like to explore?";

  if (lastUserMessage.includes("diet") || lastUserMessage.includes("food") || lastUserMessage.includes("eat") || lastUserMessage.includes("meat")) {
    reply = `### Choosing Low-Carbon Diets 🥗

A plant-rich diet is one of the most effective ways to lower your footprint:
1. **Beef/Lamb are high-emission foods** due to enteric fermentation (methane) and extensive feed crops.
2. **Plant proteins** (lentils, beans, tofu) have up to **90% fewer emissions** per gram of protein.
3. **Local/Seasonal produces** further optimize transit emissions.

Would you like some vegetarian/vegan meal ideas for this week?`;
  } else if (lastUserMessage.includes("transit") || lastUserMessage.includes("commute") || lastUserMessage.includes("car") || lastUserMessage.includes("drive") || lastUserMessage.includes("travel")) {
    reply = `### Eco-Friendly Travel Tips 🚗🚲

Transportation carbon-output is highly impactful:
- **Active transit**: Walking or cycling has a virtually zero-carbon operational profile.
- **Public Transit**: Trains and buses decrease per-passenger emissions by 60-80%.
- **Electric Vehicles (EVs)**: Cut operational emissions exceptionally, especially on highly clean renewable grids.

Would you like me to help optimize your daily commute routing?`;
  } else if (lastUserMessage.includes("energy") || lastUserMessage.includes("electricity") || lastUserMessage.includes("light") || lastUserMessage.includes("power") || lastUserMessage.includes("home")) {
    reply = `### Optimizing Home Energy Use 💡

Saving power in your domicile has both high financial and environmental benefits:
- **Smart Thermostats**: Save up to 10% on heating and cooling by avoiding heating empty spaces.
- **LED Lighting**: Uses 75% less energy and lasts 25x longer than traditional incandescent bulbs.
- **Vampire Draw**: Unplug chargers and appliances when not in use to cut silent standby consumption.

Let me know if you want to perform a mini residential energy audit!`;
  } else if (lastUserMessage.includes("hello") || lastUserMessage.includes("hi") || lastUserMessage.includes("hey")) {
    reply = `### Hello there! I'm Sustaina, your Eco Coach! 🌱

I'm here to support your green journey. You can ask me about:
- **Sustainable habits** and direct carbon offsets.
- **Home heating and cooling optimization.**
- **Eco-coach goals** based on your calculated days.

How has your sustainable impact been going today?`;
  }

  return { reply };
}
