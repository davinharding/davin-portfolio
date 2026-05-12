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
      <Header page={page} mobile={mobile} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
};

export default HeaderFooter;
