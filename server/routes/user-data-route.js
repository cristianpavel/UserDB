var express = require('express')
var router = express.Router()
var controller = require('../controllers/user-data-controller.js')

router.post('/sessions', controller.getSessions)
router.post('/average', controller.getAverage)
router.post('/date-histogram', controller.getDateHistogram)

module.exports = router
