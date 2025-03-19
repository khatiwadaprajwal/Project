import React from "react";

const AdditionalInfo = ({ productData }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-md p-4">
          <h3 className="font-medium text-gray-900">Category</h3>
          <p className="text-gray-700 mt-1">{productData.category}</p>
        </div>
        <div className="border border-gray-200 rounded-md p-4">
          <h3 className="font-medium text-gray-900">Gender</h3>
          <p className="text-gray-700 mt-1">{productData.gender}</p>
        </div>
        <div className="border border-gray-200 rounded-md p-4">
          <h3 className="font-medium text-gray-900">Available Sizes</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {productData.size.map((s) => (
              <span key={s} className="bg-gray-100 px-2 py-1 rounded text-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="border border-gray-200 rounded-md p-4">
          <h3 className="font-medium text-gray-900">Available Colors</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {productData.color.map((c, index) => (
              <span key={index} className="flex items-center gap-1">
                <span
                  className="inline-block h-4 w-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: c.toLowerCase() }}
                ></span>
                <span className="text-sm">{c}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfo;