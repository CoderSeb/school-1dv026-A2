import axios from 'axios'
import cheerio from 'cheerio'


const url1 = 'https://cscloud6-127.lnu.se/scraper-site-1'
const url2 = 'https://cscloud6-127.lnu.se/scraper-site-2'

const startScraping = async () => {
  const response = await axios.get(url1)
  return cheerio.load(response.data)
}

const scrapedData = await startScraping()
const links = scrapedData('a').text()

console.log(links)