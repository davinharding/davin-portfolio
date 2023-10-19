import { StaticImageData } from "next/image";
import TypeScriptLogo from "../../public/logos/Typescript_logo.png";
import NodejsLogo from "../../public/logos/nodejs_logo.png";
import NextjsLogo from "../../public/logos/nextjs_logo.png";
import EtherjsLogo from "../../public/logos/ethersjs_logo.png";
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
import ShopifyLogo from "../../public/logos/shopify_logo.png";
import StripeLogo from "../../public/logos/stripe_logo.png";

export type SkillData = {
  name: string;
  image: StaticImageData;
  link: string;
};

export const skillBadgeData: SkillData[] = [
  {
    name: "TypeScript",
    image: TypeScriptLogo,
    link: "https://www.typescriptlang.org/",
  },
  {
    name: "JavaScript",
    image: JavaScriptLogo,
    link: "https://www.javascript.com/"
  },
  {
    name: "Node.js",
    image: NodejsLogo,
    link: "https://nodejs.org/en",
  },
  {
    name: "Next.js",
    image: NextjsLogo,
    link: "https://nextjs.org/",
  },
  {
    name: "Vercel",
    image: VercelLogo,
    link: "https://vercel.com/",
  },
  { name: "React", image: ReactLogo, link: "hhttps://react.dev/" },
  {
    name: "TailwindCSS",
    image: TailwindLogo,
    link: "https://tailwindcss.com/",
  },
  {
    name: "MaterialUI",
    image: MaterialUILogo,
    link: "https://mui.com/"
  },
  {
    name: "AWS Suite",
    image: AWSLogo,
    link: "https://aws.amazon.com/",
  },
  { name: "NPM", image: NPMLogo, link: "https://www.npmjs.com/" },
  {
    name: "Solidity",
    image: SolidityLogo,
    link: "https://soliditylang.org/",
  },
  {
    name: "Ethers.js",
    image: EtherjsLogo,
    link: "https://docs.ethers.org/v6/",
  },
  {
    name: "Hardhat",
    image: HardhatLogo,
    link: "https://hardhat.org/",
  },
  {
    name: "Arweave",
    image: ArweaveLogo,
    link: "https://www.arweave.org/",
  },
  { name: "IPFS", image: IPFSLogo, link: "https://www.ipfs.com/" },
  //   { name: "AWS Amplify", image: AWSAmplifyLogo },
  {
    name: "web3js",
    image: Web3jsLogo,
    link: "https://web3js.org/",
  },
  {
    name: "Express",
    image: ExpressLogo,
    link: "https://expressjs.com/",
  },
  {
    name: "Postgres",
    image: PostgresLogo,
    link: "https://www.postgresql.org/",
  },
  {
    name: "Serverless",
    image: ServerlessLogo,
    link: "https://www.serverless.com/",
  },
  {
    name: "Dynamodb",
    image: DynamodbLogo,
    link: "https://aws.amazon.com/dynamodb/",
  },
  { name: "Jest", image: JestLogo, link: "https://jestjs.io/" },
  {
    name: "Firebase",
    image: FirebaseLogo,
    link: "https://firebase.google.com/",
  },
  {
    name: 'Shopify',
    image: ShopifyLogo,
    link: 'https://www.shopify.com/'
  },
  {
    name: 'Stripe',
    image: StripeLogo,
    link: 'https://stripe.com/'
  }
];
