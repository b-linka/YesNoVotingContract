import { expect } from "chai";
import { ethers } from "hardhat";
import { YesNoVoting } from "../typechain-types";

describe("Смарт-контракт YesNoVoting", function () {
  async function deployYesNoVoting() {
    const [owner, voter] = await ethers.getSigners();
    const yesNoVotingFactory = await ethers.getContractFactory("YesNoVoting");
    const yesNoVoting = (await yesNoVotingFactory.deploy()) as YesNoVoting;
    await yesNoVoting.waitForDeployment();

    return { owner, voter, yesNoVoting };
  }

  it("увеличивает количество голосов «За» после vote(true)", async function () {
    const { yesNoVoting } = await deployYesNoVoting();

    await yesNoVoting.vote(true);

    const [yesVotes, noVotes] = await yesNoVoting.getResults();
    expect(yesVotes).to.equal(1);
    expect(noVotes).to.equal(0);
  });

  it("вызывает событие Voted при успешном голосовании", async function () {
    const { owner, yesNoVoting } = await deployYesNoVoting();

    await expect(yesNoVoting.vote(true)).to.emit(yesNoVoting, "Voted").withArgs(owner.address, true);
  });

  it("запрещает повторное голосование с одного адреса", async function () {
    const { voter, yesNoVoting } = await deployYesNoVoting();

    await yesNoVoting.connect(voter).vote(false);

    await expect(yesNoVoting.connect(voter).vote(true)).to.be.revertedWith("You have already voted");
  });
});
