import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/Shopcontext";
import ReviewSection from "../component/ReviewSection";
import { useNavigate, Link } from "react-router-dom";
import ProductItem from "../component/ProductItem";
import Pagination from "../component/Pagination"; // Import the Pagination component



const Product = () => {
  const { productId } = useParams();
  const { products, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sizes, setSizes] = useState("");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");
  // const [showReviews, setShowReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Track pagination page

  const itemsPerPage = 5; // Number of products per page
  // const [selectedColor, setSelectedColor] = useState([]);

  const fetchProductData = async () => {
    const foundProduct = products.find((item) => item._id === productId); // ✅ Finds the first matching product

    if (foundProduct) {
      setProductData(foundProduct);
      setImage(foundProduct.image[0]);
      console.log(foundProduct);
    }
  };

  const relatedProducts = products.filter(
    (item) => item.category === productData?.category && item._id !== productId
  );

  // **Paginate Related Products**
  const totalPages = Math.ceil(relatedProducts.length / itemsPerPage);
  const paginatedProducts = relatedProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  return productData ? (
    <div className=" pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-5 flex-col sm:flex-row">
        {/* Product Image */}
        <div className="flex-1  gap-3 sm:flex-row">
          <div className="w-full">
            <img
              className="w-full sm:w-[95%] h-auto sm:h-[90%]"
              src={image}
              alt=""
            />
          </div>
          <div className=" hover:transition-110 grid grid-cols-4 gap-4 mt-4  justify-between sm:justify-normal sm:w-[80%] w-[70%]">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[60%] sm:w-full sm:mb-3  cursor-pointer"
              />
            ))}
          </div>
        </div>
        {/* Product Info */}
        <div className="flex-1 space-y-6">
          <h1 className="font-bold text-4xl mt-2">{productData.name}</h1>
          <p className="text-3xl font-bold text-red-600">
            Rs. {productData.price}
          </p>
          <div>
            <p className="text-xl font-semibold">Description:</p>
            <p className="gap-t-1 mt-3 text-base text-gray-600 md:w-4/5">
              {productData.description}
            </p>
          </div>

          {/* Size Selection */}
          <div>
            <p className="font-medium  text-xl mb-2 ">Select Size:</p>
            <div className="flex gap-3 m-y-5">
              {productData.sizes.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2  hover:bg-gray-600 hover:text-white rounded-md ${
                    selectedSize === size
                      ? "bg-black text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* 
          <div className="mt-4">
            <div className="flex gap-2">
              {productData.colors?.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-black scale-110"
                      : "border-gray-300"
                  } transition-transform`}
                  style={{ backgroundColor: { color } }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div> */}

          {/* Quantity Selector */}
          <div className="flex items-center gap-3  my-7">
            <p className="font-medium"></p>
            <button
              className="px-3 py-1 bg-gray-200 rounded-md cursor-pointer"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            >
              -
            </button>
            <span className="px-4 py-1 bg-gray-200 rounded-md ">
              {quantity}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded-md cursor-pointer"
              onClick={() => setQuantity((prev) => prev + 1)}
            >
              +
            </button>
          </div>
          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() =>
                addToCart(
                  productData._id,
                  selectedSize,
                  quantity,
                  productData.name,
                  productData.price,
                  productData.image[0]
                )
              }
              className="bg-black text-white cursor-pointer px-8 py-3 rounded-md font-medium hover:bg-gray-700"
            >
              Add to Cart
            </button>
            <Link to={"/placeOrder"}>
              <button className="bg-yellow-500 cursor-pointer text-white px-8 py-3 rounded-md font-medium  hover:bg-yellow-700">
                Order Now
              </button>
            </Link>
          </div>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-400 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description and Reviews Section */}
      <div className="mt-20 border-gray-300 border-b items-center justify-center">
        <div className="flex border-b border-gray-300">
          <button
            className={`px-6 py-3 text-base font-semibold ${
              activeTab === "description"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("description")}
          >
            DESCRIPTION
          </button>
          <button
            className={`px-6 py-3 text-base font-semibold ${
              activeTab === "additional"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("additional")}
          >
            ADDITIONAL INFORMATION
          </button>
          <button
            className={`px-6 py-3 text-base font-semibold ${
              activeTab === "reviews"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            REVIEWS (0)
          </button>
          <button
            className={`px-6 py-3 text-base font-semibold ${
              activeTab === "shipping"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("shipping")}
          >
            SHIPPING & DELIVERY
          </button>
        </div>

        {/* Content for each tab */}
        <div className="py-8 px-4">
          {activeTab === "description" && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Going for a more casual look? You cannot thumb your noses at
                these minimal pair of microfiber casuals from Caliber which is
                fantastic at portraying a casual yet neat look. Slide this
                sneaker on for an easy footwear option that can be styled with
                anything.
              </p>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">COMFORTABLE FIT</h3>
                <p className="text-gray-700">
                  The lace-up closure and closed toe style gives your feet a
                  perfect fit to the shoe.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">IMPRESSIVE DESIGN</h3>
                <p className="text-gray-700">
                  Keeping in mind the latest trends in fashion, this sleek pair
                  adds to the style of the outfit. The ways these can be worn
                  are virtually endless, thanks to the stylish street style
                  circuits we're continuously blessed with.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">MADE FOR COMFORT</h3>
                <p className="text-gray-700">
                  Sneakers are designed to give maximum comfort.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">CARE INSTRUCTIONS</h3>
                <p className="text-gray-700">
                  Allow your pair of footwear to air and deodorize at regular
                  basis; use shoe bags to prevent any stains or mildew; dust any
                  dry dirt from the surface using a clean cloth.
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <ReviewSection reviews={productData.reviews || []} />
          )}

          {activeTab === "shipping" && (
            <>
              <p>Delivery within 3-7 business days.</p>
              <p>Free shipping on orders over Rs. 2000.</p>
              <p>Easy return and exchange within 7 days of delivery.</p>
            </>
          )}
        </div>
      </div>

      {/* Related Products */}
      {/* Related Products Section with Pagination */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-5">Related Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            ))
          ) : (
            <p className="text-gray-500">No related products found.</p>
          )}
        </div>

        {/* Use the Pagination Component */}
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
