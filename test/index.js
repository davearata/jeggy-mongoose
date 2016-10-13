var chai = require('chai')
global.should = chai.should()
global.sinon = require('sinon')
global.expect = chai.expect
chai.use(require('sinon-chai'))
chai.use(require('chai-as-promised'))
