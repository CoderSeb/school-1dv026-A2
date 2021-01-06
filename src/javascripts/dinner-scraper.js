/**
 * The dinner scraper module.
 *
 * @author Sebastian Åkerblom <sa224ny@student.lnu.se>
 * @version 1.0.0
 */

// Imports
import qs from 'qs'
import axios from 'axios'
import cheerio from 'cheerio'
import { returnCorrectDay, checkDinnerTime, findMovieName } from './minor-functions.js'

/**
 * Takes in restaurant url, movies and available day(s) and
 * then scrapes for available dinner tables and logs out the result.
 *
 * @param {string} link as the url to be scraped.
 * @param {object[]} moviesResult as the movies available.
 * @param {string[]} availableDays as the day(s) available.
 * @param {object[]} amountOfMovies as movie numbers and names.
 */
export default async function dinnerScraper (link, moviesResult, availableDays, amountOfMovies) {
  const dinnerTimes = []
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
}
