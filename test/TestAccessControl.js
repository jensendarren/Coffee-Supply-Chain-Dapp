const truffleAssert = require('truffle-assertions');

var accounts;
var owner;
var newActor1;
var newActor2;
var externalAccount;

contract('Roles', (accs) => {
    accounts = accs;
    owner = accounts[0];
    newActor1 = accounts[1];
    newActor2 = accounts[2];
    externalAccount = accounts[9];
    console.log("Role Contract Owner: accounts[0] ", accounts[0])
});

// Shared behaviour
shouldBehaveLikeARole = (role) => {
  it('the contract owner is the role instance', async () => {
    let isRole = await this.instance[`is${role}`](owner)
    expect(isRole).equal(true)
  })
  it('a new role is not yet a role in the contract', async () => {
    let isRole = await this.instance[`is${role}`](newActor1)
    expect(isRole).equal(false)
  })
  it('adding a role includes the new role in the contract and emits the RoleAdded event', async () => {
    let tx = await this.instance[`add${role}`](newActor1);
    let isRole = await this.instance[`is${role}`](newActor1)
    expect(isRole).equal(true)
    truffleAssert.eventEmitted(tx, role + 'Added', (e) => {
      return e.account === newActor1;
    });
  })
  it('only a role actor can add a new actor to the contract', async () => {
    await truffleAssert.reverts(
      this.instance[`add${role}`](newActor2, {from: externalAccount}),
      `You must be a ${role.toLowerCase()} to perform this transaction`
    )
  })
  it('should not be possible to add an account to the role more than once', async () => {
    await truffleAssert.reverts(
      this.instance[`add${role}`](newActor1),
      "Account already belongs to this role"
    )
  })
  it('rencouncing an actor removes them from the contract and emits the RoleRemoved event', async () => {
    let tx = await this.instance[`renounce${role}`]({from: newActor1});
    let isRole = await this.instance[`is${role}`](newActor1);
    expect(isRole).equal(false)
    truffleAssert.eventEmitted(tx, `${role}Removed`, (e) => {
      return e.account === newActor1;
    });
  })
}

const FarmerRole = artifacts.require('FarmerRole')
const ConsumerRole = artifacts.require('ConsumerRole')
const DistributorRole = artifacts.require('DistributorRole')
const RetailerRole = artifacts.require('RetailerRole')

// Test each role contract implementation
describe('ConsumerRole', () => {
  beforeEach(async () => {
    this.instance = await ConsumerRole.deployed();
  });
  shouldBehaveLikeARole('Consumer');
})

describe('FarmerRole', () => {
  beforeEach(async () => {
    this.instance = await FarmerRole.deployed();
  });
  shouldBehaveLikeARole('Farmer');
})

describe('DistributorRole', () => {
  beforeEach(async () => {
    this.instance = await DistributorRole.deployed();
  });
  shouldBehaveLikeARole('Distributor');
})

describe('RetailerRole', () => {
  beforeEach(async () => {
    this.instance = await RetailerRole.deployed();
  });
  shouldBehaveLikeARole('Retailer');
})