// eslint-disable-next-line no-undef
var MedicalDataTransfer = artifacts.require('./MedicalDataTransfer.sol');
module.exports = function(deployer) {
  deployer.deploy(MedicalDataTransfer);
};