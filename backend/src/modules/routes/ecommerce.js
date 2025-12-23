import express from "express";
import mongoose from "mongoose";
import WebOrder from "../models/WebOrder.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { auth, allowRoles } from "../middleware/auth.js";

const ObjectId = mongoose.Types.ObjectId;

const router = express.Router();

// POST /api/ecommerce/orders (public)
router.post("/orders", async (req, res) => {
  try {
    const {
      customerName = "",
      customerPhone = "",
      phoneCountryCode = "",
      orderCountry = "",
      city = "",
      area = "",
      address = "",
      details = "",
      items = [],
      currency = "SAR",
      customerId = null, // Optional: if customer is logged in
    } = req.body || {};

    if (!customerName.trim())
      return res.status(400).json({ message: "Name is required" });
    if (!customerPhone.trim())
      return res.status(400).json({ message: "Phone is required" });
    if (!orderCountry.trim())
      return res.status(400).json({ message: "Country is required" });
    if (!city.trim())
      return res.status(400).json({ message: "City is required" });
    if (!address.trim())
      return res.status(400).json({ message: "Address is required" });

    // Normalize items
    const norm = Array.isArray(items) ? items : [];
    if (norm.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const ids = norm.map((i) => i && i.productId).filter(Boolean);
    const prods = await Product.find({
      _id: { $in: ids },
      displayOnWebsite: true,
    });
    const byId = Object.fromEntries(prods.map((p) => [String(p._id), p]));
    let total = 0;
    const orderItems = [];
    for (const it of norm) {
      const p = byId[String(it.productId)];
      if (!p)
        return res
          .status(400)
          .json({ message: "One or more products not available" });
      const qty = Math.max(1, Number(it.quantity || 1));
      const unit = Number(p.price || 0);
      total += unit * qty;
      orderItems.push({
        productId: p._id,
        name: p.name || "",
        price: unit,
        quantity: qty,
      });
    }

    const doc = new WebOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      phoneCountryCode: String(phoneCountryCode || "").trim(),
      orderCountry: orderCountry.trim(),
      city: city.trim(),
      area: String(area || "").trim(),
      address: address.trim(),
      details: String(details || "").trim(),
      customerId: customerId && mongoose.isValidObjectId(customerId) ? new ObjectId(customerId) : null, // Link to customer if provided
      items: orderItems,
      total: Math.max(0, Number(total || 0)),
      currency: String(currency || "SAR"),
      status: "new",
    });
    await doc.save();
    return res.status(201).json({ message: "Order received", order: doc });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to submit order", error: err?.message });
  }
});

// POST /api/ecommerce/customer/orders - Create order for logged-in customer
router.post(
  "/customer/orders",
  auth,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const customerId = req.user.id;
      const customer = await User.findById(customerId).select("firstName lastName phone email").lean();
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const {
        address = "",
        city = "",
        area = "",
        orderCountry = "",
        details = "",
        items = [],
        currency = "SAR",
      } = req.body || {};

      if (!address.trim())
        return res.status(400).json({ message: "Address is required" });
      if (!city.trim())
        return res.status(400).json({ message: "City is required" });
      if (!orderCountry.trim())
        return res.status(400).json({ message: "Country is required" });

      const norm = Array.isArray(items) ? items : [];
      if (norm.length === 0)
        return res.status(400).json({ message: "Cart is empty" });

      const ids = norm.map((i) => i && i.productId).filter(Boolean);
      const prods = await Product.find({
        _id: { $in: ids },
        displayOnWebsite: true,
      });
      const byId = Object.fromEntries(prods.map((p) => [String(p._id), p]));
      let total = 0;
      const orderItems = [];
      for (const it of norm) {
        const p = byId[String(it.productId)];
        if (!p)
          return res.status(400).json({ message: "One or more products not available" });
        const qty = Math.max(1, Number(it.quantity || 1));
        const unit = Number(p.price || 0);
        total += unit * qty;
        orderItems.push({
          productId: p._id,
          name: p.name || "",
          price: unit,
          quantity: qty,
        });
      }

      const doc = new WebOrder({
        customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || "Customer",
        customerPhone: customer.phone || "",
        customerId: customerId,
        orderCountry: orderCountry.trim(),
        city: city.trim(),
        area: String(area || "").trim(),
        address: address.trim(),
        details: String(details || "").trim(),
        items: orderItems,
        total: Math.max(0, Number(total || 0)),
        currency: String(currency || "SAR"),
        status: "new",
      });
      await doc.save();
      return res.status(201).json({ message: "Order placed successfully", order: doc });
    } catch (err) {
      return res.status(500).json({ 
        message: "Failed to submit order", 
        error: err?.message 
      });
    }
  }
);

