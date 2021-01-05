/**
 * The main script file of the application.
 *
 * @author Sebastian Åkerblom <sa224ny@student.lnu.se>
 * @version 1.0.0
 */

// Imports
import mainScraper from './javascripts/main-scraper.js'

const [,, path] = process.argv

try {
  if (!path) {
    console.log('Web scraping https://cscloud6-127.lnu.se/scraper-site-1\nThis may take some time...\n')
    mainScraper('https://cscloud6-127.lnu.se/scraper-site-1')
  } else {
    console.log(`Web scraping ${path}\nThis may take some time...\n`)
    mainScraper(path)
  }
} catch (err) {
  console.error(err.message)
}
