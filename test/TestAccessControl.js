const FarmerRole = artifacts.require('FarmerRole')
const ConsumerRole = artifacts.require('ConsumerRole')
const truffleAssert = require('truffle-assertions');

var accounts;
var owner;
var newFarmer1;
var newFarmer2;
var notAFarmerAccount;

contract('FarmerRole', (accs) => {
    accounts = accs;
    owner = accounts[0];
    newFarmer1 = accounts[1];
    newFarmer2 = accounts[2];
    notAFarmerAccount = accounts[9];
    console.log("FarmerRole Contract Owner: accounts[0] ", accounts[0])
});

describe('adding farmers', () => {
  var instance;
  beforeEach(async () => {
    instance = await FarmerRole.deployed();
  });
  it('the contract owner is a farmer', async () => {
    let isFarmer = await instance.isFarmer(owner)
    expect(isFarmer).equal(true)
  })
  it('a new farmer is not yet a farmer in the contract', async () => {
    let isFarmer = await instance.isFarmer(newFarmer1)
    expect(isFarmer).equal(false)
  })
  it('adding a farmer includes the new farmer in the contract and emits the FarmerAdded event', async () => {
    let tx = await instance.addFarmer(newFarmer1);
    let isFarmer = await instance.isFarmer(newFarmer1)
    expect(isFarmer).equal(true)
    truffleAssert.eventEmitted(tx, 'FarmerAdded', (e) => {
      return e.account === newFarmer1;
    });
  })
  it('only a farmer can add a new farmer to the contrat', async () => {
    await truffleAssert.reverts(
      instance.addFarmer(newFarmer2, {from: notAFarmerAccount}),
      "You must be a farmer to perform this transaction"
    )
  })
  it('not possible to add a account to the role more than once', async () => {
    await truffleAssert.reverts(
      instance.addFarmer(newFarmer1),
      "Account already belongs to this role"
    )
  })
})

describe('removing farmers', () => {
  var instance;
  beforeEach(async () => {
    instance = await FarmerRole.deployed();
  });
  it('rencouncing a farmer removes them from the contract and emits the FarmerRemoved event', async () => {
    let tx = await instance.renounceFarmer({from: newFarmer1});
    let isFarmer = await instance.isFarmer(newFarmer1);
    expect(isFarmer).equal(false)
    truffleAssert.eventEmitted(tx, 'FarmerRemoved', (e) => {
      return e.account === newFarmer1;
    });
  })
})