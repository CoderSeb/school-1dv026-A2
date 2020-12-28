import axios from 'axios'
import cheerio from 'cheerio'

const fullUsers = []
let userObj = {}
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
          console.log(calendarLinks)
          console.log(mainLinks)
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
                if (fullUsers.length === 3) {
                  return fullUsers
                }
              })
          }
        })
      }
    })
  })
}

export default mainScraper
