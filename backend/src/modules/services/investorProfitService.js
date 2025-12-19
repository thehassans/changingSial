import User from "../models/User.js";
import Order from "../models/Order.js";

/**
 * Assign investor profit to an order when delivered
 * Distributes profit to the first active investor (FIFO by createdAt)
 * @param {Object} order - The order document
 * @param {String} ownerId - The workspace owner ID
 * @returns {Object|null} The updated investor or null if none eligible
 */
export async function assignInvestorProfitToOrder(order, ownerId) {
  try {
    if (!order || !ownerId) return null;

    // Find the first active investor for this workspace (FIFO by createdAt)
    const investor = await User.findOne({
      role: "investor",
      createdBy: ownerId,
      "investorProfile.status": "active",
    }).sort({ createdAt: 1 });

    if (!investor) {
      console.log("[InvestorProfit] No active investor found for workspace:", ownerId);
      return null;
    }

    const profile = investor.investorProfile || {};
    const profitPercentage = Number(profile.profitPercentage || 0);
    const profitTarget = Number(profile.profitAmount || 0);
    const currentEarned = Number(profile.earnedProfit || 0);

    if (profitPercentage <= 0) {
      console.log("[InvestorProfit] Investor has 0% profit percentage, skipping");
      return null;
    }

    // Calculate profit for this order
    const orderTotal = Number(order.total || 0);
    const profitAmount = Math.round((orderTotal * profitPercentage / 100) * 100) / 100;

    if (profitAmount <= 0) {
      return null;
    }

    // Update investor's earned profit
    const newEarned = currentEarned + profitAmount;
    investor.investorProfile.earnedProfit = newEarned;
    investor.investorProfile.totalReturn = Number(profile.investmentAmount || 0) + newEarned;

    // Check if profit target reached
    if (profitTarget > 0 && newEarned >= profitTarget) {
      investor.investorProfile.status = "completed";
      investor.investorProfile.completedAt = new Date();
      console.log(`[InvestorProfit] Investor ${investor.email} completed profit target!`);
    }

    investor.markModified("investorProfile");
    await investor.save();

    // Store profit reference on order
    order.investorProfit = {
      investor: investor._id,
      profitAmount,
      profitPercentage,
    };
    await order.save();

    console.log(`[InvestorProfit] Assigned ${profitAmount} profit to investor ${investor.email}`);
    return investor;
  } catch (error) {
    console.error("[InvestorProfit] Error assigning profit:", error);
    return null;
  }
}

/**
 * Get profit statistics for an investor
 * @param {String} investorId
 * @returns {Object} Stats object with orders count, total profit, etc.
 */
export async function getInvestorProfitStats(investorId) {
  try {
    const orders = await Order.find({
      "investorProfit.investor": investorId,
    }).select("total investorProfit createdAt").lean();

    const totalOrders = orders.length;
    const totalProfit = orders.reduce((sum, o) => sum + (o.investorProfit?.profitAmount || 0), 0);

    return {
      totalOrders,
      totalProfit,
      orders: orders.slice(-10), // Last 10 orders
    };
  } catch (error) {
    console.error("[InvestorProfit] Error getting stats:", error);
    return { totalOrders: 0, totalProfit: 0, orders: [] };
  }
}
