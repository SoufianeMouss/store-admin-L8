<template>
  <div class="order-detail" v-if="orderExists">
    <div class="action-button">
      <button @click="completeOrder" class="button">Process Order</button>
    </div>
    <br/>
    <div class="order-header">
      <p><b>Order ID:</b> {{ order.orderId }}</p>
      <p><b>Customer ID:</b> {{ order.customerId }}</p>
      <p><b>Status:</b> {{ statusLabel(order.status) }}</p>
    </div>
    <div class="order-items">
      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tr v-for="item in order.items" :key="item.productId">
          <td>
            <router-link :to="`/product/${item.productId}`">
              {{ item.productId }}
            </router-link>
          </td>
          <td>{{ productLookup(item.productId) }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.price.toFixed(2) }}</td>
          <td>{{ (item.quantity * item.price).toFixed(2) }}</td>
        </tr>
        <tfoot>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td><b>{{ orderTotal() }}</b></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
  <div class="order-detail" v-else>
    <h3>Opps! That order was not found...</h3>
  </div>
</template>

<script>
export default {
  name: 'OrderDetail',
  props: ['orders', 'products'],
  data() {
    return {
      order: null
    }
  },
  computed: {
    orderExists() {
      return !!this.order
    }
  },
  mounted() {
    this.getOrder()
  },
  methods: {
    getOrder() {
      // Try to get the order from the prop first
      this.order = this.orders.find(
        order => order.orderId === this.$route.params.id
      )

      if (!this.order) {
        // Fallback: fetch from makeline-service
        fetch(`/makeline/order/${this.$route.params.id}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok')
            }
            if (response.status === 204) {
              return null
            }
            return response.json()
          })
          .then(data => {
            if (data) {
              this.order = data
            } else {
              console.log('No orders from server')
            }
          })
          .catch(error => console.error(error))
      }

      return this.order
    },

    async completeOrder() {
      if (!this.order) return

      try {
        const res = await fetch('/makeline/order', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: this.order.orderId,
            customerId: this.order.customerId,
            items: this.order.items,
            status: 1 //Processing = ready to ship
          })
        })

        if (!res.ok) {
          throw new Error('Failed to complete order')
        }

        // Update local state so UI reflects new status
        this.order.status = 1

        alert(`Order ${this.order.orderId}  marked as processed (ready to ship)`)

        // Optional: navigate back to orders list
        // this.$router.push('/orders')
      } catch (err) {
        console.error(err)
        alert('Error completing order')
      }
    },

    productLookup(id) {
      const product = this.products.find(product => product.id === id)
      return product ? product.name : 'Unknown product'
    },

    orderTotal() {
      let total = 0
      if (this.order && this.order.items) {
        this.order.items.forEach(item => {
          total += item.price * item.quantity
        })
      }
      return total.toFixed(2)
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
a {
  color: #0000FF;
  text-decoration: underline;
}

.order-detail {
  text-align: left;
}
</style>
