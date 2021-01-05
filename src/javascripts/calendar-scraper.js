// Imports
import axios from 'axios'
import cheerio from 'cheerio'
import { findAvailableDay } from './minor-functions.js'

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
