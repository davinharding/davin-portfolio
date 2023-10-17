import {
  IconDefinition,
  faIslandTropical,
  faPlay,
  faUserTieHair,
  faBriefcase,
  faLaptopCode,
  faCode,
} from "@fortawesome/pro-solid-svg-icons";

export type TimelineElement = {
  id: number;
  role?: string;
  orgAndLocation?: string;
  summary?: string;
  icon: IconDefinition;
  iconStyle: object;
  contentStyle?: object;
  contentArrowStyle?: object;
  date: string;
};

export const timelineData: TimelineElement[] = [
  {
    id: 1,
    role: "Full Stack Developer",
    orgAndLocation: "Palm Tree NFT, Palm Beach, FL",
    summary:
      "Developed and tested Ethereum smart contracts for NFT projects, implemented advanced features like staking and DAO structures and led large-scale NFT application builds.",
    icon: faIslandTropical,
    iconStyle: { background: "#87dfda", color: "#fff" },
    contentStyle: { background: "#75a1d1" },
    contentArrowStyle: { borderRight: "7px solid #75a1d1", color: "#60406a" },
    date: "2022-04 => Present",
  },
  {
    id: 2,
    role: "Full Stack Web Developer",
    orgAndLocation: "Davin Harding, Fort Lauderdale, FL",
    summary:
      "Provided comprehensive consultation and development services for NFT collections, encompassing web3 front ends, smart contract deployment, integrated e-commerce, and backend user data management.",
    icon: faUserTieHair,
    iconStyle: { background: "#8b498e", color: "#fff" },
    contentStyle: { background: "#bc4282" },
    contentArrowStyle: { borderRight: "7px solid #bc4282", color: "#60406a" },
    date: "2022-01 => Present",
  },
  {
    id: 3,
    role: "Eat The Blocks - Blockchain Developer Course",
    orgAndLocation: "Remote",
    summary:
      "Completed the Eat the Blocks Blockchain developer course, acquiring hands-on expertise in Ethereum smart contract programming and DApp development. The curriculum provided in-depth training on Solidity, Ethereum tools, and effective testing strategies.",
    icon: faLaptopCode,
    iconStyle: { background: "#32e0db", color: "#fff" },
    contentStyle: { background: "#bc4282" },
    contentArrowStyle: { borderRight: "7px solid #bc4282", color: "#60406a" },
    date: "2021-08 => 2021-12",
  },
  {
    id: 4,
    role: "Software Consultant",
    orgAndLocation: "Maryville Consulting Group",
    summary:
      "Led ITSM application projects for Fortune 500 clients as an Associate Consultant and played a pivotal role in modernizing data access for Canada's 2nd largest grain distributor as a Senior Associate. As an Independent Consultant, contributed to a data-driven application for a top-tier health administration client and provided technical support to team members.",
    icon: faBriefcase,
    iconStyle: { background: "#0e406b", color: "#fff" },
    contentStyle: { background: "#75a1d1" },
    contentArrowStyle: { borderRight: "7px solid #75a1d1", color: "#60406a" },
    date: "2019-01 => 2021-08",
  },
  {
    id: 5,
    role: "Full Stack Web Developer",
    orgAndLocation: "Wyncode Academy - Miami, Fl",
    summary:
      "Graduated from the Wyncode Academy Full Stack Web Developer immersive bootcamp, gaining comprehensive skills in end-to-end web development. The intensive program offered deep dives into front-end and back-end technologies, frameworks, and best practices.",
    icon: faCode,
    iconStyle: { background: "#1358db", color: "#fff" },
    contentStyle: { background: "#75a1d1" },
    contentArrowStyle: { borderRight: "7px solid #75a1d1", color: "#60406a" },
    date: "2018-08 => 2018-11",
  },
  {
    id: 6,
    date: "2018",
    icon: faPlay,
    iconStyle: { background: "#60a658", color: "#fff" },
  },
];
