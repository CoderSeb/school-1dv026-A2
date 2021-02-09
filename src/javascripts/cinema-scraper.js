/**
 * The cinema scraper module.
 *
 * @author Sebastian Åkerblom <sa224ny@student.lnu.se>
 * @version 1.0.0
 */

// Imports
import axios from 'axios'

/**
 * Takes in a link, array of days and number of movies and
 * returns an array with the available movies at the cinema.
 *
 * @param {string} link as the cinema link.
 * @param {string[]} availableDays as the available days to look for.
 * @param {number} numberOfMovies as the number of movies.
 * @returns {object[]} as the movies available.
 */
export default async function cinemaScraper (link, availableDays, numberOfMovies) {
  const moviesArray = []
  const availableMovies = []
  const orderedMovies = []

  /**
   * Function that returns each movie information.
   *
   * @param {string} link as the cinema link.
   * @param {string} day as the day.
   * @param {number} index as the movie to look for.
   * @returns {object} with the movie information.
   */
  const checkMovies = async (link, day, index) => {
    const result = await axios.get(`${link}/check?day=${day}&movie=0${index + 1}`)
      .then(response => { return response.data })
    return result
  }

  for (let index = 0; index < availableDays.length; index++) {
    if (availableDays[index] === 'friday') {
      for (let i = 0; i < numberOfMovies; i++) {
        const movie = await checkMovies(link, '05', i)
        moviesArray.push(movie)
      }
    }
    if (availableDays[index] === 'saturday') {
      for (let i = 0; i < numberOfMovies; i++) {
        const movie = await checkMovies(link, '06', i)
        moviesArray.push(movie)
      }
    }
    if (availableDays[index] === 'sunday') {
      for (let i = 0; i < numberOfMovies; i++) {
        const movie = await checkMovies(link, '07', i)
        moviesArray.push(movie)
      }
    }
  }

  for (let i = 0; i < moviesArray.length; i++) {
    if (moviesArray[i][0].status === 1) {
      availableMovies.push(moviesArray[i][0])
    }
    if (moviesArray[i][1].status === 1) {
      availableMovies.push(moviesArray[i][1])
    }
    if (moviesArray[i][2].status === 1) {
      availableMovies.push(moviesArray[i][2])
    }
    availableMovies.forEach(array => {
      orderedMovies.push(array)
    })
  }
  let moviesResult = await orderedMovies.sort((a, b) => a.movie - b.movie)
  moviesResult = moviesResult.filter((a, b) => moviesResult.indexOf(a) === b)
  return new Promise((resolve, reject) => {
    console.log('Scraping showtimes...OK')
    resolve(moviesResult)
  })
}
