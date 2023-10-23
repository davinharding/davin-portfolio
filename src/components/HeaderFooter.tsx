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
      <main>
        <Header page={page} mobile={mobile} />
        {children}
        <Footer />
      </main>
    </>
  );
};

export default HeaderFooter;
