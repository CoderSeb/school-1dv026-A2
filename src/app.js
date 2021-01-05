import mainScraper from './javascripts/main-scraper.js'

// Used in development to quickly run the program.
const url1 = 'https://cscloud6-127.lnu.se/scraper-site-1'
const url2 = 'https://cscloud6-127.lnu.se/scraper-site-2'

const [,, path] = process.argv

console.log(`Web scraping ${path}\nThis may take some time...\n`)

mainScraper(url1)
