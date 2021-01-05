// Imports
import axios from 'axios'
import cheerio from 'cheerio'
import qs from 'qs'
import calendarScraper from './calendar-scraper.js'
import linkScraper from './link-scraper.js'
import cinemaScraper from './cinema-scraper.js'

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
          const creds = qs.stringify({
            username: 'zeke',
            password: 'coys',
            submit: 'login'
          })
          const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: creds,
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

/**
 * Takes a string with a number and returns the correspondent weekday.
 *
 * @param {string} movieDay as the string to be converted to a weekday.
 * @returns {string} as the weekday.
 */
function returnCorrectDay (movieDay) {
  let day = ''
  switch (movieDay) {
    case '06':
      day = 'Saturday'
      break
    case '07':
      day = 'Sunday'
      break
    default:
      day = 'Friday'
  }
  return day
}

/**
 * Takes in a number and an array of movies and returns
 * the name of the movie with the input number.
 *
 * @param {number} movieNumber as the movie number.
 * @param {object[]} movieArray as the array of movies.
 * @returns {string} as the movie name.
 */
function findMovieName (movieNumber, movieArray) {
  let result = ''
  movieArray.forEach(movie => {
    if (movie.movieNumber === movieNumber) {
      result = movie.movieName
    }
  })
  return result
}

/**
 * Takes in day and time and an array of dinner times
 * and returns the dinner time, start to end if available.
 *
 * @param {string} day as the day.
 * @param {string} time as the time.
 * @param {object[]} dinnerTimesArray as the array with available dinner times.
 * @returns {string} as the available dinner time start and end.
 */
function checkDinnerTime (day, time, dinnerTimesArray) {
  let result = ''
  const funcDay = day.substring(0, 3).toLowerCase()
  dinnerTimesArray.forEach(dinnerTime => {
    if (funcDay === dinnerTime.dinnerDay && time === dinnerTime.dinnerStart) {
      result = `${dinnerTime.dinnerStart}-${dinnerTime.dinnerEnd}`
    }
  })
  return result
}

export default mainScraper
