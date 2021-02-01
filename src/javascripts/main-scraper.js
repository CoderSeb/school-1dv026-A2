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

/**
 * Main function of the web scraper.
 *
 * @param {string} path as the URL to be scraped.
 */
async function mainScraper (path) {
  const [calendar, cinema, dinner] = await linkScraper(path)
  const amountOfMovies = []
  let numberOfMovies = null
  let moviesResult = null

  const availableDays = await calendarScraper(calendar)
  // If link contains cinema
  axios.get(cinema).then(response => {
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
  }).then(async numberOfMovies => {
    const getMovies = await cinemaScraper(cinema, availableDays, numberOfMovies)
    Promise.all([getMovies]).then((value) => {
      moviesResult = value.flat()
      return moviesResult
    })
  })

  Promise.all([moviesResult, availableDays, amountOfMovies]).then(params => {
    console.log(params)
    dinnerScraper(dinner, params[0], params[1], params[2])
  })
}

export default mainScraper
