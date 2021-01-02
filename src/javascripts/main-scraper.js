import axios from 'axios'
import cheerio from 'cheerio'
import qs from 'qs'

const fullUsers = []
let userObj = {}
let availableDays = []
const movies = []
let moviesResult = []
const mainLinks = []
const calendarLinks = []
const dinnerTimes = []

function mainScraper (path) {
  axios.get(path).then(response => {
    const $ = cheerio.load(response.data)
    $('a').each((index, item) => {
      mainLinks.push($(item).attr('href'))
    })
    return mainLinks
  }).then(mainLinks => {
    mainLinks.forEach(link => {
      // If link contains calendar path
      if (link.includes('calendar')) {
        axios.get(link).then(response => {
          const $ = cheerio.load(response.data)
          $('a').each((index, item) => {
            calendarLinks.push($(item).attr('href').substring(2))
          })
          return calendarLinks
        }).then(calendarLinks => {
          for (const link of calendarLinks) {
            axios.get(mainLinks[0] + link).then(response => {
              const $ = cheerio.load(response.data)
              const weekDays = []
              $('tbody > tr > td').each((index, item) => {
                weekDays.push($(item).text().toUpperCase())
              })
              userObj = {
                name: $('h2').text(),
                calendarUrl: mainLinks[0] + link,
                availableDays: {
                  friday: weekDays[0].includes('OK'),
                  saturday: weekDays[1].includes('OK'),
                  sunday: weekDays[2].includes('OK')
                }
              }
              fullUsers.push(userObj)
              return fullUsers
            }).then(fullUsers => {
              if (fullUsers.length > 2) {
                availableDays = findAvailableDay(fullUsers)
                if (availableDays.length > 0) {
                  console.log('Calendar scraped...OK')
                  console.log('Available day(s): ' + availableDays.join(', '))
                  return availableDays
                } else {
                  throw new Error('Something went wrong when scraping the calendar...')
                }
              }
            })
          }
        })
      }
      // If url contains cinema
      if (link.includes('cinema')) {
        let numberOfMovies = 0
        axios.get(link).then(response => {
          const amountOfMovies = []
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
        }).then((numberOfMovies) => {
          setTimeout(() => {
            availableDays.forEach(day => {
              if (day === 'friday') {
                for (let i = 0; i < numberOfMovies; i++) {
                  axios.get(`${link}/check?day=05&movie=0${i + 1}`)
                    .then(response => {
                      movies.push(response.data)
                    })
                }
              }
              if (day === 'saturday') {
                for (let i = 0; i < numberOfMovies; i++) {
                  axios.get(`${link}/check?day=06&movie=0${i + 1}`)
                    .then(response => {
                      movies.push(response.data)
                    })
                }
              }
              if (day === 'sunday') {
                for (let i = 0; i < numberOfMovies; i++) {
                  axios.get(`${link}/check?day=07&movie=0${i + 1}`)
                    .then(response => {
                      movies.push(response.data)
                    })
                }
              }
            })
            setTimeout(() => {
              const availableMovies = []
              const orderedMovies = []
              for (let i = 0; i < movies.length; i++) {
                if (movies[i][0].status === 1) {
                  availableMovies.push(movies[i][0])
                }
                if (movies[i][1].status === 1) {
                  availableMovies.push(movies[i][1])
                }
                if (movies[i][2].status === 1) {
                  availableMovies.push(movies[i][2])
                }
                availableMovies.forEach(array => {
                  orderedMovies.push(array)
                })
              }
              orderedMovies.sort((a, b) => a.movie - b.movie)
              moviesResult = orderedMovies
              moviesResult = moviesResult.filter((a, b) => moviesResult.indexOf(a) === b)
              if (moviesResult.length > 1) {
                console.log('Movies scraped...OK')
                console.log(moviesResult)
              } else {
                throw new Error('Something went wrong when scraping the movies...')
              }
            }, 300)
          }, 400)
        })
      }
      if (link.includes('dinner')) {
        setTimeout(() => {
          const movies = moviesResult
          console.table(movies)
          const goodDinnerTimes = movies.map(movie => {
            const dinnerTime = {
              movie: movie.movie,
              movieStart: movie.time,
              day: returnCorrectDay(movie.day),
              timeForDinner: Number(movie.time.substring(0, 2)) + 2 + ':00'
            }
            return dinnerTime
          })
          console.table(goodDinnerTimes)
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
              console.log('Managing cookies...OK')
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
                console.table(dinnerTimes)
              })
            }
          }).catch(err => {
            console.error(err.response.status)
          })
        }, 1000)
      }
    })
  })
}

/**
 * @param fullUsers
 */
function findAvailableDay (fullUsers) {
  const availableDays = []
  const result = []
  fullUsers.forEach(user => {
    if (user.availableDays.friday) {
      availableDays.push('friday')
    }
    if (user.availableDays.saturday) {
      availableDays.push('saturday')
    }
    if (user.availableDays.sunday) {
      availableDays.push('sunday')
    }
  })
  if (getCount(availableDays, 'friday') === 3) {
    result.push('friday')
  }
  if (getCount(availableDays, 'saturday') === 3) {
    result.push('saturday')
  }
  if (getCount(availableDays, 'sunday') === 3) {
    result.push('sunday')
  }
  return result
}

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
 * @param array
 * @param value
 */
function getCount (array, value) {
  return array.filter(x => x === value).length
}

export default mainScraper
