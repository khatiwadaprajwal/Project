import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Truck, 
  DollarSign,
  ArrowLeft
} from "lucide-react";
import axios from "axios";

const PlaceOrder = () => {
  const { cartData, token, delivery_fee } = useContext(ShopContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: ""
  });

  // Location state (in a real app, you might get this from a map component)
  const [location] = useState({
    lat: 0,
    lng: 0
  });

  useEffect(() => {
    // Retrieve selected items from localStorage
    const storedItems = localStorage.getItem("selectedCartItems");
    if (!storedItems) {
      toast.error("No items selected for checkout");
      navigate("/cart");
      return;
    }

    try {
      const parsedItems = JSON.parse(storedItems);
      setSelectedItems(parsedItems);
      
      // Filter cart data to get only selected items
      const productsToOrder = cartData.filter(item => 
        parsedItems.includes(item.itemId)
      );
      
      if (productsToOrder.length === 0) {
        toast.error("Selected products not found in cart");
        navigate("/cart");
        return;
      }
      
      setSelectedProducts(productsToOrder);
    } catch (error) {
      console.error("Error parsing selected items:", error);
      toast.error("Something went wrong. Please try again.");
      navigate("/cart");
    }
  }, [cartData, navigate]);

  // Calculate order summary
  const subtotal = selectedProducts.reduce((total, item) => 
    total + (item.price * item.quantity), 0);
  const total = subtotal + delivery_fee;

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    for (const [key, value] of Object.entries(shippingInfo)) {
      if (!value.trim()) {
        toast.error(`Please enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      // Format address
      const formattedAddress = `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.phone}`;
      
      // Format selected products for API
      const productsForAPI = selectedProducts.map(item => ({
        productId: item.itemId,
        quantity: item.quantity
      }));
      
      // Create order data
      const orderData = {
        selectedProducts: productsForAPI,
        address: formattedAddress,
        location,
        paymentMethod
      };
      
      // Place order
      const response = await axios.post(
        "http://localhost:3001/v1/placeorder",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Clear the selectedCartItems from localStorage after successful order placement
      localStorage.removeItem("selectedCartItems");
      
      if (response.data.approvalUrl) {
        // For PayPal, redirect to the approval URL
        openPayPalPopup(response.data.approvalUrl);
      } else {
        // For other payment methods, navigate to order confirmation
        toast.success("Order placed successfully!");
        navigate("/order", { state: { order: response.data.order } });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error.response?.data?.error || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  const openPayPalPopup = (approvalUrl) => {
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
  
    const paypalWindow = window.open(
      approvalUrl,
      "PayPal Payment",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );
  
    // Check if the window was successfully opened
    if (!paypalWindow) {
      toast.error("Popup blocked! Please allow popups and try again.");
      return;
    }
  
    // Polling to check if the window is closed
    const interval = setInterval(() => {
      if (paypalWindow.closed) {
        clearInterval(interval);
        toast.success("Payment processing completed!");
  
        // Redirect to the order page
        navigate("/order");
      }
    }, 1000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/cart')}
        className="flex items-center text-blue-600 mb-4 hover:text-blue-800"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Cart
      </button>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping Information */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 text-blue-600" />
              Shipping Information
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4 col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4 col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <h2 className="text-xl font-semibold mb-4 mt-6 flex items-center">
                <CreditCard className="mr-2 text-blue-600" />
                Payment Method
              </h2>
              
              <div className="flex flex-col space-y-3 mb-6">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash"
                    checked={paymentMethod === "Cash"}
                    onChange={() => setPaymentMethod("Cash")}
                    className="mr-2"
                  />
                  <DollarSign size={20} className="mr-2 text-green-600" />
                  <span>Cash on Delivery</span>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PayPal"
                    checked={paymentMethod === "PayPal"}
                    onChange={() => setPaymentMethod("PayPal")}
                    className="mr-2"
                  />
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.55 3H16.45C19.97 3 22 5.03 22 8.55V15.45C22 18.97 19.97 21 16.45 21H7.55C4.03 21 2 18.97 2 15.45V8.55C2 5.03 4.03 3 7.55 3Z" fill="#003087" />
                    <path d="M7.35 11.27L8.72 6.44C8.88 5.85 9.41 5.5 10.01 5.5H13.59C14.31 5.5 14.84 5.86 14.96 6.51C15.08 7.16 14.78 7.86 14.24 8.31C13.55 8.88 12.56 9.19 11.55 9.19H9.82L9.3 11.27C9.21 11.71 9.54 12 10 12H10.78C11.01 12 11.15 12.2 11.09 12.42L10.9 13.19C10.84 13.41 10.63 13.58 10.39 13.58H9.35C9.11 13.58 8.94 13.78 8.89 14.01L8.75 14.59C8.7 14.82 8.86 15 9.09 15H11.2C11.59 15 11.95 15.2 12.11 15.56L12.33 16.03C12.42 16.22 12.27 16.5 12.05 16.5H10.39C10.16 16.5 9.97 16.29 9.92 16.06L9.35 13.66C9.3 13.43 9.11 13.19 8.87 13.19H8.2C7.98 13.19 7.84 13.01 7.84 12.78L8.05 11.79C8.14 11.53 8.3 11.27 8.53 11.27H7.35Z" fill="#FFFFFF" />
                  </svg>
                  <span>PayPal</span>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || selectedProducts.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {isLoading ? "Processing..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="mr-2 text-blue-600" />
              Order Summary
            </h2>
            
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Items ({selectedProducts.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedProducts.map((item) => (
                  <div key={item.itemId} className="flex items-center">
                    <img
                      src={`http://localhost:3001/public/${item.image[0]}`}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md mr-3"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        <span>Rs. {item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center">
                  <Truck size={14} className="mr-1" />
                  Shipping
                </span>
                <span>Rs. {delivery_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default PlaceOrder;