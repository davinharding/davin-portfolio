'use client'

import ContainerLayout from "@/components/ContainerLayout";

const PortfolioProjectDetail = ({ params }: { params: { name: string }}) => (
  <ContainerLayout pageTitle={decodeURI(params.name)}>
  </ContainerLayout>
);

export default PortfolioProjectDetail;