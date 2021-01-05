/**
 * The main script file of the application.
 *
 * @author Sebastian Åkerblom <sa224ny@student.lnu.se>
 * @version 1.0.0
 */

// Imports
import validator from 'validator'
import mainScraper from './javascripts/main-scraper.js'

const [,, path] = process.argv

try {
  if (!path || !validator.isURL(path)) {
    console.log('Hi there!\nThis is a web scraper and therefore it needs a url, please enter one after the start script to begin!')
  } else {
    console.log(`Scraping ${path}\nThis may take some time...\n`)
    mainScraper(path)
  }
} catch (err) {
  console.error(err.message)
}
