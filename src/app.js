/**
 * The main script file of the application.
 *
 * @author Sebastian Åkerblom <sa224ny@student.lnu.se>
 * @version 1.0.0
 */

// Imports
import mainScraper from './javascripts/main-scraper.js'

const [,, path] = process.argv

console.log(`Web scraping ${path}\nThis may take some time...\n`)

mainScraper(path)
