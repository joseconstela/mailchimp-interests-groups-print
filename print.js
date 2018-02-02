'use strict';

const mcHelper = require('./helpers').mailchimp

/**
 * Handler for Lambda's `print` function
 * @param {Object} event Lambda event payload
 * @param {Object} context Lambda context
 * @param {function} callback Lambda callback
 */
const init = (event, context, callback) => {

  return mcHelper.getLists()
    .then((lists) => mcHelper.getCategories(lists))
    .then((lists) => mcHelper.getInterests(lists))
    .then((lists) => {
      console.log( JSON.stringify(lists, " ", 2) );
      callback(null, 'all good');
    })
    .catch((ex) => {
      console.log({ex})
      callback(ex, null)
    })

};

module.exports.init = init