import Header from "./Header";
import Footer from "./Footer";

type LayoutProps = {
  children?: React.ReactNode;
  page?: string;
};

const HeaderFooter: React.FC<LayoutProps> = ({ children, page }) => {
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
