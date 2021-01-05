/**
 * The cinema scraper module.
 *
 * @author Sebastian Åkerblom <sa224ny@student.lnu.se>
 * @version 1.0.0
 */

// Imports
import axios from 'axios'

// Variable declaration
const availableMovies = []
const orderedMovies = []

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
  let moviesResult = null
  const movies = []
  availableDays.forEach(day => {
    if (day === 'friday') {
      for (let i = 0; i < numberOfMovies; i++) {
        axios.get(`${link}/check?day=05&movie=0${i + 1}`)
          .then(response => {
            movies.push(response.data)
          })
      }
    }
    if (day === 'saturday') {
      for (let i = 0; i < numberOfMovies; i++) {
        axios.get(`${link}/check?day=06&movie=0${i + 1}`)
          .then(response => {
            movies.push(response.data)
          })
      }
    }
    if (day === 'sunday') {
      for (let i = 0; i < numberOfMovies; i++) {
        axios.get(`${link}/check?day=07&movie=0${i + 1}`)
          .then(response => {
            movies.push(response.data)
          })
      }
    }
  })

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      for (let i = 0; i < movies.length; i++) {
        if (movies[i][0].status === 1) {
          availableMovies.push(movies[i][0])
        }
        if (movies[i][1].status === 1) {
          availableMovies.push(movies[i][1])
        }
        if (movies[i][2].status === 1) {
          availableMovies.push(movies[i][2])
        }
        availableMovies.forEach(array => {
          orderedMovies.push(array)
        })
      }
      orderedMovies.sort((a, b) => a.movie - b.movie)
      moviesResult = orderedMovies
      moviesResult = moviesResult.filter((a, b) => moviesResult.indexOf(a) === b)
      console.log('Scraping showtimes...OK')
      resolve(moviesResult)
    }, 600)
  })
}
