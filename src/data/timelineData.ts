export type TimelineElement = {
  id: number;
  role?: string;
  orgAndLocation?: string;
  summary?: string;
  date: string;
  link: string;
};

export const timelineData: TimelineElement[] = [
  {
    id: 0,
    role: "Founder",
    orgAndLocation: "Harding Labs, Fort Lauderdale, FL",
    summary:
      "Founded Harding Labs, a product studio focused on building and launching AI-native applications. First product is StageSnap, an AI-powered real estate photo staging platform that transforms empty or cluttered rooms into beautifully staged listings. Building from zero to paying customers.",
    date: "2025-11 => Present",
    link: "https://hardinglabs.io",
  },
  {
    id: 1,
    role: "Senior Software Engineer — AI Platform & Full-Stack Product Systems",
    orgAndLocation: "ApparelMagic, West Palm Beach, FL",
    summary:
      "Architected and led the build of ApparelMagic Intelligence, an embedded enterprise AI platform spanning configurable agents, Copilot, scheduled and asynchronous jobs, tool-driven ERP actions, permissions, approval controls, and operational workflows across inventory, sales, finance, and product development. Also architected AI Designer, a conversational product-design system that turns natural-language prompts into garment visualizations and draft ERP product data. Built collaboratively, with hardening and final engineering passes from the CEO/lead engineer.",
    date: "2024-06 => Present",
    link: "https://apparelmagic.com/",
  },
  {
    id: 2,
    role: "Full Stack Developer",
    orgAndLocation: "Palm Tree NFT, Palm Beach, FL",
    summary:
      "Developed and tested Ethereum smart contracts for NFT projects, implemented advanced features like staking and DAO structures and led large-scale NFT application builds.",
    date: "2022-04 => 2024-01",
    link: "https://www.palmtreenft.com/",
  },
  {
    id: 3,
    role: "Full Stack Web Developer",
    orgAndLocation: "Davin Harding, Fort Lauderdale, FL",
    summary:
      "Provided comprehensive consultation and development services for NFT collections, encompassing web3 front ends, smart contract deployment, integrated e-commerce, and backend user data management.",
    date: "2022-01 => 2024-06",
    link: "https://davin.io",
  },
  {
    id: 4,
    role: "Eat The Blocks - Blockchain Developer Course",
    orgAndLocation: "Remote",
    summary:
      "Completed the Eat the Blocks Blockchain developer course, acquiring hands-on expertise in Ethereum smart contract programming and DApp development. The curriculum provided in-depth training on Solidity, Ethereum tools, and effective testing strategies.",
    date: "2021-08 => 2021-12",
    link: "https://eattheblocks.com/course/",
  },
  {
    id: 5,
    role: "Software Consultant",
    orgAndLocation: "Maryville Consulting Group, St. Louis, MO",
    summary:
      "Led ITSM application projects for Fortune 500 clients as an Associate Consultant and played a key role in modernizing data access for Canada's 2nd largest grain distributor as a Senior Associate. As an Independent Consultant, contributed to a data-driven application for a health administration client that ranked within both the Fortune 40 and Fortune 50 during the relevant period, and provided technical support to team members.",
    date: "2019-01 => 2021-08",
    link: "https://maryville.com/",
  },
  {
    id: 6,
    role: "Full Stack Web Developer Bootcamp",
    orgAndLocation: "Wyncode Academy - Miami, Fl",
    summary:
      "Graduated from the Wyncode Academy Full Stack Web Developer immersive bootcamp, gaining comprehensive skills in end-to-end web development. The intensive program offered deep dives into front-end and back-end technologies, frameworks, and best practices.",
    date: "2018-08 => 2018-11",
    link: "https://brainstation.io/miami",
  },
];
