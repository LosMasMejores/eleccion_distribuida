/**
 * Created by Javier&Emilio on 30/04/2016.
 */

/*jslint node: true */

var express = require('express');
var router = express.Router();

// Las peticiones a la raiz las enrutamos a /gestor
router.get('/', (req, res) => {
  'use strict';
  res.redirect('/gestor');
});

module.exports = router;
