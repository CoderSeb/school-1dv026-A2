/**
 * The main scraper module.
 *
 * @author Sebastian Åkerblom <sa224ny@student.lnu.se>
 * @version 1.0.0
 */

// Imports
import axios from 'axios'
import cheerio from 'cheerio'
import calendarScraper from './calendar-scraper.js'
import linkScraper from './link-scraper.js'
import cinemaScraper from './cinema-scraper.js'
import dinnerScraper from './dinner-scraper.js'

// Variable declaration
let availableDays = []
const amountOfMovies = []
let numberOfMovies = null
let moviesResult = null

/**
 * Main function of the web scraper.
 *
 * @param {string} path as the URL to be scraped.
 */
async function mainScraper (path) {
  linkScraper(path).then(mainLinks => {
    mainLinks.forEach(async link => {
      // If link contains calendar.
      if (link.includes('calendar')) {
        availableDays = await calendarScraper(link, mainLinks)
        return availableDays
      }
      // If link contains cinema
      if (link.includes('cinema')) {
        axios.get(link).then(response => {
          const $ = cheerio.load(response.data)
          $('#movie > option').each((index, item) => {
            if (!isNaN(Number($(item).attr('value')))) {
              const theMovies = {
                movieNumber: $(item).attr('value'),
                movieName: $(item).text()
              }
              amountOfMovies.push(theMovies)
            }
          })
          numberOfMovies = amountOfMovies.length
          return numberOfMovies
        }).then(numberOfMovies => {
          setTimeout(() => {
            const getMovies = cinemaScraper(link, availableDays, numberOfMovies)
            Promise.all([getMovies]).then((value) => {
              moviesResult = value.flat()
            })
          }, 500)
        })
      }
      // If link contains dinner.
      if (link.includes('dinner')) {
        setTimeout(() => {
          dinnerScraper(link, moviesResult, availableDays, amountOfMovies)
        }, 1500)
      }
    })
  })
}

export default mainScraper
