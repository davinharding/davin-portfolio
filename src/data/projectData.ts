import { StaticImageData } from "next/image";
import Mintly from "/public/projectScreenshots/mintly.png";
import ThetaVibes from "/public/projectScreenshots/theta_vibes.png";
import MythicalMushrooms from "/public/projectScreenshots/mythical_mushrooms.png";
import Tunies from "/public/projectScreenshots/tunies.png";
import MetaverseHospitality from "/public/projectScreenshots/metaverse_hospitality.png";
import DavinPortfolio from "/public/projectScreenshots/davin_portfolio.png";

import TypeScriptLogo from "/public/logos/Typescript_logo.png";
import NodejsLogo from "/public/logos/nodejs_logo.png";
import NextjsLogo from "/public/logos/nextjs_logo.png";
import EthersjsLogo from "/public/logos/ethersjs_logo.png";
import HardhatLogo from "/public/logos/hardhat_logo.png";
import ReactLogo from "/public/logos/react_logo.png";
import TailwindLogo from "/public/logos/tailwind_logo.png";
import VercelLogo from "/public/logos/vercel_logo.png";
import AWSLogo from "/public/logos/aws_logo.png";
import NPMLogo from "/public/logos/npm_logo.png";
import ArweaveLogo from "/public/logos/arweave_logo.png";
import IPFSLogo from "/public/logos/ipfs_logo.png";
import AWSAmplifyLogo from "/public/logos/aws_amplify_logo.png";
import Web3jsLogo from "/public/logos/web3js_logo.png";
import ExpressLogo from "/public/logos/express_logo.png";
import PostgresLogo from "/public/logos/postgres_logo.png";
import ServerlessLogo from "/public/logos/serverless_logo.png";
import DynamodbLogo from "/public/logos/dynamodb_logo.png";
import JestLogo from "/public/logos/jest_logo.png";
import FirebaseLogo from "/public/logos/firebase_logo.png";
import MaterialUILogo from "/public/logos/materialuilogo.png";
import JavaScriptLogo from "/public/logos/JavaScript_logo.png";
import SolidityLogo from "/public/logos/solidity_logo.png";
import ShopifyLogo from "/public/logos/shopify_logo.png";
import StripeLogo from "/public/logos/stripe_logo.png";

export type ProjectTag = {
  title: string;
  icon: StaticImageData;
};

export type Project = {
  image: StaticImageData;
  title: string;
  previewDescription: string;
  description?: string;
  projectTags: ProjectTag[];
  githubLink?: string;
  demoLink?: string;
  liveLink?: string;
  smartContractLink?: string;
  name: string;
};

const projectTags: { [key: string]: ProjectTag } = {
  TypeScript: { title: "Typescript", icon: TypeScriptLogo },
  JavaScript: { title: "JavaScript", icon: JavaScriptLogo },
  Nodejs: { title: "Node.js", icon: NodejsLogo },
  Nextjs: { title: "Next.js", icon: NextjsLogo },
  Solidity: { title: "Solidity", icon: SolidityLogo },
  Ethersjs: { title: "Ethers.js", icon: EthersjsLogo },
  Hardhat: { title: "Hardhat", icon: HardhatLogo },
  React: { title: "React", icon: ReactLogo },
  Tailwind: { title: "Tailwind", icon: TailwindLogo },
  Vercel: { title: "Vercel", icon: VercelLogo },
  AWS: { title: "AWS", icon: AWSLogo },
  NPM: { title: "NPM", icon: NPMLogo },
  Arweave: { title: "Arweave", icon: ArweaveLogo },
  IPFS: { title: "IPFS", icon: IPFSLogo },
  AWSAmplify: { title: "AWSAmplify", icon: AWSAmplifyLogo },
  Web3js: { title: "Web3js", icon: Web3jsLogo },
  Express: { title: "Express", icon: ExpressLogo },
  Postgres: { title: "Postgres", icon: PostgresLogo },
  Serverless: { title: "Serverless", icon: ServerlessLogo },
  Dynamodb: { title: "Dynamodb", icon: DynamodbLogo },
  Jest: { title: "Jest", icon: JestLogo },
  Firebase: { title: "Firebase", icon: FirebaseLogo },
  MaterialUI: { title: "MaterialUI", icon: MaterialUILogo },
  Shopify: { title: "Shopify", icon: ShopifyLogo },
  Stripe: { title: "Stripe", icon: StripeLogo },
};

