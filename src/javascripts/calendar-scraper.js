// Imports
import axios from 'axios'
import cheerio from 'cheerio'

// Variable declaration
let availableDays = []
const fullUsers = []

/**
 * Scraping the calendar urls to find the available days.
 *
 * @param {string} link as the calendar url.
 * @param {string[]} mainLinks as the array of urls.
 * @returns {string[]} as the available days.
 */
export default async function calendarScraper (link, mainLinks) {
  const firstScrape = await axios.get(link).then(response => {
    const calendarLinks = []
    const $ = cheerio.load(response.data)
    $('a').each((index, item) => {
      calendarLinks.push($(item).attr('href').substring(2))
    })
    return calendarLinks
  }).catch(err => {
    console.error('Ops! Something went wrong when scraping the calendar...' + err.message)
  })
  let result = null
  for (const link of firstScrape) {
    result = await axios.get(mainLinks[0] + link).then(response => {
      let userObj = {}
      const weekDays = []
      const $ = cheerio.load(response.data)
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
      return availableDays
    })
  }
  console.log('Scraping available days...OK')
  return result
}

/**
 * Takes in an array of objects and returns an array of available days.
 *
 * @param {object[]} fullUsers as the array of objects.
 * @returns {string[]} as the array of available days.
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
 * Takes in an array and a value and returns the
 * number of occurences of that value in the array.
 *
 * @param {string[]} array as the array.
 * @param {string} value as the value.
 * @returns {number} as the number of occurences.
 */
function getCount (array, value) {
  return array.filter(x => x === value).length
}
