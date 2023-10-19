import { Fade } from "react-awesome-reveal";

type ISectionHeadingProps = {
    title: string;
    subTitle?: string;
}

const SectionHeading: React.FC<ISectionHeadingProps> = ({ title, subTitle }) => (
  <Fade cascade={true} direction={"up"} triggerOnce>
    <div className="text-5xl font-bold mb-2">{title}</div>
    <h2 className="text-lg mb-6 ml-2 lg:ml-4">{subTitle}</h2>
  </Fade>
);

export { SectionHeading };
