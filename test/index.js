var chai = require('chai')
global.should = chai.should()
global.sinon = require('sinon')
global.expect = chai.expect
var sinonChai = require('sinon-chai')
chai.use(sinonChai)
