const Order = require("../model/order.model");
const OrderItem = require("../model/orderitem.model");
const Product = require("../model/productmodel");
const Cart = require("../model/cart.model");
const CartItem = require("../model/cartitem.model");
const axios = require("axios");
const mongoose = require("mongoose");
const { generateAccessToken, PAYPAL_API } = require("../utils/paypal");
const { sendOrderEmail,sendOrderStatusUpdateEmail } = require("../utils/mailer");
const { verifyKhaltiPayment } = require("../utils/khalti");

const EXCHANGE_RATE_NPR_TO_USD = 135; 

exports.createOrder = async (req, res) => {
  try {
    console.log("📌 Creating order - Token User ID:", req.user?._id);

    const { productId, quantity, address, location, paymentMethod, color, size } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const userId = req.user._id.toString();

    const product = await Product.findById(productId);
    if (!product || product.totalQuantity < quantity) {
      return res.status(400).json({ error: "Product not available or insufficient stock" });
    }

    const variant = product.variants.find(v => v.color === color && v.size === size);
    if (!variant || variant.quantity < quantity) {
      return res.status(400).json({ error: "Selected variant is out of stock or insufficient" });
    }

    const totalAmount = quantity * product.price;

    // ✅ Create Order
    const order = new Order({
      userId,
      orderItems: [],
      totalAmount,
      address,
      location,
      paymentMethod,
      status: "Pending",
      paymentStatus: paymentMethod === "PayPal" ? "Paid" : "Pending",
      currency: "NPR"
    });

    await order.save();

    // ✅ Create OrderItem
    const orderItem = new OrderItem({
      orderId: order._id,
      productId,
      quantity,
      price: product.price,
      totalPrice: totalAmount,
      color,
      size
    });

    await orderItem.save();

    // ✅ Push OrderItem ID to Order
    order.orderItems.push(orderItem._id);
    await order.save();

    if (paymentMethod === "PayPal") {
      try {
        const accessToken = await generateAccessToken();
        const usdAmount = Number((totalAmount / EXCHANGE_RATE_NPR_TO_USD).toFixed(2)).toString();

        const paymentData = {
          intent: "sale",
          payer: { payment_method: "paypal" },
          redirect_urls: {
            return_url: `http://localhost:5173/paypal/success?orderId=${order._id}&userId=${userId}&productIds=${productId}`,
            cancel_url: "http://localhost:5173/paypal/cancel"
          },
          transactions: [
            {
              amount: {
                currency: "USD",
                total: usdAmount
              },
              description: `Payment for ${quantity} x ${product.productName}`
            }
          ]
        };

        const response = await axios.post(`${PAYPAL_API}/v1/payments/payment`, paymentData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        const approvalUrl = response.data.links.find(link => link.rel === "approval_url").href;

        return res.json({ message: "Redirect to PayPal", approvalUrl });

      } catch (paypalError) {
        console.error("❌ PayPal Payment Error:", paypalError.response?.data || paypalError.message);
        return res.status(500).json({ error: "PayPal payment initialization failed" });
      }
    }
    if (paymentMethod === "Khalti") {
  return res.status(201).json({
    message: "Proceed with Khalti",
    orderId: order._id,
    totalAmount,
    productName: product.productName
  });
}

    // ✅ Update product quantity for COD
    variant.quantity -= quantity;
    product.totalQuantity -= quantity;
    product.totalSold += quantity;
    await product.save();

    // ✅ Send order confirmation email with productDetails array
    await sendOrderEmail(req.user.email, {
      _id: order._id,
      productDetails: [
        {
          productName: product.productName,
          color,
          size,
          quantity,
          price: product.price,
          totalPrice: totalAmount
        }
      ],
      totalAmount,
      address,
      paymentMethod,
      status: order.status
    });

    return res.status(201).json({ message: "✅ Order placed successfully", order });

  } catch (error) {
    console.error("❌ Order Creation Error:", error);
    return res.status(500).json({ error: "Order creation failed" });
  }
};



exports.paypalSuccess = async (req, res) => {
  try {
    const { paymentId, PayerID, userId, orderItemIds, address, location, paymentMethod } = req.query;

    const accessToken = await generateAccessToken();
    if (!accessToken) {
      return res.status(500).json({ error: "Failed to generate PayPal access token" });
    }

    const executePaymentUrl = `${PAYPAL_API}/v1/payments/payment/${paymentId}/execute`;
    const executePaymentData = { payer_id: PayerID };

    const paymentResponse = await axios.post(executePaymentUrl, executePaymentData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (paymentResponse.data.state !== "approved") {
      return res.status(400).json({ error: "Payment not approved by PayPal" });
    }

    // Calculate total
    const orderItemIdsArray = orderItemIds.split(",");
    const orderItems = await OrderItem.find({ _id: { $in: orderItemIdsArray } });
    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Save order
    const order = new Order({
      userId,
      orderItems: orderItemIdsArray,
      totalAmount,
      address: decodeURIComponent(address),
      location: decodeURIComponent(location),
      paymentMethod,
      status: "Pending",
      paymentStatus: "Paid",
      currency: "NPR"
    });

    await order.save();

    // Link OrderItem with orderId
    await OrderItem.updateMany(
      { _id: { $in: orderItemIdsArray } },
      { $set: { orderId: order._id } }
    );

    const cart = await Cart.findOne({ userId }).populate("cartItems");
    if (cart) {
      const cartItemIdsToRemove = cart.cartItems
        .filter(item => orderItems.find(oi => oi.productId.toString() === item.productId.toString()))
        .map(item => item._id);
      await CartItem.deleteMany({ _id: { $in: cartItemIdsToRemove } });
    }

    return res.json({ message: "Payment successful", order });

  } catch (error) {
    console.error("❌ PayPal Success Error:", error);
    return res.status(500).json({ error: "Payment confirmation failed" });
  }
};


exports.verifyKhalti = async (req, res) => {
  try {
    const { token, amount, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const khaltiResponse = await verifyKhaltiPayment(token, amount);

    if (khaltiResponse.idx) {
      order.paymentStatus = "Paid";
      await order.save();

      return res.json({ message: "✅ Khalti payment verified", order });
    } else {
      return res.status(400).json({ error: "Invalid Khalti payment" });
    }
  } catch (error) {
    console.error("❌ Khalti verification error:", error.message);
    return res.status(500).json({ error: "Khalti verification failed" });
  }
};



exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      console.log("❌ Order not found for ID:", orderId);
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "Pending") {
      console.log("⚠️ Order is not pending. Current status:", order.status);
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }

    const orderItems = await OrderItem.find({ orderId });

    console.log(`📦 Found ${orderItems.length} order items for cancellation.`);

    for (const item of orderItems) {
      console.log(`🔄 Processing OrderItem: ${item._id}`);

      const product = await Product.findById(item.productId);
      if (!product) {
        console.warn(`❗ Product not found for ID: ${item.productId}`);
        continue;
      }

      const color = item.color?.toLowerCase?.();
      const size = item.size?.toLowerCase?.();
      const quantity = Number(item.quantity);

      console.log(`🧩 Looking for variant (color: ${color}, size: ${size}, quantity: ${quantity})`);

      const variantIndex = product.variants.findIndex(
        (variant) =>
          variant.color?.toLowerCase?.() === color &&
          variant.size?.toLowerCase?.() === size
      );

      if (variantIndex === -1) {
        console.warn("⚠️ Variant not matched! Skipping update.");
        continue;
      }

      const variant = product.variants[variantIndex];

      console.log("✅ Before Update - Variant Quantity:", variant.quantity);

      // 👉 Increase back variant quantity
      product.variants[variantIndex].quantity += quantity;
      product.markModified("variants");

      console.log("✅ After Update - Variant Quantity:", product.variants[variantIndex].quantity);

      // 👉 Adjust totalQuantity and totalSold
      product.totalQuantity += quantity;
      product.totalSold -= quantity;

      console.log("🔢 Product totalQuantity:", product.totalQuantity);
      console.log("🔢 Product totalSold:", product.totalSold);

      const saveResult = await product.save();
      console.log("💾 Product save result:", saveResult ? "Saved" : "Not saved");
    }

    // ✅ Update order status
    order.status = "Cancelled";
    await order.save();
    console.log("✅ Order status updated to Cancelled");

    return res.status(200).json({
      message: "✅ Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("❌ Order Cancellation Error:", error);
    return res.status(500).json({ error: "Something went wrong, please try again" });
  }
};



// Get All Orders for Logged-in User

exports.getOrders = async (req, res) => {
  try {
    console.log("🔵 Incoming request for orders...");

    if (!req.user || !req.user._id) {
      console.log("❌ Unauthorized: No valid user");
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Ensure userId is a valid ObjectId
    const userId = new mongoose.Types.ObjectId(req.user._id);
    console.log("🟢 Fetching orders for user:", userId);

    // Try fetching orders again
    const orders = await Order.find({ userId: userId })
      .populate({
        path: "orderItems",
        populate: { path: "productId", select: "productName price images" },
      })
      .sort({ createdAt: -1 });

    if (!orders.length) {
      console.log("⚠️ No orders found for user:", userId);
      return res.status(404).json({ message: "No orders found" });
    }

    console.log("✅ Orders retrieved:", orders.length);
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("❌ Get Orders Error:", error);
    return res.status(500).json({
      error: "Failed to retrieve orders",
      details: error.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    console.log("📌 Fetching all orders...");

    const orders = await Order.find()
      .populate({
        path: "userId",
        select: "name email", // Fetch user details
      })
      .populate({
        path: "orderItems",
        populate: {
          path: "productId",
          select: "_id productName price images ", // Fetch product details
        },
      })
      .sort({ createdAt: -1 }); // Sort orders by latest

    return res
      .status(200)
      .json({ message: "✅ Orders fetched successfully", orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};



exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status update" });
    }

    const order = await Order.findById(orderId)
      .populate({
        path: "userId",
        select: "name email",
      })
      .populate({
        path: "orderItems",
        populate: {
          path: "productId",
          select: "_id productName price images",
        },
      });

    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.status === "Cancelled") {
      return res
        .status(400)
        .json({ error: "Cannot update a cancelled order" });
    }

    order.status = status;
    await order.save();

    // Send Email to user about status change
    await sendOrderStatusUpdateEmail(order.userId.email, order);

    return res
      .status(200)
      .json({ message: `✅ Order status updated to ${status}`, order });
  } catch (error) {
    console.error("❌ Order Status Update Error:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong, please try again" });
  }
};
