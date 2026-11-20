import Header from "./Header";
import Footer from "./Footer";

type HeaderFooterProps = {
  children?: React.ReactNode;
  page?: string;
  mobile?: boolean;
  /** Keep header, content, and footer within one screen; main takes the leftover height. */
  fitViewport?: boolean;
};

const HeaderFooter: React.FC<HeaderFooterProps> = ({
  children,
  page,
  mobile,
  fitViewport,
}) => {
  if (fitViewport) {
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <Header page={page} mobile={mobile} />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
      </div>
    );
  }
  return (
    <>
      <Header page={page} mobile={mobile} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
};

export default HeaderFooter;
