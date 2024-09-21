import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("Event Manager", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  //   locally defined NFT for testing
  async function deployNFT() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();
    // token we are using to test
    const NFTContract = await hre.ethers.getContractFactory("DevfestLagos");
    const nft = await NFTContract.deploy();

    return { nft };
  }

  async function deployEventManager() {
    // Contracts are deployed using the first signer/account by default
    const [owner, signer1, signer2, signer3, signer4] =
      await hre.ethers.getSigners();

    const { nft } = await loadFixture(deployNFT);

    let tokenId = 1;
    const uri = "QmVjzE6hKKgxHX4wiVX94LqCzXT74UkUzzPtCaYjos45qK";

    await nft.safeMint(signer1.address, tokenId, uri);

    tokenId += 1;

    await nft.safeMint(signer2.address, tokenId, uri);

    const EventManagerContract = await hre.ethers.getContractFactory(
      "EventManager"
    );
    const eventManagerContract = await EventManagerContract.deploy();

    // for mainnet-fork testing

    // Ethereum Mainnet
    // bored Ape NFT -> 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D
    // bored Ape holder and has ETH -> 0x66664cbab1d5cF6b0C85DbCC71829812E27F7F4c

    // lisk Mainnet
    // Lisk Of Life NFT -> 0xE5cd701Bf32274F4469A599373115740a8613A6C
    // Lisk of Life holder and has ETH -> 0xFfeCed4c5374f7c8D31a63EF101Ea2586d25D0f4

    const mainnetNftAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
    const mainnetNftContract = await ethers.getContractAt(
      "IERC721",
      mainnetNftAddress
    );

    const NFT_HOLDER = "0x66664cbab1d5cF6b0C85DbCC71829812E27F7F4c";
    await helpers.impersonateAccount(NFT_HOLDER);



    const impersonatedSigner = await ethers.getSigner(NFT_HOLDER);

    return {
      eventManagerContract,
      owner,
      signer1,
      signer2,
      signer3,
      signer4,
      nft,
      mainnetNftContract,
      mainnetNftAddress,
      impersonatedSigner,
    };
  }

  describe("Deployment", function () {
    it("Contract should deploy successfully", async function () {
      const { eventManagerContract, nft } = await loadFixture(
        deployEventManager
      );

      expect(await eventManagerContract.eventCount()).to.equal(0);
      expect(await eventManagerContract.usersCount()).to.equal(0);
    });

    // strictly for local testing because in testing,
    // I minted 1NFT to signer1 and signer2
    it("Should mint NFT to signer1 and signer2", async function () {
      const { eventManagerContract, nft, owner, signer1, signer2, signer3 } =
        await loadFixture(deployEventManager);

      expect(await nft.balanceOf(signer1)).to.equal(1);
      expect(await nft.balanceOf(signer2)).to.equal(1);
      expect(await nft.balanceOf(signer3)).to.equal(0);
    });
  });

  describe("Create Event", function () {
    it("Should revert if NFT Address is zero address", async function () {
      const { eventManagerContract, nft } = await loadFixture(
        deployEventManager
      );
      const eventName = "Devfest Lagos 2024";
      // ask Cas
      //   await eventManagerContract["createEvent(address,string,uint8)"]
      // expect(await eventManager.createEvent).to.equal(0);
      await expect(
        eventManagerContract["createEvent(address,string,uint8)"](
          ethers.ZeroAddress,
          eventName,
          0
        )
      ).to.be.revertedWithCustomError(
        eventManagerContract,
        "ZeroAddressNotAllowed"
      );
    });

    it("Should create an Event successfully", async function () {
      const { eventManagerContract, owner, nft } = await loadFixture(
        deployEventManager
      );
      const eventName = "Devfest Lagos 2024";

      // ask Cas
      //   await eventManagerContract["createEvent(address,string,uint8)"]
      // expect(await eventManager.createEvent).to.equal(0);

      await expect(
        eventManagerContract["createEvent(address,string,uint8)"](
          nft,
          eventName,
          0
        )
      )
        .to.emit(eventManagerContract, "EventCreatedSuccessfully")
        .withArgs(eventName, owner.address, nft);

      expect(await eventManagerContract.eventCount()).to.equal(1);
    });
    it("Should set Creator of an Event as Manager", async function () {
      const { eventManagerContract, owner, nft } = await loadFixture(
        deployEventManager
      );
      const eventName = "Devfest Lagos 2024";

      // ask Cas
      //   await eventManagerContract["createEvent(address,string,uint8)"]
      // expect(await eventManager.createEvent).to.equal(0);
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );

      expect(await eventManagerContract.eventCount()).to.equal(1);

      expect((await eventManagerContract.eventObjects(1)).manager).equal(
        owner.address
      );
    });
    it("Should set the maximum Registrations of an Event automatically", async function () {
      const { eventManagerContract, owner, nft } = await loadFixture(
        deployEventManager
      );
      const eventName = "Devfest Lagos 2024";

      // ask Cas
      //   await eventManagerContract["createEvent(address,string,uint8)"]
      // expect(await eventManager.createEvent).to.equal(0);
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );

      expect(await eventManagerContract.eventCount()).to.equal(1);

      expect(
        (await eventManagerContract.eventObjects(1)).maxNumberOfRegistrations
      ).greaterThan(1000000000000);
    });
    it("Should create multiple Events successfully", async function () {
      const { eventManagerContract, owner, nft } = await loadFixture(
        deployEventManager
      );
      const eventName1 = "Devfest Lagos 2024";
      const eventName2 = "Oscafest Lagos 2024";
      // event 1
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName1,
        0
      );

      // create event2
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName2,
        1
      );

      expect(await eventManagerContract.eventCount()).to.equal(2);
    });
  });
  describe("Create Event with Max registrations", function () {
    it("Should set the maximum Registrations of an Event based on manager input", async function () {
      const { eventManagerContract, owner, nft } = await loadFixture(
        deployEventManager
      );
      const eventName = "Devfest Lagos 2024";

      const maxRegistrations = 1000;

      await expect(
        eventManagerContract["createEvent(address,string,uint8,uint256)"](
          nft,
          eventName,
          0,
          maxRegistrations
        )
      )
        .to.emit(eventManagerContract, "EventCreatedSuccessfully")
        .withArgs(eventName, owner.address, nft);

      // check
      expect(
        (await eventManagerContract.eventObjects(1)).maxNumberOfRegistrations
      ).equal(maxRegistrations);
    });
  });

  // do mainnet forking test _ >  NFT
  //  NFT is already deployed by another person
  describe("Manager Creates Event requiring Bored Apes NFT ", function () {
    it("Should revert if User without the NFT tries to register", async function () {
      const {
        eventManagerContract,
        mainnetNftAddress,
        impersonatedSigner,
        owner,
      } = await loadFixture(deployEventManager);
      const eventName = "Devfest Lagos 2024";
      let eventId = 1;
      await eventManagerContract["createEvent(address,string,uint8)"](
        mainnetNftAddress,
        eventName,
        0
      );

      let userName = "Jude";

      await expect(
        eventManagerContract.registerForEvent(1, userName)
      ).to.be.revertedWithCustomError(
        eventManagerContract,
        "DoesNotHaveEventNFT"
      );
    });

    it("Should register a User for an Event successfully if NFT is present", async function () {
      const {
        eventManagerContract,
        mainnetNftAddress,
        impersonatedSigner,
        signer1,
      } = await loadFixture(deployEventManager);

      const eventName = "Devfest Lagos 2024";

      let eventId = 1;

      await eventManagerContract["createEvent(address,string,uint8)"](
        mainnetNftAddress,
        eventName,
        0
      );

      let userName = "Jude";
      
      await expect(
        eventManagerContract
          .connect(impersonatedSigner)
          .registerForEvent(eventId, userName)
      )
        .to.emit(eventManagerContract, "EventRegistrationSuccessful")
        .withArgs(eventId, impersonatedSigner.address, eventName);
    });
  });

  describe("Event Registration", function () {
    it("Should revert if User does not have NFT ", async function () {
      const { eventManagerContract, nft, signer1, signer2, signer3 } =
        await loadFixture(deployEventManager);
      //   create an event
      const eventName = "Devfest Lagos 2024";
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );
      

      // register a user
      const userName = "Pawpaw";
      const userWithoutNFT = signer3;
      const eventId = 1;

      await expect(
        eventManagerContract
          .connect(userWithoutNFT)
          .registerForEvent(eventId, userName)
      ).to.be.revertedWithCustomError(
        eventManagerContract,
        "DoesNotHaveEventNFT"
      );
    });

    it("Should revert if User puts an invalid EventId", async function () {
      const { eventManagerContract, nft, signer1, signer2, signer3 } =
        await loadFixture(deployEventManager);
      //   create an event
      const eventName = "Devfest Lagos 2024";
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );

      // register a user
      const userName = "Casweeny";
      const userWithNFT = signer1;
      const eventId = 5;

      await expect(
        eventManagerContract
          .connect(userWithNFT)
          .registerForEvent(eventId, userName)
      ).to.be.revertedWithCustomError(eventManagerContract, "InvalidEventId");
    });

    it("Should register a User for an Event successfully", async function () {
      const { eventManagerContract, owner, signer1, nft } = await loadFixture(
        deployEventManager
      );
      //   create an event
      const eventName = "Devfest Lagos 2024";
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );

      // register a user
      const userName = "Casweeny";
      const userWithNFT = signer1;
      const eventId = 1;

      await expect(
        eventManagerContract
          .connect(userWithNFT)
          .registerForEvent(eventId, userName)
      )
        .to.emit(eventManagerContract, "EventRegistrationSuccessful")
        .withArgs(eventId, userWithNFT.address, eventName);

      //   user number has increased
      expect(await eventManagerContract.usersCount()).to.equal(1);

      //  we expect the hasRegisteredMap to return true
      expect(
        await eventManagerContract.hasRegisteredForEvent(
          userWithNFT.address,
          eventId
        )
      ).to.equal(true);
    });
  });

  describe("Update Event", function () {
    it("Should revert if event id is invalid", async function () {
      const { eventManagerContract, nft, owner } = await loadFixture(
        deployEventManager
      );
      // create an event
      const eventName = "Devfest Lagos 2023";
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );

      let invalidEventId = 5;

      const newEventName = "Devfest Lagos 2024";

      await expect(
        eventManagerContract["updateEvent(uint256,address,string,uint8)"](
          invalidEventId,
          nft,
          newEventName,
          1
        )
      ).to.be.revertedWithCustomError(eventManagerContract, "InvalidEventId");
    });

    it("Should revert if NFT address is zero Address", async function () {
      const { eventManagerContract, nft, owner } = await loadFixture(
        deployEventManager
      );
      // create an event
      const eventName = "Devfest Lagos 2023";
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );

      let eventId = 1;

      const newEventName = "Devfest Lagos 2024";

      await expect(
        eventManagerContract["updateEvent(uint256,address,string,uint8)"](
          eventId,
          ethers.ZeroAddress,
          newEventName,
          1
        )
      ).to.be.revertedWithCustomError(
        eventManagerContract,
        "ZeroAddressNotAllowed"
      );
    });

    it("Should update an event successfully", async function () {
      const { eventManagerContract, nft, owner } = await loadFixture(
        deployEventManager
      );
      // create an event
      const eventName = "Devfest Lagos 2023";
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );

      let eventId = 1;

      const newEventName = "Devfest Lagos 2024";

      await expect(
        eventManagerContract["updateEvent(uint256,address,string,uint8)"](
          eventId,
          nft,
          newEventName,
          1
        )
      )
        .to.emit(eventManagerContract, "EventUpdatedSuccessfully")
        .withArgs(newEventName, owner.address, nft);

      expect(
        (await eventManagerContract.eventObjects(eventId)).eventName
      ).to.equal(newEventName);
    });
    it("Should update an event with maximum Registrations successfully", async function () {
      const { eventManagerContract, nft, owner } = await loadFixture(
        deployEventManager
      );
      // create an event
      const eventName = "Devfest Lagos 2023";
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );

      let eventId = 1;

      const newEventName = "Devfest Lagos 2024";
      const maxRegistrations = 1000;

      await expect(
        eventManagerContract[
          "updateEvent(uint256,address,string,uint8,uint256)"
        ](eventId, nft, newEventName, 1, maxRegistrations)
      )
        .to.emit(eventManagerContract, "EventUpdatedSuccessfully")
        .withArgs(newEventName, owner.address, nft);

      expect(
        (await eventManagerContract.eventObjects(eventId)).eventName
      ).to.equal(newEventName);

      expect(
        (await eventManagerContract.eventObjects(eventId))
          .maxNumberOfRegistrations
      ).to.equal(maxRegistrations);
    });
  });
  describe("End Event", function () {
    it("Should revert if event id is invalid", async function () {
      const { eventManagerContract, nft, owner, signer1 } = await loadFixture(
        deployEventManager
      );

      let invalidEventId = 5;

      const newEventName = "Devfest Lagos 2024";

      await expect(
        eventManagerContract.endEvent(invalidEventId)
      ).to.be.revertedWithCustomError(eventManagerContract, "InvalidEventId");
    });
    it("Should revert  if called by non-manager", async function () {
      const { eventManagerContract, nft, owner, signer1 } = await loadFixture(
        deployEventManager
      );

      // create an event
      const eventName = "Devfest Lagos 2023";
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );

      let eventId = 1;

      await expect(
        eventManagerContract.connect(signer1).endEvent(eventId)
      ).to.be.revertedWithCustomError(eventManagerContract, "NotAManager");
    });
    it("Should revert  if user tries to register or signin for a closed event", async function () {
      const { eventManagerContract, nft, owner, signer1 } = await loadFixture(
        deployEventManager
      );

      // create an event
      const eventName = "Devfest Lagos 2023";
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );

      let eventId = 1;
      let userName = "Jude";
      await eventManagerContract.endEvent(eventId);

      await expect(
        eventManagerContract
          .connect(signer1)
          .registerForEvent(eventId, userName)
      ).to.be.revertedWithCustomError(
        eventManagerContract,
        "EventEndedAlready"
      );
    });
    it("Should end event successfully", async function () {
      const { eventManagerContract, nft, owner, signer1 } = await loadFixture(
        deployEventManager
      );

      // create an event
      const eventName = "Devfest Lagos 2023";
      await eventManagerContract["createEvent(address,string,uint8)"](
        nft,
        eventName,
        0
      );

      let eventId = 1;

      await expect(await eventManagerContract.endEvent(eventId))
        .to.emit(eventManagerContract, "EventEndedSuccessfully")
        .withArgs(eventName, owner.address, eventId);
    });
  });
});
