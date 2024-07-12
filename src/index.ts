import axios from "axios";
import fs from "fs";
import puppeteer, { Page } from "puppeteer";
import { program } from "commander";

interface IScraping {
  url: string;
  selector: string;
  page: Page;
}

program
  .requiredOption(
    "-u, --url <string>",
    "The base URL to use for crawl (required)"
  )
  .option("-s, --select <string>", "CSS selector for images", "img")
  .option("-v, --verbose")
  .parse();

const { url: baseUrl, select, verbose } = program.opts();

if (verbose) console.log("Verbose logging enabled");

const commomExtension = [".jpg", ".png"];

async function download(url: any, filepath: any) {
  try {
    if (verbose) console.log("Downloading img:", url);

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });
    await new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(filepath))
        .on("error", reject)
        .once("close", () => resolve(filepath));
    });
  } catch (error) {
    console.error("Error downloading img:", url);
    console.error(error);
  }
}

(async () => {
  let index = 0;

  async function scrapePage({ url, selector, page }: IScraping) {
    try {
      await page.goto(url);

      console.log("Starting on:", url);

      await page.waitForSelector(selector);

      const imageUrls = await page.evaluate((selector) => {
        const images = Array.from(document.querySelectorAll(selector));
        if (!images.every((element) => element instanceof HTMLImageElement))
          throw new Error("One of the element is not an img");
        return images.map((image) => image.src);
      }, selector);

      console.log(`Found ${imageUrls.length} images`);

      await Promise.all(
        imageUrls.map((imageUrl) => {
          // Loop for checking if imageurl is parseable to nodejs filename if not parse it
          for (const ext of commomExtension) {
            const extIndex = imageUrl.indexOf(ext);
            if (extIndex === -1 || extIndex === imageUrl.length + 4) continue;
            const parseableFilename = imageUrl
              .substring(0, extIndex + ext.length)
              .split("/")
              .pop();
            const localPath = `./images/${parseableFilename}`;
            return download(imageUrl, localPath);
          }
          const filename = imageUrl.split("/").pop();
          const localPath = `./images/${filename}`;
          return download(imageUrl, localPath);
        })
      );

      console.log(`Completed page ${index}`);
    } catch (error) {
      console.error("Error scraping page:", url);
      console.error(error);
    }
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await scrapePage({ url: baseUrl, selector: select, page });
  } catch (error) {
    console.error("Error during scraping:");
    console.error(error);
  } finally {
    console.log("Crawl complete, exiting.");
    await browser.close();
    process.exit();
  }
})();
