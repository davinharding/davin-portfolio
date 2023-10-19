'use client'

import ContainerLayout from "@/components/ContainerLayout";

const PortfolioProjectDetail = ({ params }: { params: { name: string }}) => (
  <ContainerLayout>
    <div className="absolute top-28 text-4xl font-bold container">
      {decodeURI(params.name)}
    </div>
  </ContainerLayout>
);

export default PortfolioProjectDetail;