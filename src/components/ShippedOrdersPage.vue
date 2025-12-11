<template>
  <div class="shipped-page">
    <h2>Shipping Management</h2>
    <p>
      These orders are <strong>processed</strong> and ready to be shipped.
      Click <em>Mark as Shipped</em> to complete them.
    </p>

    <div v-if="loading" class="status">Loading processed orders...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="orders.length === 0" class="status">
      No processed orders waiting for shipment.
    </div>

    <table v-else class="orders-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Items</th>
          <th>Total</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(order, index) in orders" :key="order.orderId">
          <td>{{ order.orderId }}</td>
          <td>{{ order.customerId }}</td>
          <td>{{ order.items?.length || 0 }}</td>
          <td>
            {{
              order.items
                ? order.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  ).toFixed(2)
                : '0.00'
            }}
          </td>
          <td>{{ statusLabel(order.status) }}</td>
          <td>
            <button @click="shipOrder(order, index)">Mark as Shipped</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ShippedOrdersPage',
  data() {
    return {
      orders: [],
      loading: false,
      error: null
    }
  },
  mounted() {
    this.fetchProcessedOrders()
  },
  methods: {
    async fetchProcessedOrders() {
      this.loading = true
      this.error = null
      try {
        // Status=1 => Processing (i.e. ready to ship)
        const res = await fetch('/makeline/order?status=1')
        if (!res.ok) throw new Error('Failed to load processed orders')
        this.orders = await res.json()
      } catch (err) {
        console.error(err)
        this.error = 'Could not load processed orders'
      } finally {
        this.loading = false
      }
    },
    async shipOrder(order, index) {
      try {
        const res = await fetch('/makeline/order', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.orderId,
            customerId: order.customerId,
            items: order.items,
            status: 2 // Complete = shipped
          })
        })
        if (!res.ok) throw new Error('Failed to update order')

        // Remove from list once shipped
        this.orders.splice(index, 1)
        alert(`Order ${order.orderId} marked as shipped`)
      } catch (err) {
        console.error(err)
        alert('Error marking order as shipped')
      }
    },
    statusLabel(status) {
      if (status === 0) return 'Pending'
      if (status === 1) return 'Processing'
      if (status === 2) return 'Complete / Shipped'
      return status
    }
  }
}
</script>

<style scoped>
.shipped-page {
  padding: 2rem;
}

.status {
  margin-top: 1rem;
  font-size: 0.95rem;
}

.status.error {
  color: #c62828;
}

.orders-table {
  width: 100%;
  margin-top: 1.5rem;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.orders-table th,
.orders-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.orders-table th {
  background-color: #f5f5f5;
}

.orders-table tr:hover {
  background-color: #f9f9f9;
}

button {
  padding: 6px 10px;
  font-size: 0.85rem;
  background-color: #0046be;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #003399;
}
</style>
