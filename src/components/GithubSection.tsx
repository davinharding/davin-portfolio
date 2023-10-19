import GitHubCalendar from "react-github-calendar";
import { SectionHeading } from "./SectionHeading";
import Link from "next/link";
import { Fade } from "react-awesome-reveal";

const GithubSection: React.FC = () => (
  <div className="p-4 container mx-auto">
    <SectionHeading title="Github Contributions" subTitle="" />
    <Fade triggerOnce cascade={true} direction="up">
      <div className="flex items-center flex-col">
        <span className="text-3xl p-6">
          Proffessional (
          <Link
            href="https://github.com/davinpalmtreenft"
            className="hover:underline"
          >
            davinpalmtreenft
          </Link>
          )
        </span>
        <GitHubCalendar username="davinpalmtreenft" />
        <span className="text-3xl p-6">
          Personal (
          <Link
            href="https://github.com/davinharding"
            className="hover:underline"
          >
            davinharding
          </Link>
          )
        </span>
        <GitHubCalendar username="davinharding" />
      </div>
    </Fade>
  </div>
);

export { GithubSection };