export const projects: Project[] = [
  {
    image: Mintly,
    title: "Mintly",
    name: "Mintly",
    previewDescription:
      "A comprehensive toolset for NFT creators to build, deploy and maintain digital collectibles with multi tenet support for teams and agencies.",
    projectTags: [
      projectTags.TypeScript,
      projectTags.React,
      projectTags.Nextjs,
      projectTags.Ethersjs,
      projectTags.AWS,
      projectTags.NPM,
      projectTags.Nodejs,
      projectTags.Express,
      projectTags.Dynamodb,
      projectTags.Jest,
      projectTags.Serverless,
      projectTags.Stripe,
    ],
    liveLink: "https://mintlyapp.com/",
  },
  {
    image: DavinPortfolio,
    title: "Davin Harding - Developer Portfolio",
    name: "Developer Portfolio",
    previewDescription:
      "A mobile responsive developer portfolio site built for speed and interactivity.  Integrated with Calendly for call scheduling.",
    projectTags: [
      projectTags.TypeScript,
      projectTags.React,
      projectTags.Nextjs,
      projectTags.NPM,
      projectTags.Vercel,
      projectTags.Tailwind,

    ],
    liveLink: "https://www.davin.io/",
    githubLink: "https://github.com/davinharding/davin-portfolio",
  },
  {
    image: ThetaVibes,
    title: "Theta Vibes",
    name: "Theta Vibes",
    previewDescription:
      "A landing page and NFT staking dApp for the Theta Vibes project, built on the Theta Network.  A place for info on the project as well as a UI to view, deposit, withdraw and collect TNT-20 tokens from stakeable NFTs.",
    projectTags: [
      projectTags.JavaScript,
      projectTags.React,
      projectTags.Nextjs,
      projectTags.Solidity,
      projectTags.Ethersjs,
      projectTags.Hardhat,
      projectTags.NPM,
      projectTags.Vercel,
      projectTags.MaterialUI,
    ],
    liveLink: "https://www.thetavibes.io/",
    githubLink: "https://github.com/davinharding/guardian-of-theta-frontend",
    smartContractLink:
      "https://explorer.thetatoken.org/account/0x4031f51e61dc249688f4a1da1ed6dc240f366846",
  },
  {
    image: MetaverseHospitality,
    title: "Metaverse Hospitality - Smart Contract",
    name: "Metaverse Hospitality",
    previewDescription:
      "NFT smart contract on the Ethereum blockchain.  Advanced features include merkleproof allowList, freeMint, internalMint and staking. ",
    projectTags: [
      projectTags.TypeScript,
      projectTags.Solidity,
      projectTags.NPM,
      projectTags.Hardhat,
    ],
    liveLink: "https://www.metaversehospitality.io/",
    smartContractLink:
      "https://etherscan.io/token/0x67e1033277CE54c538725a98EC83997335DEb713#code",
  },
  {
    image: Tunies,
    title: "Tunies - NFT Smart Contract",
    name: "Tunies",
    previewDescription:
      "NFT smart contract on the Ethereum blockchain.  Advanced features include merkleproof allowlist, freeMint and internalMint functions as well as NFT staking.  Contract shipped with comprehensive hardhat/chai test suite for each function.",
    projectTags: [
      projectTags.TypeScript,
      projectTags.Solidity,
      projectTags.NPM,
      projectTags.Hardhat,
    ],
    liveLink: "https://www.jakebaynham.com/tunies",
    smartContractLink:
      "https://etherscan.io/address/0xec10158c372ee3d78f256ad1a8e0ae672e8ac161#code",
  },
  {
    image: MythicalMushrooms,
    title: "Mythical Mushrooms",
    name: "Mythical Mushrooms",
    previewDescription:
      "A Web3 enabled landing page and token gated merch store for an artist led NFT collection on the Theta Blockchain.",
    projectTags: [
      projectTags.TypeScript,
      projectTags.Nextjs,
      projectTags.Ethersjs,
      projectTags.Firebase,
      projectTags.NPM,
      projectTags.Nodejs,
      projectTags.Vercel,
      projectTags.Express,
      projectTags.Shopify,
    ],
    liveLink: "https://mintlyapp.com/",
    githubLink: "https://github.com/DentonWeb3/Mythical-Mushroom"
  },
];
