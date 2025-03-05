import React from 'react'
import { 
    ShoppingCart, 
    Heart, 
    Search, 
    Menu, 
    X, 
    ChevronLeft, 
    ChevronRight, 
    Star, 
    Truck, 
    Shield, 
    RefreshCw 
  } from 'lucide-react';
const ServiceSection = () => {
  return (
    <div>
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto grid md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Truck className="text-blue-600 mb-4" size={48} />
            <h3 className="font-semibold">Free Shipping</h3>
            <p className="text-gray-600">On orders over $100</p>
          </div>
          <div className="flex flex-col items-center">
            <RefreshCw className="text-green-600 mb-4" size={48} />
            <h3 className="font-semibold">Easy Returns</h3>
            <p className="text-gray-600">30-day return policy</p>
          </div>
          <div className="flex flex-col items-center">
            <Shield className="text-purple-600 mb-4" size={48} />
            <h3 className="font-semibold">Secure Payment</h3>
            <p className="text-gray-600">100% secure checkout</p>
          </div>
          <div className="flex flex-col items-center">
            <Star className="text-yellow-600 mb-4" size={48} />
            <h3 className="font-semibold">Quality Guarantee</h3>
            <p className="text-gray-600">Premium products</p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default ServiceSection;
