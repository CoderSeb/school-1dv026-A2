/**
 * The link scraper module.
 *
 * @author Sebastian Åkerblom <sa224ny@student.lnu.se>
 * @version 1.0.0
 */

// Imports
import axios from 'axios'
import cheerio from 'cheerio'

/**
 * Takes the url path and returns the scraped links.
 *
 * @param {string} path as the URL to be scraped.
 * @returns {string[]} as the links scraped.
 */
export default async function linkScraper (path) {
  const mainLinks = []
  const result = await axios.get(path).then(response => {
    console.log('Scraping links...OK')
    const $ = cheerio.load(response.data)
    $('a').each((index, item) => {
      mainLinks.push($(item).attr('href'))
    })
    return mainLinks
  })
  return result
}
