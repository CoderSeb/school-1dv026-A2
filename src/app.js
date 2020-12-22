import axios from 'axios'
import cheerio from 'cheerio'
import mainScraper from './components/main-scraper.js'

const url1 = 'https://cscloud6-127.lnu.se/scraper-site-1'
const url2 = 'https://cscloud6-127.lnu.se/scraper-site-2'

const startScraping = async () => {
  const response = await axios.get(url1)
  return cheerio.load(response.data)
}

const scrapedData = await startScraping()
const links = new Set()
scrapedData('a').each((i, link) => {
  links.add(scrapedData(link).attr('href'))
})

mainScraper(links)