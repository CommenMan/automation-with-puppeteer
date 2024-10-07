const fs = require('fs');
const puppeteer = require('puppeteer');

// Read the category names from the JSON file
const categories = JSON.parse(fs.readFileSync('column_values.json', 'utf8'));

const urls = {}; // Store the URLs by category

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
  });

  const page = await browser.newPage();
  await page.goto('https://www.craiyon.com/');
  await page.setViewport({ width: 1080, height: 1024 });

  // Loop through the categories
  for (let i = 0; i < categories.length; i++) {
    urls[categories[i]] = [];
    await page.locator(`#prompt`).fill(categories[i]);
    await page.waitForSelector(`img[alt='Cropped input']`);

    for (let j = 1; j <= 10; j++) {
      const anchorHandle = await page.$(`#search-results div > a:nth-child(${j}) > div:nth-child(2) > img`);
      if (anchorHandle) {
        const href = await page.evaluate(anchor => anchor.getAttribute('src'), anchorHandle);
        console.log(`${categories[i]}: ${href}`);
        urls[categories[i]].push(href);
      }
    }

    // Clear the input field
    const textArea = await page.$('#prompt');
    await textArea.click({ clickCount: 3 });
    await textArea.type(String.fromCharCode(8));
    await textArea.type(String.fromCharCode(127));
  }

  await browser.close();

  // Write the URLs to a JSON file
  fs.writeFileSync('urls_by_category.json', JSON.stringify(urls, null, 2));

  console.log('URLs saved to urls_by_category.json');
})();
