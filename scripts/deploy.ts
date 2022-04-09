import { ethers, network } from "hardhat";
import config from "../config";

const currentNetwork = network.name;

const main = async (withVRFOnTestnet = true) => {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const KiguriLottery = await ethers.getContractFactory("KiguriLottery");

  if (currentNetwork == "testnet") {
    let randomNumberGenerator;

    if (withVRFOnTestnet) {
      console.log("RandomNumberGenerator with VRF is deployed..");
      const RandomNumberGenerator = await ethers.getContractFactory(
        "RandomNumberGenerator"
      );

      randomNumberGenerator = await RandomNumberGenerator.deploy(
        config.VRFCoordinator[currentNetwork],
        config.LinkToken[currentNetwork]
      );
      await randomNumberGenerator.deployed();
      console.log(
        "RandomNumberGenerator deployed to:",
        randomNumberGenerator.address
      );

      // Set fee
      await randomNumberGenerator.setFee(config.FeeInLink[currentNetwork]);

      // Set key hash
      await randomNumberGenerator.setKeyHash(config.KeyHash[currentNetwork]);
    } else {
      console.log("RandomNumberGenerator without VRF is deployed..");

      const RandomNumberGenerator = await ethers.getContractFactory(
        "MockRandomNumberGenerator"
      );
      randomNumberGenerator = await RandomNumberGenerator.deploy();
      await randomNumberGenerator.deployed();

      console.log(
        "RandomNumberGenerator deployed to:",
        randomNumberGenerator.address
      );
    }

    const kiguriLottery = await KiguriLottery.deploy(
      config.CakeToken[currentNetwork],
      randomNumberGenerator.address
    );

    await kiguriLottery.deployed();
    console.log("KiguriLottery deployed to:", kiguriLottery.address);

    // Set lottery address
    await randomNumberGenerator.setLotteryAddress(kiguriLottery.address);
  } else if (currentNetwork == "mainnet") {
    const RandomNumberGenerator = await ethers.getContractFactory(
      "RandomNumberGenerator"
    );
    const randomNumberGenerator = await RandomNumberGenerator.deploy(
      config.VRFCoordinator[currentNetwork],
      config.LinkToken[currentNetwork]
    );

    await randomNumberGenerator.deployed();
    console.log(
      "RandomNumberGenerator deployed to:",
      randomNumberGenerator.address
    );

    // Set fee
    await randomNumberGenerator.setFee(config.FeeInLink[currentNetwork]);

    // Set key hash
    await randomNumberGenerator.setKeyHash(config.KeyHash[currentNetwork]);

    const kgiruiLottery = await KiguriLottery.deploy(
      config.CakeToken[currentNetwork],
      randomNumberGenerator.address
    );

    await kgiruiLottery.deployed();
    console.log("KiguriLottery deployed to:", kgiruiLottery.address);

    // Set lottery address
    await randomNumberGenerator.setLotteryAddress(kgiruiLottery.address);

    // Set operator & treasury adresses
    await kgiruiLottery.setOperatorAndTreasuryAndInjectorAddresses(
      config.OperatorAddress[currentNetwork],
      config.TreasuryAddress[currentNetwork],
      config.InjectorAddress[currentNetwork]
    );
  }
};

main(true)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
