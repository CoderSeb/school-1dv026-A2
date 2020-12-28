import axios from 'axios'
import cheerio from 'cheerio'

const fullUsers = []
let userObj = {}
let availableDays = []
const mainLinks = []
const calendarLinks = []

/**
 * @param path
 */
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
                  console.log('Available day(s): ' + availableDays.join(', '))
                  return availableDays
                }
              })
          }
        })
      }
      if (link.includes('cinema')) {
        let numberOfMovies = 0
        axios.get(link).then(response => {
          const amountOfMovies = []
          const $ = cheerio.load(response.data)
          $('#movie > option').each((index, item) => {
             amountOfMovies.push($(item).attr('value'))
          })
          numberOfMovies = amountOfMovies.length - 1
          return numberOfMovies
        }).then((numberOfMovies) => {
          setTimeout(() => {
            availableDays.forEach(day => {
              if (day === 'friday') {
                for (let i = 0; i < numberOfMovies; i++) {
                  axios.get(`${link}/check?day=05&movie=0${i + 1}`)
                  .then(response => {
                    console.log(response.data)
                  })
                }
              }
              if (day === 'saturday') {
                for (let i = 0; i < numberOfMovies; i++) {
                  axios.get(`${link}/check?day=06&movie=0${i + 1}`)
                  .then(response => {
                    console.log(response.data)
                  })
                }
              }
              if (day === 'sunday') {
                for (let i = 0; i < numberOfMovies; i++) {
                  axios.get(`${link}/check?day=07&movie=0${i + 1}`)
                  .then(response => {
                    console.log(response.data)
                  })
                }
              }
            })
          }, 500)
          
        })
      }
    })
  })
}


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

function getCount (array, value) {
  let count = 0
  return array.filter(x => x === value).length
}

export default mainScraper
