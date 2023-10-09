import Background from "./Background";
import Header from "./Header";
// import Footer from './footer'

type LayoutProps = {
  children?: React.ReactNode;
};

const HeaderFooter: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      {/* <Footer /> */}
    </>
  );
};

export default HeaderFooter;