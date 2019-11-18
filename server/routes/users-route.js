var express = require("express");
router = express.Router();
controller = require('../controllers/users-controller.js');


router.post('/', controller.getAllUsers);
router.post('/active', controller.getActiveUsers);
router.post('/inactive', controller.getInactiveUsers);
router.post('/user', controller.getSpecificUser);
router.post('/productive', controller.getProductiveUsers);

module.exports = router;





