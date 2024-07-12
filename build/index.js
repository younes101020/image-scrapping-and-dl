"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const commander_1 = require("commander");
commander_1.program
    .requiredOption("-u, --url <string>", "The base URL to use for crawl (required)")
    .option("-s, --select <string>", "CSS selector for images", "img")
    .option("-l, --limit <int>", "Maximum number of pages to crawl", "10")
    .option("-v, --verbose")
    .parse();
const { url: baseUrl, select, next, limit, verbose } = commander_1.program.opts();
if (verbose)
    console.log("Verbose logging enabled");
const commomExtension = [".jpg", ".png"];
function download(url, filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (verbose)
                console.log("Downloading img:", url);
            const response = yield (0, axios_1.default)({
                url,
                method: "GET",
                responseType: "stream",
            });
            yield new Promise((resolve, reject) => {
                response.data
                    .pipe(fs_1.default.createWriteStream(filepath))
                    .on("error", reject)
                    .once("close", () => resolve(filepath));
            });
        }
        catch (error) {
            console.error("Error downloading img:", url);
            console.error(error);
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    let index = 0;
    function scrapePage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ url, selector, page }) {
            try {
                yield page.goto(url);
                console.log("Starting on:", url);
                yield page.waitForSelector(selector);
                const imageUrls = yield page.evaluate((selector) => {
                    const images = Array.from(document.querySelectorAll(selector));
                    if (!images.every((element) => element instanceof HTMLImageElement))
                        throw new Error("One of the element is not an img");
                    return images.map((image) => image.src);
                }, selector);
                console.log(`Found ${imageUrls.length} images`);
                yield Promise.all(imageUrls.map((imageUrl) => {
                    // Loop for checking if imageurl is parseable to nodejs filename
                    for (const ext of commomExtension) {
                        const extIndex = imageUrl.indexOf(ext);
                        if (extIndex === -1 || extIndex === imageUrl.length + 4)
                            continue;
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
                }));
                console.log(`Completed page ${index}`);
            }
            catch (error) {
                console.error("Error scraping page:", url);
                console.error(error);
            }
        });
    }
    const browser = yield puppeteer_1.default.launch();
    const page = yield browser.newPage();
    try {
        yield scrapePage({ url: baseUrl, selector: select, page });
    }
    catch (error) {
        console.error("Error during scraping:");
        console.error(error);
    }
    finally {
        console.log("Crawl complete, exiting.");
        yield browser.close();
        process.exit();
    }
}))();
