import Header from "./Header";
import Footer from './Footer'

type LayoutProps = {
  children?: React.ReactNode;
};

const HeaderFooter: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default HeaderFooter;
