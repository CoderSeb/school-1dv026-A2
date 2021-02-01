/**
 * The calendar scraper module.
 *
 * @author Sebastian Åkerblom <sa224ny@student.lnu.se>
 * @version 1.0.0
 */

// Imports
import axios from 'axios'
import cheerio from 'cheerio'
import { findAvailableDay } from './minor-functions.js'

/**
 * Scraping the calendar urls to find the available days.
 *
 * @param {string} calendarUrl as the calendar url.
 * @returns {string[]} as the available days.
 */
export default async function calendarScraper (calendarUrl) {
  let availableDays = []
  const fullUsers = []
  // Get individual urls.
  const firstScrape = await axios.get(calendarUrl).then(response => {
    const calendarLinks = []
    const $ = cheerio.load(response.data)
    $('a').each((index, item) => {
      calendarLinks.push($(item).attr('href').substring(2))
    })
    return calendarLinks
  }).catch(err => {
    console.error('Ops! Something went wrong when scraping the calendar...' + err.message)
  })
  // Get individual calendars.
  for (let i = 0; i < firstScrape.length; i++) {
    const url = calendarUrl + firstScrape[i]
    const days = await axios.get(url)
    let userObj = {}
    const weekDays = []
    const $ = cheerio.load(days.data)
    $('tbody > tr > td').each((index, item) => {
      weekDays.push($(item).text().toUpperCase())
    })
    userObj = {
      name: $('h2').text(),
      calendarUrl: url,
      availableDays: {
        friday: weekDays[0].includes('OK'),
        saturday: weekDays[1].includes('OK'),
        sunday: weekDays[2].includes('OK')
      }
    }
    fullUsers.push(userObj)
  }
  availableDays = await findAvailableDay(fullUsers)
  console.log('Scraping available days...OK')
  return availableDays
}
