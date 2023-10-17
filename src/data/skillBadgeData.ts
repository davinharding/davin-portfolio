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

export type SkillData = {
  name: string;
  image: StaticImageData;
};

export const skillBadgeData: SkillData[] = [
  { name: "TypeScript", image: TypeScriptLogo },
  { name: "Node.js", image: NodejsLogo },
  { name: "Next.js", image: NextjsLogo },
  { name: "Vercel", image: VercelLogo },
  { name: "React", image: ReactLogo },
  { name: "TailwindCSS", image: TailwindLogo },
  { name: "AWS Suite", image: AWSLogo },
  { name: "NPM", image: NPMLogo },
  { name: "Ethers.js", image: EtherjsLogo },
  { name: "Hardhat", image: HardhatLogo },
  { name: "Arweave", image: ArweaveLogo },
  { name: "IPFS", image: IPFSLogo },
  //   { name: "AWS Amplify", image: AWSAmplifyLogo },
  { name: "web3js", image: Web3jsLogo },
  { name: "Express", image: ExpressLogo },
  { name: "postgres", image: PostgresLogo },
  { name: "serverless", image: ServerlessLogo },
  { name: "dynamodb", image: DynamodbLogo },
  { name: "jest", image: JestLogo },
  { name: "firebase", image: FirebaseLogo },
];
