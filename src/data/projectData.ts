import { StaticImageData } from "next/image";
import Mintly from "../../public/projectScreenshots/mintly.png";
import MintlyProjectList from "../../public/projectScreenshots/mintly_project_list.png";
import MintlyTeamPage from "../../public/projectScreenshots/mintly_team_page.png";
import MintlyProjectOptions from "../../public/projectScreenshots/mintly_project_options.png";
import MintlyArtGen from "../../public/projectScreenshots/mintly_art_gen.png";

import ThetaVibes from "../../public/projectScreenshots/theta_vibes.png";
import Tunies from "../../public/projectScreenshots/tunies.png";
import MetaverseHospitality from "../../public/projectScreenshots/metaverse_hospitality.png";
import DavinPortfolioHome from "../../public/projectScreenshots/davin_portfolio_home.png";
import DavinPortfolioProjects from "../../public/projectScreenshots/davin_portfolio_projects.png";
import AIDesigner1 from "../../public/projectScreenshots/ai_designer_1.png";
import AIDesigner2 from "../../public/projectScreenshots/ai_designer_2.png";
import AIDesigner3 from "../../public/projectScreenshots/ai_designer_3.png";
import StageSnapLanding from "../../public/projectScreenshots/stagesnap_landing.png";
import StageSnapDashboard from "../../public/projectScreenshots/stagesnap_dashboard.png";
import StageSnapWorkspace from "../../public/projectScreenshots/stagesnap_workspace.png";
import StageSnapPricing from "../../public/projectScreenshots/stagesnap_pricing.png";
import StageSnapBilling from "../../public/projectScreenshots/stagesnap_billing.png";
import AmiDashboard from "../../public/projectScreenshots/ami_dashboard.png";
import AmiAsk from "../../public/projectScreenshots/ami_ask.png";
import AmiAct from "../../public/projectScreenshots/ami_act.png";
import AmiMonitor from "../../public/projectScreenshots/ami_monitor.png";
import VibecationLanding from "../../public/projectScreenshots/vibecation_landing.png";
import VibecationFlow from "../../public/projectScreenshots/vibecation_flow.png";
import VibecationDestinations from "../../public/projectScreenshots/vibecation_destinations.png";
import VibecationPricing from "../../public/projectScreenshots/vibecation_pricing.png";
import VibecationQuiz from "../../public/projectScreenshots/vibecation_quiz.png";

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
import ShopifyLogo from "../../public/logos/shopify_logo.png";
import StripeLogo from "../../public/logos/stripe_logo.png";
import LangChainLogo from "../../public/logos/langchain_logo.svg?url";
import OpenAILogo from "../../public/logos/openai_logo.svg?url";
import AnthropicLogo from "../../public/logos/anthropic_logo.svg?url";
import SupabaseLogo from "../../public/logos/supabase_logo.svg?url";
import ClerkLogo from "../../public/logos/clerk_logo.svg?url";
import ReplicateLogo from "../../public/logos/replicate_logo.svg?url";
import SentryLogo from "../../public/logos/sentry_logo.svg?url";
import NestjsLogo from "../../public/logos/nestjs_logo.svg?url";

export type ProjectTag = {
  title: string;
  icon: StaticImageData;
};

export type ProjectRelatedLink = {
  label: string;
  href: string;
};

export type Project = {
  image?: StaticImageData;
  image2?: StaticImageData;
  image3?: StaticImageData;
  image4?: StaticImageData;
  image5?: StaticImageData;
  title: string;
  previewDescription: string;
  description?: string;
  capabilities?: string[];
  relatedLinks?: ProjectRelatedLink[];
  projectTags: ProjectTag[];
  githubLink?: string;
  demoLink?: string;
  liveLink?: string;
  smartContractLink?: string;
  name: string;
  /**
   * When true, the project is treated as a work-in-progress and is hidden from
   * public listings (home page, /portfolio, sitemap) and excluded from the
   * static-params build. The detail page route still resolves so the project
   * can be previewed by direct URL during iteration. Flip to `false` (or
   * remove the field) to publish.
   */
  draft?: boolean;
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
  OpenAI: { title: "OpenAI", icon: OpenAILogo },
  Anthropic: { title: "Anthropic", icon: AnthropicLogo },
  Supabase: { title: "Supabase", icon: SupabaseLogo },
  Clerk: { title: "Clerk", icon: ClerkLogo },
  Replicate: { title: "Replicate", icon: ReplicateLogo },
  Sentry: { title: "Sentry", icon: SentryLogo },
  NestJS: { title: "NestJS", icon: NestjsLogo },
};

