import { StaticImageData } from "next/image";
import Mintly from "/public/projectScreenshots/mintly.png";
import MintlyProjectList from "/public/projectScreenshots/mintly_project_list.png";
import MintlyTeamPage from "/public/projectScreenshots/mintly_team_page.png";
import MintlyProjectOptions from "/public/projectScreenshots/mintly_project_options.png";
import MintlyArtGen from "/public/projectScreenshots/mintly_art_gen.png";

import ThetaVibes from "/public/projectScreenshots/theta_vibes.png";
import Tunies from "/public/projectScreenshots/tunies.png";
import MetaverseHospitality from "/public/projectScreenshots/metaverse_hospitality.png";
import DavinPortfolioHome from "/public/projectScreenshots/davin_portfolio_home.png";
import DavinPortfolioProjects from "/public/projectScreenshots/davin_portfolio_projects.png";
import AIProductDesigner from "/public/projectScreenshots/ai_product_designer.png";

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
import LangChainLogo from "/public/logos/langchain_logo.svg?url";
import AnthropicLogo from "/public/logos/anthropic_logo.svg?url";
import OpenAILogo from "/public/logos/openai_logo.svg?url";
import SupabaseLogo from "/public/logos/supabase_logo.svg?url";

export type ProjectTag = {
  title: string;
  icon: StaticImageData;
};

export type Project = {
  image: StaticImageData;
  image2?: StaticImageData;
  image3?: StaticImageData;
  image4?: StaticImageData;
  image5?: StaticImageData;
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
  LangChain: { title: "LangChain", icon: LangChainLogo },
  Anthropic: { title: "Anthropic", icon: AnthropicLogo },
  OpenAI: { title: "OpenAI", icon: OpenAILogo },
  Supabase: { title: "Supabase", icon: SupabaseLogo },
};

export const projects: Project[] = [
  {
    image: AIProductDesigner,
    title: "AI Product Designer",
    name: "AI Product Designer",
    previewDescription:
      "A generative AI tool for fashion designers that transforms text prompts into photorealistic garment visualizations, fully integrated with ApparelMagic's ERP platform.",
    description:
      `AI Product Designer was my first major release at ApparelMagic and represents a significant pivot in my career into AI/ML product development.  The tool enables fashion designers to go from idea to photorealistic garment visualization in seconds using natural language prompts.
      |
      The technical challenge here was building a conversation-based design system that could understand fashion terminology and translate it into consistent, high-quality image generations.  I architected the system with two modes - a Basic Mode that guides users through garment creation with dynamic, targeted questions, and an Advanced Mode for experienced users who want direct prompt control.
      |
      One of the most satisfying aspects of this project was the deep ERP integration.  Generated designs automatically come with draft product metadata - style numbers, descriptions, and all the data needed to push directly into the ApparelMagic catalog or eCommerce storefronts with a single click.  This workflow eliminates the traditional sample development cycle, potentially saving brands up to 90% on prototyping costs.
      |
      The branding control features allow companies to lock in approved models, poses, and studio lighting so AI renders stay 100% on-brand across collections.  It's been exciting to see fashion brands adopt this tool for pre-order campaigns, trend response, and dramatically accelerated development cycles.
      `,
    projectTags: [
      projectTags.TypeScript,
      projectTags.React,
      projectTags.Nodejs,
      projectTags.OpenAI,
      projectTags.LangChain,
      projectTags.Postgres,
      projectTags.AWS,
    ],
    liveLink: "https://apparelmagic.com/ai-product-designer/",
  },
  {
    image: Mintly,
    image2: MintlyProjectOptions,
    image3: MintlyProjectList,
    image4: MintlyTeamPage,
    image5: MintlyArtGen,
    // image5: Mintly,
    title: "Mintly",
    name: "Mintly",
    previewDescription:
      "A comprehensive toolset for NFT creators to build, deploy and maintain digital collectibles with multi tenet support for teams and agencies.",
    description:
      `Mintly is the culmination of learnings from several technical implementations Palm Tree NFT has done for its various NFT clients.  It is an effort to build a tool that allows an NFT creator to accomplish all of the technical tasks of launching an NFT project through an efficient guided experience.
      |
      This includes data collection, art generation, storage, one-click deployment and post-deployment contract management.  Additionally, it is built with a multi-tenancy architecture making it perfect for teams to collaborate together.  This is also great for agencies allowing them to deploy and manage multiple projects for their clients.
      |
      As the lead engineer on this project it has been exciting and challenging to take on such an ambitious problem and I am looking forward to continuing to build and improve the platform with the help of our early adopters.
      |
      Mintly is currently in a closed alpha testing phase, with a wider beta testing phase to be announced soon.  If you are interested in joining one of the testing phases please email or book a call with me to discuss.
      `,
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
    image: DavinPortfolioHome,
    image2: DavinPortfolioProjects,
    title: "Davin Harding - Developer Portfolio",
    name: "Developer Portfolio",
    previewDescription:
      "A mobile responsive developer portfolio site built for speed and interactivity.  Integrated with Calendly for call scheduling.",
    description:
      "For this portfolio site I specifically chose to design and build all the structural components and pages from the ground up using Next.js and Tailwind CSS.  I wanted to do this to showcase some of my frontend skills instead of using templates.  For the dynamic elements some off the shelf packages were configured and integrated like tsParticles and React-Vertical-Timeline (checkout the package.json at the Github link to see what else I used).  I also integrated the Calendly React component for call scheduling.  Overall I had a lot of fun putting this site together and I will be adding content and additional features over time.",
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
    description:
      "For the Theta Vibes project I was contracted to build out NFT staking contracts for existing and future NFT collections as well as a dApp that included a landing/info page, wallet connectivity and an interactive UI for the staking contracts to be able to view, stake, collect and withdraw NFTs.  The dApp has collected 1k+ unique users and 2k+ staking transactions on the Theta blockchain.",
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
    description:
      "The Metaverse Hospitality project was a NFT smart contract implementation, landing page and mint page contracted through Palm Tree NFT.  Contract features included Merkle Proof allowlist tiers, controls around number of mints allowed in each tier, unrevealed artwork, and nft staking for rewards tiers.",
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
    description:
      "The Tunies NFT project was one of the first NFT smart contract implementations I completed through Palm Tree NFT.  It was a mostly standard implementation wtih allowlist tiers, controls for various contract parameters and blockchain controlled payout splits.  One novel feature that I implemented in this project however was extending the ERC721A contract which introduced some new (at the time) gas optimizations surronding minting multiple NFTs.  This allowed Tunies to be on the cutting edge of gas optimization at a time when gas costs were soaring.",
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
];
