const fs = require('fs');

// Read the original meals.json file
const meals = JSON.parse(fs.readFileSync('meals.json', 'utf8'));

// Add mealShape to each meal
const mealsWithShape = meals.map(meal => {
    // Check if options array contains exactly ["شامي", "بلدي"]
    const hasShamiBaladi = meal.options &&
        meal.options.length === 2 &&
        meal.options.includes("شامي") &&
        meal.options.includes("بلدي");

    return {
        ...meal,
        mealShape: hasShamiBaladi ? "ساندوتش" : "طبق"
    };
});

// Calculate split points for 3 equal parts
const totalMeals = mealsWithShape.length;
const mealsPerFile = Math.ceil(totalMeals / 3);

// Split into 3 parts
const part1 = mealsWithShape.slice(0, mealsPerFile);
const part2 = mealsWithShape.slice(mealsPerFile, mealsPerFile * 2);
const part3 = mealsWithShape.slice(mealsPerFile * 2);

// Write to 3 separate files
fs.writeFileSync('meals_part1.json', JSON.stringify(part1, null, 4), 'utf8');
fs.writeFileSync('meals_part2.json', JSON.stringify(part2, null, 4), 'utf8');
fs.writeFileSync('meals_part3.json', JSON.stringify(part3, null, 4), 'utf8');

console.log(`Total meals: ${totalMeals}`);
console.log(`Part 1: ${part1.length} meals`);
console.log(`Part 2: ${part2.length} meals`);
console.log(`Part 3: ${part3.length} meals`);
console.log('\nFiles created:');
console.log('- meals_part1.json');
console.log('- meals_part2.json');
console.log('- meals_part3.json');