/**
 * Returns every project that should be visible publicly (i.e. not flagged as
 * a `draft`). Use this anywhere projects are listed in navigation, the
 * sitemap, OG metadata, etc. The full `projects` array remains the source of
 * truth for direct-URL access so drafts can still be previewed by visiting
 * their detail route.
 */
export const getPublishedProjects = (): Project[] =>
  projects.filter((project) => !project.draft);

/**
 * Canonical path for a project's detail page. Centralized so the URL scheme
 * (and its encoding) lives in one place — the dynamic route, sitemap, header
 * dropdown, project cards, and metadata all consume this.
 *
 * `encodeURIComponent` is required because project names can contain spaces
 * and reserved characters; `encodeURI` would leave `&`, `?`, `#`, `+`, etc.
 * unescaped and break routing.
 */
export const projectPath = (name: string): string =>
  `/portfolio/${encodeURIComponent(name)}`;

export const projects: Project[] = [
  {
    image: AmiDashboard,
    image2: AmiMonitor,
    image3: AmiAsk,
    image4: AmiAct,
    title: "ApparelMagic AI Agents",
    name: "ApparelMagic AI Agents",
    previewDescription:
      "Domain-specialized AI agents embedded in ApparelMagic's ERP: scheduled jobs, tool-driven data access, insight generation, and approval-controlled actions across inventory, sales, finance, and product development.",
    description:
      `I architected and led the build of ApparelMagic's AI agent platform, working collaboratively with the team and incorporating hardening and final engineering passes from ApparelMagic's CEO/lead engineer. AI Designer is covered in its own case study; this one is about the agents.
      |
      The core problem was turning a system of record into something that could monitor operations and act on them. I built configurable agents with their own instructions and business context, then wired them to pre-built tools that read ApparelMagic data and return real operational insights: stock and backorders, customer and account risk, invoices and margins, product demand and assortment.
      |
      A lot of the hard learning was in the execution model. Agent jobs needed queue-based async execution so scheduled and long-running work could happen reliably without blocking the app. That meant designing for retries, concurrency, and progress that operators could actually trust when agents ran overnight or across large datasets.
      |
      Tool design mattered as much as the models. Rather than dumping raw ERP tables into prompts, agents called purpose-built tools against inventory, sales, finance, and product-development data, then reasoned over structured results. That kept answers grounded and made it possible to draft actions the business could review.
      |
      One of the more useful patterns was LLM digestion of those results into customer-facing work: data-aware bulk email drafts for sales and customer engagement, plus custom reporting that turned agent findings into something a human could send or act on. Permissions, approval gates, and auto-approval controls sat in front of anything that wrote back to the system.
      |
      Shipping this taught me how much agent quality depends on tool boundaries, job orchestration, and human-in-the-loop controls, not just prompt quality.`,
    capabilities: [
      "Configurable AI agents with instructions and business context",
      "Queue-based async job execution for scheduled and long-running work",
      "Pre-built agent tools over ApparelMagic ERP data",
      "Inventory, sales, finance, and product-development workflows",
      "LLM-digested insights and custom reporting",
      "Data-aware bulk email drafts for sales and customer engagement",
      "Tool-driven ERP record actions",
      "Permission and approval controls",
      "Evaluation, testing, and production hardening",
    ],
    relatedLinks: [
      {
        label: "Inventory Agent",
        href: "https://apparelmagic.com/apparelmagic-intelligence/inventory-agent/",
      },
      {
        label: "Sales Agent",
        href: "https://apparelmagic.com/apparelmagic-intelligence/sales-agent/",
      },
      {
        label: "Finance Agent",
        href: "https://apparelmagic.com/apparelmagic-intelligence/finance-agent/",
      },
      {
        label: "Product Dev Agent",
        href: "https://apparelmagic.com/apparelmagic-intelligence/product-dev-agent/",
      },
      {
        label: "Custom Agents",
        href: "https://apparelmagic.com/apparelmagic-intelligence/custom-agents/",
      },
    ],
    projectTags: [
      projectTags.TypeScript,
      projectTags.React,
      projectTags.Nextjs,
      projectTags.Nodejs,
      projectTags.NestJS,
      projectTags.Postgres,
      projectTags.AWS,
      projectTags.OpenAI,
      projectTags.LangChain,
    ],
    liveLink: "https://apparelmagic.com/apparelmagic-intelligence/",
  },
  {
    image: VibecationLanding,
    image2: VibecationFlow,
    image3: VibecationDestinations,
    image4: VibecationPricing,
    image5: VibecationQuiz,
    title: "Vibecation",
    name: "Vibecation",
    previewDescription:
      "Drop an Instagram @ and get your Travel DNA in ~30 seconds: traveler archetype, three matched destinations, and a $7 day-by-day trip you can refine with Polo.",
    description:
      `Vibecation is a Harding Labs product. Drop an Instagram handle, get a Travel DNA and a trip plan. No signup, no password, no subscription.
      |
      The core problem: travel planning defaults to generic top-10 lists that ignore how someone actually likes to move through a place. Instagram already encodes taste (scenery, food, pace, aesthetic), but Instagram OAuth for personal accounts is effectively dead after the Basic Display API shutdown. Vibecation reads public grids instead, so the demo is the funnel.
      |
      I built the full product from scratch. Enter an @ and a vision model analyzes the last ~30 public posts into a traveler archetype, vibe keywords, and three destination matches. That Travel DNA ships free as a 9:16 share card meant to be screenshot into Stories.
      |
      The paid unlock is a $7 day-by-day itinerary with a blurred teaser paywall, guest Stripe Checkout (Apple Pay and Google Pay), and Polo, a parrot travel agent that streams itinerary tweaks within a per-trip message budget. Private accounts or no Instagram fall back to a five-question taste quiz.
      |
      The harder engineering was the ownership model without accounts. httpOnly cookies, claim links, and optional email magic links cover resume across devices, while public DNA URLs stay shareable without leaking planned trips. Handle-level caching keeps free-user cost down. Stack is Next.js on Vercel, Anthropic Claude for vision, DNA, itineraries, and chat, HikerAPI for Instagram scraping, Supabase Postgres, Stripe, and Resend.`,
    capabilities: [
      "Instagram public-grid analysis into Travel DNA",
      "Traveler archetype plus three destination matches",
      "Story-ready 9:16 share cards",
      "Five-question taste quiz fallback for private or missing Instagram",
      "Blurred itinerary teaser with $7 per-trip Stripe unlock",
      "Polo chat agent for itinerary refinements",
      "Guest checkout with Apple Pay and Google Pay",
      "Cookie, claim-link, and email magic-link ownership without accounts",
    ],
    projectTags: [
      projectTags.TypeScript,
      projectTags.React,
      projectTags.Nextjs,
      projectTags.Tailwind,
      projectTags.Anthropic,
      projectTags.Supabase,
      projectTags.Stripe,
      projectTags.Vercel,
    ],
    liveLink: "https://vibecation.xyz",
  },
  {
    image: StageSnapLanding,
    image2: StageSnapPricing,
    image3: StageSnapDashboard,
    image4: StageSnapWorkspace,
    image5: StageSnapBilling,
    title: "StageSnap",
    name: "StageSnap",
    previewDescription:
      "AI-powered real estate photo staging that transforms empty or cluttered rooms into beautifully furnished listings in ~30 seconds.",
    description:
      `StageSnap is the flagship product from Harding Labs, my own product studio focused on building and shipping AI-native applications.
      |
      The core problem: traditional home staging costs $2,000–$5,000 per property and takes days to arrange. Virtual staging services exist but are slow, manual, and expensive. StageSnap uses generative AI to transform raw real estate photos into professionally staged listings in about 30 seconds.
      |
      I built the full stack from scratch: a Next.js frontend with real-time before/after previews, a Node.js backend orchestrating multiple AI models for room detection, themed virtual staging, and high-fidelity image generation, plus Stripe integration for usage-based billing.
      |
      The technical challenges were interesting: preserving architectural accuracy across three staging modes (declutter, empty room, and furnish across 16 design styles) while handling diverse room types and lighting. The pipeline runs room detection, mode-specific AI enhancement, and optional HD or 4K upscaling, with concurrent job processing and SSE streaming live progress to the client.
      |
      StageSnap is live with early users in the real estate space, with plans to scale to homeowners, agents, and brokerages.`,
    projectTags: [
      projectTags.TypeScript,
      projectTags.React,
      projectTags.Nextjs,
      projectTags.Nodejs,
      projectTags.OpenAI,
      projectTags.Replicate,
      projectTags.Tailwind,
      projectTags.Supabase,
      projectTags.Clerk,
      projectTags.Stripe,
      projectTags.Sentry,
      projectTags.Vercel,
    ],
    liveLink: "https://stagesnap.xyz",
  },
  {
    image: AIDesigner1,
    image2: AIDesigner2,
    image3: AIDesigner3,
    title: "AI Designer",
    name: "AI Designer",
    previewDescription:
      "A conversational AI design system for fashion teams that turns natural-language prompts into garment visualizations, supports guided and advanced workflows, and connects approved designs to draft ERP catalog data.",
    description:
      `AI Designer was my first major release at ApparelMagic and marked my pivot into AI product development. I architected a conversation-based design system that turns natural-language prompts into photorealistic garment visualizations for fashion teams.
      |
      The system supports two workflows. Basic Mode guides users through garment creation with dynamic, targeted questions. Advanced Mode gives experienced users direct prompt control when they already know what they want.
      |
      Generated designs include draft product metadata such as style numbers and descriptions, so approved concepts can move into the ApparelMagic catalog or connected e-commerce workflows. Branding controls lock in approved models, poses, and studio lighting so renders stay on-brand across collections.
      |
      ApparelMagic's marketing materials estimate up to 90% savings on prototyping costs versus traditional sample development. That is their marketing estimate, not a measured result from my work.`,
    projectTags: [
      projectTags.TypeScript,
      projectTags.React,
      projectTags.Nodejs,
      projectTags.OpenAI,
      projectTags.LangChain,
      projectTags.Postgres,
      projectTags.AWS,
    ],
    liveLink: "https://apparelmagic.com/apparelmagic-intelligence/ai-designer/",
  },
  {
    image: Mintly,
    image2: MintlyProjectOptions,
    image3: MintlyProjectList,
    image4: MintlyTeamPage,
    image5: MintlyArtGen,
    title: "Mintly",
    name: "Mintly",
    previewDescription:
      "A multi-tenant NFT launch platform covering data collection, art generation, storage, one-click deployment, and post-deployment contract management. Reached 99% completion before stakeholders sunset it; never publicly released.",
    description:
      `Led Mintly, a multi-tenant NFT launch platform covering data collection, art generation, storage, one-click deployment, and post-deployment contract management. The platform reached 99% completion before stakeholders sunset it due to changing market conditions and was not publicly released.
      |
      Mintly grew out of technical implementations Palm Tree NFT had done for NFT clients. The goal was a guided tool that let creators complete the technical work of launching a project, with multi-tenancy for teams and agencies managing multiple collections.
      |
      It remains one of the most technically ambitious projects I've led, even though it never shipped publicly.`,
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
