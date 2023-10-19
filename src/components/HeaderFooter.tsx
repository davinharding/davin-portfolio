import Header from "./Header";
import Footer from "./Footer";

type HeaderFooterProps = {
  children?: React.ReactNode;
  page?: string;
};

const HeaderFooter: React.FC<HeaderFooterProps> = ({ children, page }) => {
  return (
    <>
      <main>
        <Header page={page} />
        {children}
        <Footer />
      </main>
    </>
  );
};

export default HeaderFooter;
