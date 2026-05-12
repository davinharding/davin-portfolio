import Header from "./Header";
import Footer from "./Footer";

type HeaderFooterProps = {
  children?: React.ReactNode;
  page?: string;
  mobile?: boolean;
};

const HeaderFooter: React.FC<HeaderFooterProps> = ({
  children,
  page,
  mobile,
}) => {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-1/2 focus-visible:-translate-x-1/2 focus-visible:z-[100] focus-visible:rounded-full focus-visible:border focus-visible:border-border focus-visible:bg-background/90 focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-foreground focus-visible:shadow-lg focus-visible:backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Skip to content
      </a>
      <Header page={page} mobile={mobile} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
};

export default HeaderFooter;
