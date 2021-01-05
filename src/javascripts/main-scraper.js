/**
 * The main scraper module.
 *
 * @author Sebastian Åkerblom <sa224ny@student.lnu.se>
 * @version 1.0.0
 */

// Imports
import axios from 'axios'
import cheerio from 'cheerio'
import qs from 'qs'
import calendarScraper from './calendar-scraper.js'
import linkScraper from './link-scraper.js'
import cinemaScraper from './cinema-scraper.js'
import { returnCorrectDay, findMovieName, checkDinnerTime } from './minor-functions.js'

// Variable declaration
let availableDays = []
const dinnerTimes = []
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
          const movies = moviesResult
          const goodDinnerTimes = movies.map(movie => {
            const dinnerTime = {
              movie: movie.movie,
              movieStart: movie.time,
              day: returnCorrectDay(movie.day),
              timeForDinner: Number(movie.time.substring(0, 2)) + 2 + ':00'
            }
            return dinnerTime
          })
          // Using qs to create an encoded string to be sent with the post request.
          const creds = qs.stringify({
            username: 'zeke',
            password: 'coys',
            submit: 'login'
          })
          // Creating the config for the post request.
          const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            redirect: 'manual',
            maxRedirects: 0,
            url: link + 'login',
            /**
             * Response validation to prevent rejection at 302 status.
             *
             * @param {number} status As the statuscode.
             * @returns {boolean} true if the status code is 302 or ok.
             */
            validateStatus: (status) => {
              return (status >= 200 && status < 300) || status === 302
            }
          }

          axios.post(link + 'login', creds, options).then(response => {
            if (response.status === 302) {
              console.log('Scraping possible reservations...OK')
              axios.get(link + response.headers.location, {
                headers: {
                  Cookie: response.headers['set-cookie'].toString()
                },
                maxRedirects: 0
              }).then(resp => {
                const dinnerBooking = cheerio.load(resp.data)
                dinnerBooking('input').each((index, item) => {
                  if (dinnerBooking(item).attr('value').length < 8) {
                    dinnerTimes.push(dinnerBooking(item).attr('value'))
                  }
                })
                return dinnerTimes
              }).then(dinnerTimes => {
                const orderedDinnerTimes = []
                dinnerTimes.forEach(dinnerTime => {
                  const dinnerObject = {
                    dinnerDay: dinnerTime.substring(0, 3),
                    dinnerStart: dinnerTime.substring(3, 5) + ':00',
                    dinnerEnd: dinnerTime.substring(5, 7) + ':00'
                  }
                  orderedDinnerTimes.push(dinnerObject)
                })
                return orderedDinnerTimes
              }).then(dinnerTimes => {
                const resultArr = []
                goodDinnerTimes.forEach(times => {
                  const result = {
                    dayToGoOut: availableDays.join(' or '),
                    movieToBook: findMovieName(times.movie, amountOfMovies),
                    movieStart: times.movieStart,
                    dinnerDayAvailable: times.day,
                    dinnerTimeAvailable: checkDinnerTime(times.day, times.timeForDinner, dinnerTimes)
                  }
                  if (result.dinnerTimeAvailable.length > 0) {
                    resultArr.push(result)
                  }
                })
                let firstLog = true
                resultArr.forEach(result => {
                  if (firstLog) {
                    console.log('\nSuggestions\n============')
                  }
                  console.log(`\n* On ${result.dinnerDayAvailable}, "${result.movieToBook}" begins at ${result.movieStart}, and there is a free table to book between ${result.dinnerTimeAvailable}.`)
                  firstLog = false
                })
              })
            }
          }).catch(err => {
            console.error('Ops! Something went wrong while scraping the dinner reservations...' + err.message)
          })
        }, 1600)
      }
    })
  })
}

export default mainScraper
