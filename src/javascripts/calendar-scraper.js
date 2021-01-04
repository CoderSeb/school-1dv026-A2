// Imports
import axios from 'axios'
import cheerio from 'cheerio'

let availableDays = []

export default async function calendarScraper (link, mainLinks) {
  const fullUsers = []
  let userObj = {}

  axios.get(link).then(response => {
    const calendarLinks = []
    const $ = cheerio.load(response.data)
    $('a').each((index, item) => {
      calendarLinks.push($(item).attr('href').substring(2))
    })
    return calendarLinks
  }).then(calendarLinks => {
    console.log('Scraping available days...OK')
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
        availableDays = findAvailableDay(fullUsers)
      })
    }
  }).catch(err => {
    console.error('Ops! Something went wrong while scraping the calendar...' + err.message)
  })
  //Continue here!!!
  console.log(fullUsers)
  return availableDays
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

/**
 * @param array
 * @param value
 */
function getCount (array, value) {
  return array.filter(x => x === value).length
}
