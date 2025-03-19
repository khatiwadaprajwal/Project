import React from "react";
import HeroBanner from "../component/HeroBanner";
import FeaturedProducts from "../component/FeaturedProducts";
import ProductCollection from "../component/ProductCollection";
import CategoriesSection from "../component/CategoriesSection";
import BenefitsSection from "../component/BenefitsSection"; // Import the new component
import Newsletter from "../component/Newsletter";
import ServiceSection from "../component/ServiceSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Full width HeroBanner */}
      <div className="w-full">
        <HeroBanner />
      </div>
      
      {/* Container for the rest of the content */}
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <CategoriesSection />
        <FeaturedProducts />
        
        {/* Add the Benefits Section here */}
        <BenefitsSection />
        
        <div className="py-16">
          <div className="flex flex-col gap-y-6 gap-x-3 mx-2 my-2">
            <ProductCollection title="Bestsellers" collectionType="bestseller" />
            <ProductCollection title="Top Rated" collectionType="topRated" />
            <ProductCollection
              title="Latest Collection"
              collectionType="latest"
            />
          </div>
        </div>
        <Newsletter />
        <ServiceSection />
      </div>
    </div>
  );
};

export default Home;