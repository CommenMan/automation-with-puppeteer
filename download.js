const fs = require('fs');
const download = require('image-downloader');
const path = require('path');

// Load the JSON file containing URLs
const urlsByCategory = JSON.parse(fs.readFileSync('./urls_by_category.json', 'utf8'));

// Configurable base folder
const BASE_DOWNLOAD_FOLDER = path.join(__dirname, 'downloads');

// Create the base folder if it doesn't exist
if (!fs.existsSync(BASE_DOWNLOAD_FOLDER)) {
  fs.mkdirSync(BASE_DOWNLOAD_FOLDER, { recursive: true });
}

// Utility function to create a directory if it doesn't exist
function createFolderIfNotExist(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

// Function to download images with retry mechanism
async function downloadWithRetry(url, dest, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { filename } = await download.image({ url, dest });
      console.log(`Successfully downloaded ${filename}`);
      return filename;
    } catch (err) {
      console.error(`Error downloading ${url}:`, err);
      if (i === retries - 1) {
        console.error(`Failed to download ${url} after ${retries} retries.`);
      } else {
        console.log(`Retrying ${url} (${i + 1}/${retries})...`);
      }
    }
  }
}

// Main function to handle downloading images for each category
async function downloadImagesByCategory(urlsByCategory) {
  for (const category in urlsByCategory) {
    if (urlsByCategory.hasOwnProperty(category)) {
      const urls = urlsByCategory[category];

      // Create folder for this category
      const categoryFolder = path.join(BASE_DOWNLOAD_FOLDER, category);
      createFolderIfNotExist(categoryFolder);

      // Use Promise.all to download all images in parallel for each category
      const downloadPromises = urls.map((url, index) => {
        const dest = path.join(categoryFolder, `${category}_img${index + 1}.jpg`);
        return downloadWithRetry(url, dest); // Downloads with retry logic
      });

      try {
        // Await all downloads for the current category
        await Promise.all(downloadPromises);
        console.log(`All images for category "${category}" downloaded successfully!`);
      } catch (err) {
        console.error(`Failed to download some images for category "${category}":`, err);
      }
    }
  }
}

// Execute the download process
(async () => {
  console.log('Starting image download...');
  await downloadImagesByCategory(urlsByCategory);
  console.log('Download process completed.');
})();
