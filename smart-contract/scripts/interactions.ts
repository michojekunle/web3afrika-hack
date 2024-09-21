import { ethers } from "hardhat";

async function main() {
  

//   deployed after testing was finished in local node
  const NFTContractAddress = "0x08548168B83c865659659e0671d7f9e77A124933";
  const NFTGatedContractAddress = "0x6E25aABc04E32B23417FFa52F83e14E95D3FfEee";
  //
  const NFTContract = await ethers.getContractAt(
    "DevfestLagos",
    NFTContractAddress
  );
  const NFTGatedContract = await ethers.getContractAt(
    "EventManager",
    NFTGatedContractAddress
  );

  const [owner, signer1, signer2] = await ethers.getSigners();

  const tokenUri = "QmVjzE6hKKgxHX4wiVX94LqCzXT74UkUzzPtCaYjos45qK";

  const mint1 = await NFTContract.safeMint(signer1.address, 1, tokenUri);
  mint1.wait();

  const mint2 = await NFTContract.safeMint(signer2.address, 2, tokenUri);
  mint2.wait();

  // create
  const eventName = "Devfest Lagos 2024";
  const eventType = 0;

  const createTx = await NFTGatedContract["createEvent(address,string,uint8)"](
    NFTContractAddress,
    eventName,
    eventType
  );
  createTx.wait();
  console.log(createTx);

  console.log("Event count: ",await NFTGatedContract.eventCount());

  let name = "Cas";
  let eventId = 1;
  const registerTx1 = await NFTGatedContract.connect(signer1).registerForEvent(eventId, name);
  registerTx1.wait();
  console.log(registerTx1);

  name = "Jude";
  eventId = 1;
  const registerTx2 = await NFTGatedContract.connect(signer2).registerForEvent(eventId, name);
  registerTx2.wait();
  console.log(registerTx2);

  console.log("Number of Users: ",await NFTGatedContract.usersCount());

  const signInTx = await NFTGatedContract.connect(signer1).signInForEvent(eventId);
  signInTx.wait();
  console.log(signInTx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
