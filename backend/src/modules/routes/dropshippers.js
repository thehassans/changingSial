import express from "express";
import { auth, allowRoles } from "../middleware/auth.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const router = express.Router();

// Dashboard Statistics
router.get("/dashboard", auth, allowRoles("dropshipper"), async (req, res) => {
  try {
    const userId = req.user.id;

    // Counts by shipment status
    const statusCounts = await Order.aggregate([
      { $match: { createdBy: userId } }, // Assuming dropshippers see only their own orders
      { $group: { _id: "$shipmentStatus", count: { $sum: 1 } } },
    ]);

    const stats = {
      pending: 0,
      assigned: 0,
      picked_up: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };

    statusCounts.forEach((s) => {
      if (stats.hasOwnProperty(s._id)) {
        stats[s._id] = s.count;
      }
    });

    // Total orders
    const totalOrders = await Order.countDocuments({ createdBy: userId });

    // Financials
    // Calculate total profit from delivered orders
    const financialStats = await Order.aggregate([
      {
        $match: {
          createdBy: userId,
          shipmentStatus: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$dropshipperProfit.amount" },
          paidProfit: {
            $sum: {
              $cond: [{ $eq: ["$dropshipperProfit.isPaid", true] }, "$dropshipperProfit.amount", 0],
            },
          },
          pendingProfit: {
            $sum: {
              $cond: [{ $eq: ["$dropshipperProfit.isPaid", false] }, "$dropshipperProfit.amount", 0],
            },
          },
        },
      },
    ]);

    const finances = financialStats[0] || {
      totalProfit: 0,
      paidProfit: 0,
      pendingProfit: 0,
    };

    res.json({
      success: true,
      stats: {
        ...stats,
        totalOrders,
      },
      finances,
    });
  } catch (error) {
    console.error("Dropshipper Dashboard Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

// Financials / Amounts Page
router.get("/finances", auth, allowRoles("dropshipper"), async (req, res) => {
  try {
     const page = Math.max(1, Number(req.query.page || 1));
     const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
     const skip = (page - 1) * limit;

     const query = {
       createdBy: req.user.id,
       shipmentStatus: "delivered" // Only delivered orders count for profit
     };

     const total = await Order.countDocuments(query);
     const orders = await Order.find(query)
       .select("invoiceNumber customerName dropshipperProfit total deliveredAt")
       .sort({ deliveredAt: -1 })
       .skip(skip)
       .limit(limit)
       .lean();
      
      // Calculate summary
      const summaryAgg = await Order.aggregate([
        { $match: query },
        { $group: { 
            _id: null, 
            totalAmount: { $sum: "$dropshipperProfit.amount" },
            paidAmount: { $sum: { $cond: ["$dropshipperProfit.isPaid", "$dropshipperProfit.amount", 0] } },
            unpaidAmount: { $sum: { $cond: ["$dropshipperProfit.isPaid", 0, "$dropshipperProfit.amount"] } }
        }}
      ]);
      const summary = summaryAgg[0] || { totalAmount: 0, paidAmount: 0, unpaidAmount: 0 };

     res.json({
       orders,
       summary,
       pagination: {
         page,
         limit,
         total,
         pages: Math.ceil(total / limit)
       }
     });

  } catch (error) {
    console.error("Dropshipper Finances Error:", error);
    res.status(500).json({ message: "Failed to fetch finances" });
  }
});

export default router;
