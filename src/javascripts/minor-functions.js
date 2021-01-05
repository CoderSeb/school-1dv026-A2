/**
 * Minor functions script file.
 *
 * @author Sebastian Åkerblom <sa224ny@student.lnu.se>
 * @version 1.0.0
 */

/**
 * Takes a string with a number and returns the correspondent weekday.
 *
 * @param {string} movieDay as the string to be converted to a weekday.
 * @returns {string} as the weekday.
 */
export function returnCorrectDay (movieDay) {
  let day = ''
  switch (movieDay) {
    case '06':
      day = 'Saturday'
      break
    case '07':
      day = 'Sunday'
      break
    default:
      day = 'Friday'
  }
  return day
}

/**
 * Takes in a number and an array of movies and returns
 * the name of the movie with the input number.
 *
 * @param {number} movieNumber as the movie number.
 * @param {object[]} movieArray as the array of movies.
 * @returns {string} as the movie name.
 */
export function findMovieName (movieNumber, movieArray) {
  let result = ''
  movieArray.forEach(movie => {
    if (movie.movieNumber === movieNumber) {
      result = movie.movieName
    }
  })
  return result
}

/**
 * Takes in day and time and an array of dinner times
 * and returns the dinner time, start to end if available.
 *
 * @param {string} day as the day.
 * @param {string} time as the time.
 * @param {object[]} dinnerTimesArray as the array with available dinner times.
 * @returns {string} as the available dinner time start and end.
 */
export function checkDinnerTime (day, time, dinnerTimesArray) {
  let result = ''
  const funcDay = day.substring(0, 3).toLowerCase()
  dinnerTimesArray.forEach(dinnerTime => {
    if (funcDay === dinnerTime.dinnerDay && time === dinnerTime.dinnerStart) {
      result = `${dinnerTime.dinnerStart}-${dinnerTime.dinnerEnd}`
    }
  })
  return result
}

/**
 * Takes in an array and a value and returns the
 * number of occurences of that value in the array.
 *
 * @param {string[]} array as the array.
 * @param {string} value as the value.
 * @returns {number} as the number of occurences.
 */
function getCount (array, value) {
  return array.filter(x => x === value).length
}

/**
 * Takes in an array of objects and returns an array of available days.
 *
 * @param {object[]} fullUsers as the array of objects.
 * @returns {string[]} as the array of available days.
 */
export function findAvailableDay (fullUsers) {
  const availableDays = []
  const result = []
  fullUsers.forEach(user => {
    if (user.availableDays.friday) {
      availableDays.push('friday')
    }
    if (user.availableDays.saturday) {
      availableDays.push('saturday')
    }
    if (user.availableDays.sunday) {
      availableDays.push('sunday')
    }
  })
  if (getCount(availableDays, 'friday') === 3) {
    result.push('friday')
  }
  if (getCount(availableDays, 'saturday') === 3) {
    result.push('saturday')
  }
  if (getCount(availableDays, 'sunday') === 3) {
    result.push('sunday')
  }
  return result
}
