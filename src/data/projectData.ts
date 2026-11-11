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
import OpenClawArchitecture from "../../public/projectScreenshots/openclaw_architecture.png";
import MissionControlBoard from "../../public/projectScreenshots/mission_control_board.png";
import MissionControlTask from "../../public/projectScreenshots/mission_control_task.png";
import FileExplorerCode from "../../public/projectScreenshots/file_explorer_code.png";
import FileExplorerTree from "../../public/projectScreenshots/file_explorer_tree.png";
import VitalsArchitecture from "../../public/projectScreenshots/vitals_arch.png";
import VitalsReadout from "../../public/projectScreenshots/vitals_readout.png";

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
    image: OpenClawArchitecture,
    image2: MissionControlBoard,
    image3: FileExplorerCode,
    title: "OpenClaw Multi-Agent Ops",
    name: "OpenClaw Multi-Agent Ops",
    previewDescription:
      "A self-hosted team of AI agents I run on OpenClaw: a main orchestrator plus specialists for engineering, QA, research, outreach, content, and personal ops, coordinated through Telegram, Discord, cron, and a task board the agents use themselves.",
    description:
      `This is the personal AI ops system I run day to day. It is built on OpenClaw, an open-source agent gateway, deployed in Docker on an Ubuntu VPS. I did not build OpenClaw itself. I designed and operate everything on top of it: the agent team, their instructions and memory, the scheduling, the internal tools, and the ops scripts that keep it running.
      |
      The shape is one main agent and a bench of specialists. Clawvin is the orchestrator: I talk to it over Telegram (text or voice notes) and Discord, and it either answers or delegates. Specialists cover engineering (Patch), QA (Cypress), business development (Scout), research (Alpha), outreach (Iris), content (Nova), plus finance, health, and training agents for personal ops. Each one gets its own workspace with versioned AGENTS, SOUL, TOOLS, HEARTBEAT, and MEMORY files, so instructions, persona, tool rules, and durable memory are files I can diff and review, not hidden state.
      |
      Delegation runs through a task board instead of agent-to-agent chatter. Clawvin files a task in Mission Control, a specialist claims it on its next heartbeat, posts progress as comments, and moves it through the columns. Cypress verifies claims against artifacts before work counts as done. Roughly two dozen cron jobs handle the recurring work: briefings, data pulls, reports, backups, and health checks. Mission Control and File Explorer, both covered in their own entries, are the operator UIs I built on top.
      |
      The interesting engineering was keeping a system of autonomous agents boring to operate. The gateway moves between pinned upstream release tags through an updater that refuses a dirty tree, rebuilds, health-checks, and rolls back automatically on failure. Restarts go through a script that waits for in-flight turns to finish, validates config, backs it up, and rolls back if the gateway does not come up healthy. A watchdog reaps leaked model processes that used to push the container into OOM, and cron schedules are staggered against a concurrency cap.
      |
      Model routing taught me to treat fallbacks as a cost and correctness problem. Agents run on OpenAI models with OpenAI fallbacks. A paid secondary provider is kept out of the chain entirely and only gets added by a gate that confirms a real provider outage. Auth lapses and config errors raise an alert instead, so a broken login cannot quietly route traffic to a metered backup.
      |
      Security got real attention. Secrets live only in gitignored env files, config uses placeholders, and gitleaks runs on every push to the config repo. When a self-propagating npm supply-chain worm hit packages that sat in the agent stack's dependency tree, I audited every install on the host (none of the compromised versions were present), pinned the affected dependency, blocked the compromised scopes so any install fails loudly, and added a scanner that runs after every upgrade. Agent-driven installs moved to frozen lockfiles. Commands run against an exec allowlist, and an audit script scans every agent prompt for instructions that would fall outside it and page me for approval.
      |
      The biggest lesson: prompts are production code. After one migration, stale URLs and retired workflows lingered in agent instructions and cron prompts and caused drift that took a dedicated recovery pass to untangle. Now there is one documented source of truth per system, corrections have to be written down in a file (and the agent has to say which file), and the whole home directory is a git repo with a written disaster-recovery path.`,
    capabilities: [
      "Main orchestrator plus around ten specialist agents",
      "Per-agent workspaces with versioned instructions and memory",
      "Telegram and Discord channels, including voice notes",
      "Task-board delegation through an authenticated agent API",
      "Scheduled jobs for briefings, data pulls, reports, and backups",
      "Release-tag updates with health check and auto-rollback",
      "Idle-aware safe restarts with config validation and backup",
      "Outage-gated model fallbacks with alerting",
      "Secret scanning, supply-chain scanning, and exec allowlisting",
      "Git-backed config with a written disaster-recovery runbook",
    ],
    relatedLinks: [
      {
        label: "OpenClaw (upstream)",
        href: "https://github.com/openclaw/openclaw",
      },
      {
        label: "Mission Control repo",
        href: "https://github.com/davinharding/clawvins-mission-control",
      },
      {
        label: "File Explorer repo",
        href: "https://github.com/davinharding/clawvins-file-explorer",
      },
    ],
    projectTags: [
      projectTags.OpenAI,
      projectTags.TypeScript,
      projectTags.Nodejs,
      projectTags.React,
    ],
  },
  {
    image: VitalsArchitecture,
    image2: VitalsReadout,
    title: "Vitals: AI Health Agent",
    name: "Vitals Health Agent",
    previewDescription:
      "My personal AI health coach. Vitals pulls Oura Ring and Withings scale data on a schedule, logs meals from text and voice notes, and checks me against macro, activity, and recovery targets every day. A sibling agent, Susan, extends the same system to a second household member through Apple Watch.",
    description:
      `Vitals is the health agent in my OpenClaw setup (see the OpenClaw Multi-Agent Ops case study) and the one I use most. It started as a meal-logging bot and grew into a coach that has kept a daily health log for me since February 2026, roughly 245 days and counting.
      |
      The problem: every health app owns one slice. Oura knows sleep and recovery, Withings knows weight and body composition, a food tracker knows macros, and none of them talk to each other or tell me what to change today. I wanted one coach that sees all of it and talks to me where I already am, in Telegram and Discord.
      |
      The Oura Ring integration runs as host scripts against the Oura API v2. They pull daily sleep, readiness, activity, resilience, and detailed sleep sessions (durations, heart rate, HRV, bedtimes), save the raw JSON, and write a readable summary into that day's log. A late-morning pull covers last night's sleep and a 10 PM pull captures the day's activity.
      |
      The Withings integration uses OAuth2 with refresh-token rotation, with tokens stored outside any agent workspace. It pulls weight, body fat, fat-free mass, muscle, bone, and hydration from the measurement API. The scale is shared, so the puller keeps only my Withings user ID, and when a weigh-in arrives without one it falls back to a plausible weight band. A backup pull catches late weigh-ins, and failures alert me on Telegram instead of failing quietly.
      |
      Every day is one markdown file with sections for meals, totals, weigh-in, Oura sleep, Oura activity, and notes. Each puller upserts only its own section, so a re-run or an empty pull never wipes data. The agent rule is that if a meal is not written to the file, it did not happen. That rule came from the biggest early failure: Vitals worked out macros in chat, and the next morning's summary had nothing to read.
      |
      The coaching runs on cron. A 9 AM accountability check, a 7 PM guardrail that asks whether steps and protein are on pace, a 10:30 PM full readout, and a Monday weekly review. Readouts grade each macro against its target range, keep wearable burn separate from the food budget (energy balance is labeled as an estimate), recheck that meal subtotals add up before reporting, and flag planned items as unconfirmed. I can log by voice note. Notes are transcribed locally with whisper.cpp, and Vitals replies with a voice note, followed by the numbers as text.
      |
      Data honesty was the hardest engineering problem. Oura's cloud often has not published today's activity by evening, and early versions quietly reported yesterday's steps. The steps sync now checks the record date, finds the latest cloud sync, retries with bounded backoff, and returns a distinct "upstream stale" exit code so the agent says the data is missing instead of guessing. The same rule applies to the agent itself: Vitals cannot say it logged or sent something unless the tool result confirms it. The pullers ship with shell test suites over fixture payloads covering section upserts, empty pulls, API errors, and stale data.
      |
      Susan is a second health agent I built for another member of my household on the same architecture, with its own Telegram bot, workspace, and targets. That person wears an Apple Watch rather than an Oura Ring, so I built an Apple Health ingest path: an iOS Shortcut posts the day's steps, energy, exercise minutes, sleep stages, resting heart rate, and HRV to a small Node receiver on the VPS. It listens on loopback only behind Tailscale Funnel, checks a hashed bearer token with a constant-time compare, caps request size, and rate-limits.
      |
      Both agents sit in a shared accountability group, and each one reports only on its own person. Isolation is enforced in config, not prompts: separate workspaces, workspace-only file access, and shell and session tools denied where they are not needed. An end-to-end test plan uses synthetic tags to prove neither agent can read the other's data. The only shared file is a household recipe list, so a dish both people eat gets the same macros. Telegram bots cannot see each other's messages, so cross-agent asks go through one scoped relay tool.
      |
      The lesson: a useful health agent is mostly a data-plumbing and trust problem. The model is the easy part. Getting clean, dated, correctly attributed data into one place, and making the agent admit when it is missing, is what made it worth using every day.
      |
      Stack: Node.js and Bash host scripts, Oura API v2, Withings API with OAuth2, Apple Health via iOS Shortcuts, Tailscale Funnel, OpenClaw cron and channels (Telegram and Discord), whisper.cpp, Edge TTS, and OpenAI models. Screenshots use an architecture diagram and demo data, not my real logs.`,
    capabilities: [
      "Oura Ring API v2 pulls for sleep, readiness, activity, and HRV",
      "Withings scale sync with OAuth2 refresh and per-user filtering",
      "Apple Watch ingest through an iOS Shortcut and authenticated webhook",
      "Daily markdown health log as the single source of truth",
      "Idempotent per-section upserts from each data source",
      "Meal logging from text and voice notes with running macro totals",
      "Scheduled morning, evening, nightly, and weekly coaching check-ins",
      "Stale-data detection that never substitutes yesterday's numbers",
      "Voice replies with local transcription and text-to-speech",
      "Two isolated agents with config-enforced privacy and E2E tests",
      "Fixture-based test suites for every data puller",
    ],
    relatedLinks: [
      {
        label: "Oura API v2",
        href: "https://cloud.ouraring.com/v2/docs",
      },
      {
        label: "Withings API",
        href: "https://developer.withings.com/",
      },
      {
        label: "OpenClaw (upstream)",
        href: "https://github.com/openclaw/openclaw",
      },
    ],
    projectTags: [
      projectTags.OpenAI,
      projectTags.Nodejs,
      projectTags.JavaScript,
    ],
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
    image: MissionControlBoard,
    image2: MissionControlTask,
    title: "Clawvin's Mission Control",
    name: "Clawvin Mission Control",
    previewDescription:
      "A self-hosted Kanban board and live event feed for orchestrating a team of AI agents. Agents create, claim, and update their own tasks through an authenticated REST API, and most of the code was written by the agents themselves.",
    description:
      `Mission Control is the task board for my OpenClaw agent team (see the OpenClaw Multi-Agent Ops case study). I built it because agents handing work to each other in chat was hard to follow and impossible to audit. I wanted a shared board where every piece of delegated work had an owner, a status, and a comment trail.
      |
      It is a five-column Kanban (Backlog, Todo, In Progress, Testing, Done) with drag-and-drop, priorities, tags, per-task comment threads, an archive with auto-archiving of finished work, and a live feed of agent events. An agent sidebar shows each agent's role and online, busy, or offline status, with filters by team.
      |
      The important part is the Agent API. Agents authenticate with their own keys and use REST endpoints to create tasks, list the ones assigned to them, move them between columns, and post comments. The main agent delegates by filing tasks; specialists pick them up on their heartbeat. Every change is pushed to connected clients over WebSockets, so the board updates live as agents work.
      |
      It is also an experiment in AI-native development. The feature work in the public repo was committed by agent accounts (clawvin-bot and the Harding Labs GitHub App), working from specs I wrote and reviewed. My job was product direction, specs, review, and fixing the integration seams.
      |
      Honest status: this was an internal tool, and some of what it does is now covered by OpenClaw's built-in dashboard. The public repo is a snapshot from March 2026. It still shows the patterns I care about: agent orchestration, real-time systems, and humans and agents sharing one source of truth.
      |
      Stack: React 19, TypeScript, Vite, Tailwind, Radix and shadcn/ui primitives, dnd-kit, Express, SQLite via better-sqlite3, JWT auth, and Socket.IO. Screenshots use demo data, not my real board.`,
    capabilities: [
      "Five-column Kanban with drag-and-drop",
      "Authenticated Agent REST API for tasks and comments",
      "Real-time WebSocket push to every connected client",
      "Live agent event feed with detail views",
      "Agent roster with status and team filters",
      "Per-task comment threads and auto-archiving",
      "JWT auth for humans, API keys for agents",
      "Built almost entirely by AI agents from human-written specs",
    ],
    projectTags: [
      projectTags.TypeScript,
      projectTags.React,
      projectTags.Tailwind,
      projectTags.Nodejs,
      projectTags.Express,
    ],
    githubLink: "https://github.com/davinharding/clawvins-mission-control",
  },
  {
    image: FileExplorerCode,
    image2: FileExplorerTree,
    title: "Clawvin File Explorer",
    name: "Clawvin File Explorer",
    previewDescription:
      "A dark-themed web viewer for the documents my AI agents create on my VPS: workout plans, business strategy docs, financial summaries, reports, and checklists. Lazy-loaded tree, markdown preview, search, and a switcher across six agent workspaces.",
    description:
      `My OpenClaw agents produce a steady stream of finished work: workout plans, business strategy documents, financial summaries, reports, checklists, and research notes. All of it lands in each agent's workspace on the VPS, and reading it meant SSHing into the server and digging through directories. File Explorer replaced that with a read-only web view that sits next to Mission Control, so the things the agents make for me are easy to open and read.
      |
      It has a lazy-loaded file tree, breadcrumbs, file search, GitHub-flavored markdown preview, syntax-highlighted code, and copy-path and download actions. A workspace switcher jumps between six agent workspaces (Clawvin, Patch, Scout, Vitals, Ledger, Atlas). Because the workspaces also hold instruction files, memory logs, and config, it doubles as a way to audit what each agent knows, but the main job is viewing the artifacts they create.
      |
      Like Mission Control, it was built by the agents themselves from my specs, and the feature commits come from agent accounts. It is a small, focused internal tool and is now partly superseded, but it was the piece that made agent output easy to read and agent memory inspectable instead of a black box.
      |
      Stack: React 18, TypeScript, Vite, Tailwind, Radix primitives, react-markdown with remark-gfm, and react-syntax-highlighter. Screenshots use a demo workspace, not real agent files.`,
    capabilities: [
      "Lazy-loaded file tree with breadcrumbs",
      "Workspace switcher across six agents",
      "GitHub-flavored markdown preview for plans, reports, and docs",
      "Syntax highlighting for code and config",
      "File search, copy path, and download",
      "Built by AI agents from human-written specs",
    ],
    projectTags: [
      projectTags.TypeScript,
      projectTags.React,
      projectTags.Tailwind,
    ],
    githubLink: "https://github.com/davinharding/clawvins-file-explorer",
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
