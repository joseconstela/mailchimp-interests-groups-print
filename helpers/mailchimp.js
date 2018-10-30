const Promise = require('promise')
const _ = require('lodash')
const Async = require('async')
const Mailchimp = require('mailchimp-api-v3')

const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY || '')

/**
 * Returns a promise with the list of lists for the authenticated account
 */
const getLists = () => {
  return mailchimp.get(`/lists`, {})
  .then((response) => {
    return _.map(response.lists,(r) => {
      const { id, web_id, name } = r
      return {
        id, web_id, name
      }
    })
  })
}

module.exports.getLists = getLists

/**
 * Given an array of lists, returns a promise with the lists,
 * across their interest categories ids
 * 
 * @param {Array} lists Array of lists
 */
const getCategories = (lists) => {

  // Holds the promise's result
  let result = []

  return new Promise((resolve, reject) => {

    /**
     * Creates a queue to process each list separately
     */
    let queue = Async.queue((list, queueCb) => {
      return mailchimp.get(`/lists/${list.id}/interest-categories`)
        .then((response) => {
          // Attach only the categories IDs
          list.categories = _.map(response.categories, 'id')
          result.push(list)
          queueCb(null)
        })
    }, 1)

    /**
     * When the queue finishes processing all items, return the promise with 
     * the results
     */
    queue.drain = () => { resolve(result); }

    /**
     * Adds all lists to the queue
     */
    queue.push(lists)
  })
}

module.exports.getCategories = getCategories

/**
 * Given an array of lists, returns a promise with the lists,
 * across their interest categories ids and names.
 * 
 * @param {Array} lists Array of lists with categories ids
 */
const getInterests = (lists) => {
  
  // Holds the promise's result
  let result = []

  return new Promise((resolve, reject) => {
    let queue = Async.queue((list, queueCb) => {
      
      /**
       * Don't run any queue if there are no categories to process
       */
      if (!list.categories.length) {
        result.push(list)
        return queueCb();
      }

      let catQueue = Async.queue((cat, catQueueCb) => {
        mailchimp.get(`/lists/${list.id}/interest-categories/${cat}/interests?count=1000`)
          .then((response) => {
            list.categories.map((c, index) => {
              if (c === cat) {
                list.categories[index] = _.map(response.interests, (i) => {
                  return `${i.id} - ${i.name}`
                })
              }
            })
            catQueueCb(null)
          })
      }, 2)

      /**
       * When the queue finishes processing all items, return the promise with 
       * the results
       */
      catQueue.drain = () => {
        result.push(list)
        queueCb()
      }

      /**
       * Adds all lists to the queue
       */
      catQueue.push(list.categories)
    })
    
    /**
     * When the queue finishes processing all items, return the promise with 
     * the results
     */
    queue.drain = () => { resolve(result) }

    /**
     * Adds all lists to the queue
     */
    queue.push(lists)
  })
}

module.exports.getInterests = getInterests
