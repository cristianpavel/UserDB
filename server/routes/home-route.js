var express = require("express");
router = express.Router();
controller = require('../controllers/home-controller.js');


router.post('/', controller.modifySession);

module.exports = router;





