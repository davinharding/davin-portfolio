type ISectionHeadingProps = {
  title: string;
  subTitle?: string;
  id?: string;
};

const SectionHeading: React.FC<ISectionHeadingProps> = ({ title, subTitle, id }) => (
  <div className="mb-12">
    <h2
      id={id}
      className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground"
    >
      {title}
    </h2>
    {subTitle && (
      <p className="text-sm md:text-base text-muted-foreground mt-2">{subTitle}</p>
    )}
  </div>
);

export { SectionHeading };
