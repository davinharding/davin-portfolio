import { StaticImageData } from "next/image";
import Mintly from "../../public/projectScreenshots/mintly.png";
import ThetaVibes from "../../public/projectScreenshots/theta_vibes.png";
import TypeScriptLogo from "../../public/logos/Typescript_logo.png";
import NodejsLogo from "../../public/logos/nodejs_logo.png";
import NextjsLogo from "../../public/logos/nextjs_logo.png";
import EthersjsLogo from "../../public/logos/ethersjs_logo.png";
import HardhatLogo from "../../public/logos/hardhat_logo.png";
import ReactLogo from "../../public/logos/react_logo.png";
import TailwindLogo from "../../public/logos/tailwind_logo.png";
import VercelLogo from "../../public/logos/vercel_logo.png";
import AWSLogo from "../../public/logos/aws_logo.png";
import NPMLogo from "../../public/logos/npm_logo.png";
import ArweaveLogo from "../../public/logos/arweave_logo.png";
import IPFSLogo from "../../public/logos/ipfs_logo.png";
import AWSAmplifyLogo from "../../public/logos/aws_amplify_logo.png";
import Web3jsLogo from "../../public/logos/web3js_logo.png";
import ExpressLogo from "../../public/logos/express_logo.png";
import PostgresLogo from "../../public/logos/postgres_logo.png";
import ServerlessLogo from "../../public/logos/serverless_logo.png";
import DynamodbLogo from "../../public/logos/dynamodb_logo.png";
import JestLogo from "../../public/logos/jest_logo.png";
import FirebaseLogo from "../../public/logos/firebase_logo.png";
import MaterialUILogo from "../../public/logos/materialuilogo.png";
import JavaScriptLogo from "../../public/logos/JavaScript_logo.png";
import SolidityLogo from "../../public/logos/solidity_logo.png";

export type ProjectTag = {
  title: string;
  icon: StaticImageData;
};

export type Project = {
  image: StaticImageData;
  title: string;
  description: string;
  projectTags: ProjectTag[];
  githubLink?: string;
  demoLink?: string;
  liveLink?: string;
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
};

export const projects: Project[] = [
  {
    image: Mintly,
    title: "Mintly - Digital Collectible Tools for Brands and Agencies",
    name: "Mintly",
    description:
      "A comprehensive toolset for NFT creators to build, deploy and maintain digital collectibles with multi tenet support for teams and agencies.",
    projectTags: [
      projectTags.TypeScript,
      projectTags.Nextjs,
      projectTags.Ethersjs,
      projectTags.AWS,
      projectTags.NPM,
      projectTags.Nodejs,
      projectTags.Vercel,
      projectTags.Express,
      projectTags.Dynamodb,
      projectTags.Jest,
      projectTags.Serverless,
    ],
    liveLink: "https://mintlyapp.com/",
  },
  {
    image: ThetaVibes,
    title: "Theta Vibes",
    name: "Theta Vibes",
    description:
      "A landing page and NFT staking dApp for the Theta Vibes project, built on the Theta Network.  A place for info on the project as well as a UI to view, deposit, withdraw and collect TNT-20 tokens from stakeable NFTs.",
    projectTags: [
      projectTags.JavaScript,
      projectTags.Nextjs,
      projectTags.Solidity,
      projectTags.Ethersjs,
      projectTags.Hardhat,
      projectTags.NPM,
      projectTags.Vercel,
      projectTags.MaterialUI
    ],
    liveLink: "https://www.thetavibes.io/",
    githubLink: "https://github.com/davinharding/guardian-of-theta-frontend",
  },
  {
    image: Mintly,
    title: "Mintly - Digital Collectible Tools for Brands and Agencies",
    name: "Mintly",
    description:
      "A comprehensive toolset for NFT creators to build, deploy and maintain digital collectibles with multi tenet support for teams and agencies.",
    projectTags: [
      projectTags.TypeScript,
      projectTags.Nextjs,
      projectTags.Ethersjs,
      projectTags.AWS,
      projectTags.NPM,
      projectTags.Nodejs,
      projectTags.Vercel,
      projectTags.Express,
      projectTags.Dynamodb,
      projectTags.Jest,
      projectTags.Serverless,
    ],
    liveLink: "https://mintlyapp.com/",
  },
  {
    image: Mintly,
    title: "Mintly - Digital Collectible Tools for Brands and Agencies",
    name: "Mintly",
    description:
      "A comprehensive toolset for NFT creators to build, deploy and maintain digital collectibles with multi tenet support for teams and agencies.",
    projectTags: [
      projectTags.TypeScript,
      projectTags.Nextjs,
      projectTags.Ethersjs,
      projectTags.AWS,
      projectTags.NPM,
      projectTags.Nodejs,
      projectTags.Vercel,
      projectTags.Express,
      projectTags.Dynamodb,
      projectTags.Jest,
      projectTags.Serverless,
    ],
    liveLink: "https://mintlyapp.com/",
  },
  {
    image: Mintly,
    title: "Mintly - Digital Collectible Tools for Brands and Agencies",
    name: "Mintly",
    description:
      "A comprehensive toolset for NFT creators to build, deploy and maintain digital collectibles with multi tenet support for teams and agencies.",
    projectTags: [
      projectTags.TypeScript,
      projectTags.Nextjs,
      projectTags.Ethersjs,
      projectTags.AWS,
      projectTags.NPM,
      projectTags.Nodejs,
      projectTags.Vercel,
      projectTags.Express,
      projectTags.Dynamodb,
      projectTags.Jest,
      projectTags.Serverless,
    ],
    liveLink: "https://mintlyapp.com/",
  },
  {
    image: Mintly,
    title: "Mintly - Digital Collectible Tools for Brands and Agencies",
    name: "Mintly",
    description:
      "A comprehensive toolset for NFT creators to build, deploy and maintain digital collectibles with multi tenet support for teams and agencies.",
    projectTags: [
      projectTags.TypeScript,
      projectTags.Nextjs,
      projectTags.Ethersjs,
      projectTags.AWS,
      projectTags.NPM,
      projectTags.Nodejs,
      projectTags.Vercel,
      projectTags.Express,
      projectTags.Dynamodb,
      projectTags.Jest,
      projectTags.Serverless,
    ],
    liveLink: "https://mintlyapp.com/",
  },
  // ... Add more projects as needed
];