// Distinct options: countries and cities for ecommerce orders
router.get(
  "/orders/options",
  auth,
  allowRoles("admin", "user", "manager"),
  async (req, res) => {
    try {
      const countryParam = String(req.query.country || "").trim();
      const countriesRaw = (await WebOrder.distinct("orderCountry", {})).filter(
        Boolean
      );
      const countries = Array.from(new Set(countriesRaw)).sort();
      const matchCity = {};
      if (countryParam) matchCity.orderCountry = countryParam;
      const cities = (await WebOrder.distinct("city", matchCity))
        .filter(Boolean)
        .sort();
      return res.json({ countries, cities });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to load options", error: err?.message });
    }
  }
);
// GET /api/ecommerce/orders (admin/user/manager)
router.get(
  "/orders",
  auth,
  allowRoles("admin", "user", "manager"),
  async (req, res) => {
    try {
      const {
        q = "",
        status = "",
        start = "",
        end = "",
        product = "",
        ship = "",
        country = "",
        city = "",
        onlyUnassigned = "",
      } = req.query || {};
      const match = {};
      if (q) {
        const rx = new RegExp(
          String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
        match.$or = [
          { customerName: rx },
          { customerPhone: rx },
          { address: rx },
          { city: rx },
          { area: rx },
          { details: rx },
          { "items.name": rx },
        ];
      }
      if (status) match.status = status;
      if (ship) match.shipmentStatus = ship;
      if (country) match.orderCountry = country;
      if (city) match.city = city;
      if (String(onlyUnassigned).toLowerCase() === "true")
        match.deliveryBoy = { $in: [null, undefined] };
      if (start || end) {
        match.createdAt = {};
        if (start) match.createdAt.$gte = new Date(start);
        if (end) match.createdAt.$lte = new Date(end);
      }
      if (product) {
        match["items.productId"] = product;
      }

      const page = Math.max(1, Number(req.query.page || 1));
      const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
      const skip = (page - 1) * limit;
      const total = await WebOrder.countDocuments(match);
      const rows = await WebOrder.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("deliveryBoy", "firstName lastName email city");
      const hasMore = skip + rows.length < total;
      return res.json({ orders: rows, page, limit, total, hasMore });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to load online orders", error: err?.message });
    }
  }
);

// GET /api/ecommerce/orders/export — export filtered orders as CSV
router.get(
  "/orders/export",
  auth,
  allowRoles("admin", "user", "manager"),
  async (req, res) => {
    try {
      const {
        q = "",
        status = "",
        start = "",
        end = "",
        product = "",
        ship = "",
        country = "",
        city = "",
        onlyUnassigned = "",
      } = req.query || {};
      const match = {};
      if (q) {
        const rx = new RegExp(
          String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
        match.$or = [
          { customerName: rx },
          { customerPhone: rx },
          { address: rx },
          { city: rx },
          { area: rx },
          { details: rx },
          { "items.name": rx },
        ];
      }
      if (status) match.status = status;
      if (ship) match.shipmentStatus = ship;
      if (country) match.orderCountry = country;
      if (city) match.city = city;
      if (String(onlyUnassigned).toLowerCase() === "true")
        match.deliveryBoy = { $in: [null, undefined] };
      if (start || end) {
        match.createdAt = {};
        if (start) match.createdAt.$gte = new Date(start);
        if (end) match.createdAt.$lte = new Date(end);
      }
      if (product) {
        match["items.productId"] = product;
      }

      const cap = Math.min(10000, Math.max(1, Number(req.query.max || 10000)));
      const rows = await WebOrder.find(match)
        .sort({ createdAt: -1 })
        .limit(cap)
        .populate("deliveryBoy", "firstName lastName email city")
        .lean();

      const esc = (v) => {
        if (v == null) return "";
        const s = String(v);
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      };
      const fmtDate = (d) => {
        try {
          return new Date(d).toISOString();
        } catch {
          return "";
        }
      };
      const itemsToText = (items) => {
        try {
          const arr = Array.isArray(items) ? items : [];
          return arr
            .map(
              (it) =>
                `${it?.name || ""} x${Math.max(
                  1,
                  Number(it?.quantity || 1)
                )}@${Number(it?.price || 0).toFixed(2)}`
            )
            .join("; ");
        } catch {
          return "";
        }
      };

      const header = [
        "OrderID",
        "CreatedAt",
        "Status",
        "ShipmentStatus",
        "Country",
        "City",
        "Area",
        "Address",
        "Customer",
        "PhoneCode",
        "Phone",
        "Currency",
        "Total",
        "Items",
        "ItemsCount",
        "DriverName",
        "DriverCity",
      ];
      const lines = [header.join(",")];
      for (const r of rows) {
        const driverName = r?.deliveryBoy
          ? `${r.deliveryBoy.firstName || ""} ${
              r.deliveryBoy.lastName || ""
            }`.trim()
          : "";
        const itemsTxt = itemsToText(r?.items);
        const itemsCount = Array.isArray(r?.items)
          ? r.items.reduce(
              (s, it) => s + Math.max(1, Number(it?.quantity || 1)),
              0
            )
          : 0;
        const line = [
          esc(r?._id),
          esc(fmtDate(r?.createdAt)),
          esc(r?.status || ""),
          esc(r?.shipmentStatus || ""),
          esc(r?.orderCountry || ""),
          esc(r?.city || ""),
          esc(r?.area || ""),
          esc(r?.address || ""),
          esc(r?.customerName || ""),
          esc(r?.phoneCountryCode || ""),
          esc(r?.customerPhone || ""),
          esc(r?.currency || "SAR"),
          esc(Number(r?.total || 0).toFixed(2)),
          esc(itemsTxt),
          esc(itemsCount),
          esc(driverName),
          esc(r?.deliveryBoy?.city || ""),
        ].join(",");
        lines.push(line);
      }

      const csv = "\ufeff" + lines.join("\n");
      const ts = new Date().toISOString().slice(0, 10);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="web-orders-${ts}.csv"`
      );
      return res.status(200).send(csv);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to export orders", error: err?.message });
    }
  }
);

// PATCH /api/ecommerce/orders/:id (update status)
router.patch(
  "/orders/:id",
  auth,
  allowRoles("admin", "user", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, shipmentStatus } = req.body || {};
      const allowed = ["new", "processing", "done", "cancelled"];
      if (status && !allowed.includes(String(status)))
        return res.status(400).json({ message: "Invalid status" });
      const allowedShip = [
        "pending",
        "assigned",
        "picked_up",
        "in_transit",
        "delivered",
        "returned",
        "cancelled",
      ];
      if (shipmentStatus && !allowedShip.includes(String(shipmentStatus)))
        return res.status(400).json({ message: "Invalid shipment status" });
      const ord = await WebOrder.findById(id);
      if (!ord) return res.status(404).json({ message: "Order not found" });
      if (status) ord.status = status;
      if (shipmentStatus) ord.shipmentStatus = shipmentStatus;
      await ord.save();
      return res.json({ message: "Updated", order: ord });
    } catch (err) {
      return res
        .status(500)
        .json({
          message: "Failed to update online order",
          error: err?.message,
        });
    }
  }
);

// Assign driver to an online (web) order
router.post(
  "/orders/:id/assign-driver",
  auth,
  allowRoles("admin", "user", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { driverId } = req.body || {};
      if (!driverId)
        return res.status(400).json({ message: "driverId required" });
      const ord = await WebOrder.findById(id);
      if (!ord) return res.status(404).json({ message: "Order not found" });
      const driver = await User.findById(driverId);
      if (!driver || driver.role !== "driver")
        return res.status(400).json({ message: "Driver not found" });

      // Workspace scoping similar to /api/orders
      if (req.user.role === "user") {
        if (String(driver.createdBy) !== String(req.user.id))
          return res.status(403).json({ message: "Not allowed" });
      } else if (req.user.role === "manager") {
        const mgr = await User.findById(req.user.id).select(
          "createdBy assignedCountry"
        );
        const ownerId = String(mgr?.createdBy || "");
        if (!ownerId || String(driver.createdBy) !== ownerId)
          return res.status(403).json({ message: "Not allowed" });
        if (mgr?.assignedCountry) {
          if (driver.country && driver.country !== mgr.assignedCountry) {
            return res
              .status(403)
              .json({
                message: `Manager can only assign drivers from ${mgr.assignedCountry}`,
              });
          }
          if (ord.orderCountry && ord.orderCountry !== mgr.assignedCountry) {
            return res
              .status(403)
              .json({
                message: `Manager can only assign to orders from ${mgr.assignedCountry}`,
              });
          }
        }
      }

      // City rule: enforce order city matches driver city if provided
      if (
        driver.city &&
        ord.city &&
        String(driver.city).toLowerCase() !== String(ord.city).toLowerCase()
      ) {
        return res
          .status(400)
          .json({ message: "Driver city does not match order city" });
      }

      ord.deliveryBoy = driver._id;
      if (!ord.shipmentStatus || ord.shipmentStatus === "pending")
        ord.shipmentStatus = "assigned";
      await ord.save();
      await ord.populate("deliveryBoy", "firstName lastName email city");
      return res.json({ message: "Driver assigned", order: ord });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to assign driver", error: err?.message });
    }
  }
);

// ============================================
// CUSTOMER PORTAL ENDPOINTS
// ============================================

// GET /api/ecommerce/customer/orders - Get logged-in customer's orders
router.get(
  "/customer/orders",
  auth,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const customerId = req.user.id;
      const { status = "", page = 1, limit = 20 } = req.query || {};
      
      // Query both string and ObjectId for backwards compatibility
      const match = { 
        $or: [
          { customerId: customerId }, // String match (old orders)
          { customerId: new ObjectId(customerId) } // ObjectId match (new orders)
        ]
      };
      if (status) match.status = status;
      
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(50, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * limitNum;
      
      const total = await WebOrder.countDocuments(match);
      const orders = await WebOrder.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("deliveryBoy", "firstName lastName phone")
        .lean();
      
      const hasMore = skip + orders.length < total;
      
      return res.json({ orders, page: pageNum, limit: limitNum, total, hasMore });
    } catch (err) {
      return res.status(500).json({ 
        message: "Failed to load orders", 
        error: err?.message 
      });
    }
  }
);

// GET /api/ecommerce/customer/orders/:id - Get single order with tracking
router.get(
  "/customer/orders/:id",
  auth,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const customerId = req.user.id;
      
      const order = await WebOrder.findOne({ _id: id, customerId })
        .populate("deliveryBoy", "firstName lastName phone")
        .lean();
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Build tracking timeline
      const timeline = [];
      timeline.push({
        status: "ordered",
        label: "Order Placed",
        date: order.createdAt,
        completed: true
      });
      
      if (order.status === "processing" || order.shipmentStatus !== "pending") {
        timeline.push({
          status: "processing",
          label: "Order Confirmed",
          date: order.updatedAt,
          completed: true
        });
      }
      
      if (order.shipmentStatus === "assigned" || order.deliveryBoy) {
        timeline.push({
          status: "assigned",
          label: "Driver Assigned",
          date: order.updatedAt,
          completed: true,
          driver: order.deliveryBoy ? {
            name: `${order.deliveryBoy.firstName || ''} ${order.deliveryBoy.lastName || ''}`.trim(),
            phone: order.deliveryBoy.phone
          } : null
        });
      }
      
      if (order.shipmentStatus === "picked_up" || order.shipmentStatus === "in_transit") {
        timeline.push({
          status: "in_transit",
          label: "Out for Delivery",
          date: order.updatedAt,
          completed: true
        });
      }
      
      if (order.shipmentStatus === "delivered") {
        timeline.push({
          status: "delivered",
          label: "Delivered",
          date: order.updatedAt,
          completed: true
        });
      }
      
      return res.json({ order, timeline });
    } catch (err) {
      return res.status(500).json({ 
        message: "Failed to load order", 
        error: err?.message 
      });
    }
  }
);

// GET /api/ecommerce/customer/profile - Get customer profile
router.get(
  "/customer/profile",
  auth,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const customer = await User.findById(req.user.id)
        .select("-password")
        .lean();
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Get order stats - query both string and ObjectId for backwards compatibility
      const orderStats = await WebOrder.aggregate([
        { $match: { $or: [{ customerId: String(customer._id) }, { customerId: customer._id }] } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: "$total" },
            pendingOrders: {
              $sum: { $cond: [{ $in: ["$status", ["new", "processing"]] }, 1, 0] }
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ["$shipmentStatus", "delivered"] }, 1, 0] }
            }
          }
        }
      ]);
      
      const stats = orderStats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        deliveredOrders: 0
      };
      
      return res.json({ customer, stats });
    } catch (err) {
      return res.status(500).json({ 
        message: "Failed to load profile", 
        error: err?.message 
      });
    }
  }
);

export default router;
