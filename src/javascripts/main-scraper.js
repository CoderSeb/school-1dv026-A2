import axios from 'axios'
import cheerio from 'cheerio'

/**
 * @param path
 */
const mainScraper = async (path) => {
  const scrapedData = await startScraping(path)
  // Creating a new Set to prevent duplicates.
  const links = new Set()

  let fullPeopleObject = []
  // Going through each a-tag to get the href links and adding them to links set.
  scrapedData('a').each((i, link) => {
    links.add(scrapedData(link).attr('href'))
  })
  // Creating an array from the links set.
  const urls = Array.from(links)
  // Looping through the links.
  urls.forEach(url => {
    if (url.includes('calendar')) {
      const people = []
      /**
       *
       */
      const scrapeCalendar = async () => {
        const scrapedCalendar = await startScraping(url)
        scrapedCalendar('a').each((i, link) => {
          const person = {
            name: scrapedCalendar(link).text().toUpperCase(),
            calendarUrl: `${url}${scrapedCalendar(link).attr('href').substring(2)}`
          }
          people.push(person)
        })
        return people
      }

      fullPeopleObject = scrapeCalendar()
        .then(persons => {
        scrapeDays(persons).then(result => {
          return result
        })
      })

      console.log(fullPeopleObject)
    }
  })
}

/**
 * @param persons
 */
const scrapeDays = async (persons) => {
  const result = []
  for (const person of persons) {
    const scrapedPersonCal = await startScraping(person.calendarUrl)
    const individualWeekends = scrapedPersonCal('tbody > tr > td').text().toUpperCase()
    const friday = individualWeekends.substring(0, 2).includes('OK')
    const saturday = individualWeekends.substring(2, 4).includes('OK')
    const sunday = individualWeekends.substring(4, 6).includes('OK')
    const personObj = {
      name: person.name,
      calUrl: person.calendarUrl,
      availableWeekend: {
        friday: friday,
        saturday: saturday,
        sunday: sunday
      }
    }
    result.push(personObj)
  }
  return result
}

/**
 * Function that takes in a url and returns the data from that url.
 *
 * @param {string} path as the url.
 */
const startScraping = async (path) => {
  const response = await axios.get(path)
  return cheerio.load(response.data)
}

export default mainScraper
