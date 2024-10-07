const fs = require('fs');
const Papa = require('papaparse');

// Read the CSV file into a string
const csvFile = fs.readFileSync('./categories_september2024.csv', 'utf8'); // Replace with your file path

// Parse the CSV file
const results = Papa.parse(csvFile, {
  header: true, // Treat the first row as a header
});

const columnName = 'name'; // Column name to retrieve
const columnValues = [];

// Retrieve values from the 'name' column
results.data.forEach(row => {
  if (row[columnName]) {
    columnValues.push(row[columnName]);
  }
});

console.log('Column Values:', columnValues);

// Export the column values
fs.writeFileSync('column_values.json', JSON.stringify(columnValues, null, 2)); // Save to a JSON file
