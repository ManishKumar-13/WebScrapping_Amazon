const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');
const xlsx = require('xlsx');

// Define the URL for the page to scrape
const pageUrl = 'https://www.amazon.com/s?k=phone&page=2&crid=18EUYBSP7O1SQ&qid=1702535235&sprefix=phon%2Caps%2C280&ref=sr_pg_2';

// Function to fetch and save the page data
const getPageData = async () => {
    try {
        // Fetch the HTML content from the page
        const response = await axios.get(pageUrl);
        const data = response.data;

        // Save the fetched HTML to a file
        fs.writeFileSync("data.json", data);
        console.log("File Written Successfully!");

        // Read the HTML data from the saved file
        const html = fs.readFileSync("data.json");
        const $ = cheerio.load(html.toString());

        // Extract product titles
        const titleData = [];
        $(".a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2").each((index, element) => {
            titleData.push($(element).text().trim());
        });

        // Extract product ratings
        const ratingData = [];
        $('.a-row.a-size-small span').each((index, element) => {
            ratingData.push($(element).text().trim());
        });

        // Extract product prices
        const priceData = [];
        $('.a-price-whole').each((index, element) => {
            priceData.push($(element).text().trim());
        });

        // Combine extracted data into a JSON format
        const productJson = titleData.map((title, index) => {
            return {
                title,
                price: priceData[index] || 'N/A', // Handle cases where price may not be available
                rating: ratingData[index] || 'N/A', // Handle cases where rating may not be available
                availability: "Available" // Assuming availability as "Available" for this example
            };
        });

        // Save the extracted product data to a JSON file
        fs.writeFileSync("product.json", JSON.stringify(productJson, null, 2));
        console.log("Product data saved to product.json");

        // Create a new Excel workbook
        const workbook = xlsx.utils.book_new();

        // Convert JSON data to a sheet
        const sheetData = xlsx.utils.json_to_sheet(productJson);

        // Append the sheet to the workbook
        xlsx.utils.book_append_sheet(workbook, sheetData, 'Products');

        // Save the workbook to an Excel file
        xlsx.writeFile(workbook, 'product.xlsx');
        console.log("Excel sheet successfully created");

    } catch (error) {
        console.error("Error fetching page data:", error);
    }
};

// Run the function to fetch and process the data
getPageData();
