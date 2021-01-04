// Imports
import axios from 'axios'
import cheerio from 'cheerio'

// Variable declaration
const mainLinks = []

/**
 * Takes the url path and returns the scraped links.
 *
 * @param {string} path as the URL to be scraped.
 * @returns {string[]} as the links scraped.
 */
export default async function linkScraper (path) {
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
