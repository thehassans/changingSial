# 📡 BuySial Management System - Comprehensive API List

> [!NOTE]
> **API Overview**
> This document provides a complete reference for the backend API endpoints. The system uses RESTful architecture with JSON responses and JWT-based authentication.

**Base URL**: `https://web.buysial.com/api` (Production) / `http://localhost:5001/api` (Development)

---

## 🔐 Authentication Module (`/api/auth`)

Handles user identification and access control.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Authenticate user and receive JWT. Supports generic and customer login types. | **Public** |
| `POST` | `/register` | Register a new customer account. | **Public** |
| `POST` | `/register-investor` | Self-signup for investors with referral support. | **Public** |
| `POST` | `/seed-admin` | Initialize the first admin account (Dev helper). | **Public** |
| `GET` | `/referral/resolve` | Get user details from a referral code. | **Public** |

---

## 🛒 E-Commerce Module (`/api/ecommerce`)

Public user facing endpoints for the online store.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Submit a new public order (Guest checkout). | **Public** |
| `GET` | `/orders` | List and filter ecommerce orders. | **Auth (Admin/Mgr/User)** |
| `GET` | `/orders/options` | Get available countries and cities for filters. | **Auth (Admin/Mgr/User)** |
| `GET` | `/orders/export` | Export filtered orders as CSV. | **Auth (Admin/Mgr/User)** |
| `PATCH` | `/orders/:id` | Update order status (e.g., Cancelled, Done). | **Auth (Admin/Mgr/User)** |
| `POST` | `/orders/:id/assign-driver`| Assign a driver to a specific web order. | **Auth (Admin/Mgr/User)** |

---

## � Orders Management (`/api/orders`)

Internal order processing for manual/agent orders.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Retrieve all orders with pagination and advanced filtering. | **Auth** |
| `POST` | `/` | Create a new manual order. | **Auth (Agent/Admin)** |
| `GET` | `/:id` | Get detailed order view. | **Auth** |
| `PATCH` | `/:id` | Update delivery status or details. | **Auth** |
| `DELETE`| `/:id` | Soft delete an order. | **Auth (Admin)** |

---

## 👥 User Management (`/api/users`)

Manage system users (Agents, Drivers, Managers).

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List users by role (e.g., `?role=driver`). | **Auth (Admin)** |
| `GET` | `/me` | Get current user profile. | **Auth** |
| `POST` | `/` | Create a new internal user (Manager, Driver, Agent). | **Auth (Admin)** |
| `PATCH` | `/:id` | Update user profile or settings. | **Auth** |
| `GET` | `/drivers/finances` | Get financial summary for drivers (Payable/Receivable).| **Auth (Manager)** |

---

## 🏭 Products & Inventory (`/api/products`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all products. | **Public/Auth** |
| `POST` | `/` | Add a new product (In-house or Dropshipping). | **Auth (Admin)** |
| `PUT` | `/:id` | Update product details (Price, Stock, Image). | **Auth (Admin)** |
| `DELETE`| `/:id` | Remove a product. | **Auth (Admin)** |

---

## � Finance & Reports (`/api/finance`, `/api/reports`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/transactions` | View all financial transactions (Remittances). | **Auth (Admin/Mgr)** |
| `POST` | `/remit` | Process a remittance (Driver -> Company). | **Auth (Mgr)** |
| `GET` | `/dashboard` | High-level financial overview for dashboard. | **Auth (Admin)** |
| `GET` | `/reports/daily` | Generate daily sales and performance reports. | **Auth (Admin)** |

---

## 📍 Geocoding & Logistics (`/api/geocode`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/search` | Search for an address or coordinates. | **Auth** |
| `POST` | `/optimize` | Optimize delivery route for multiple orders. | **Auth (Driver)** |

---

## 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Get recent notifications for the logged-in user. | **Auth** |
| `POST` | `/mark-read` | Mark notifications as read. | **Auth** |

---

## ⚙️ Settings (`/api/settings`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/config` | Get public system configuration. | **Public** |
| `PATCH` | `/currency` | Update base currency exchange rates. | **Auth (Admin)** |
| `PATCH` | `/labels` | Customize shipping label format. | **Auth (Admin)** |

---

*Verified API Documentation • 2025*
