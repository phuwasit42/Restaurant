// ฟังก์ชันดึงข้อมูลคำสั่งซื้อจาก MongoDB
async function fetchOrders() {
    try {
        const response = await fetch('/api/admin/orders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const orders = await response.json();
        renderOrderHistory(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}


// ฟังก์ชันแสดงข้อมูลคำสั่งซื้อในตาราง
function renderOrderHistory(orders) {
    const orderTable = document.getElementById('order-table');
    orderTable.innerHTML = '';
    
    orders.forEach((order, index) => {
        const itemsDetails = order.items.map(item => `${item.productName} x${item.quantity} (฿${item.price * item.quantity})`).join('<br>');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${order._id}</td>
            <td>${new Date(order.createdAt).toLocaleDateString('th-TH')}</td>
            <td>${order.phone || 'ไม่ระบุ'}</td>
            <td>${itemsDetails}</td>
            <td>${order.status}</td>
            <td>
                <select onchange="updateOrderStatus('${order._id}', this.value)">
                    <option value="รับออเดอร์แล้ว" ${order.status === 'รับออเดอร์แล้ว' ? 'selected' : ''}>รับออเดอร์แล้ว</option>
                    <option value="กำลังปรุง" ${order.status === 'กำลังปรุง' ? 'selected' : ''}>กำลังปรุง</option>
                    <option value="กำลังจัดส่ง" ${order.status === 'กำลังจัดส่ง' ? 'selected' : ''}>กำลังจัดส่ง</option>
                    <option value="สำเร็จ" ${order.status === 'สำเร็จ' ? 'selected' : ''}>สำเร็จ</option>
                </select>
            </td>
        `;
        orderTable.appendChild(row);
    });
}

// ฟังก์ชันสำหรับอัปเดตสถานะคำสั่งซื้อ
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            console.log(`Order ${orderId} status updated to ${newStatus}`);
            fetchOrders(); // รีเฟรชข้อมูลคำสั่งซื้อหลังจากอัปเดต
        } else {
            console.error('Failed to update order status');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

document.getElementById('logout-btn').addEventListener('click', function () {
    // Clear admin data from localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    // Redirect to login page
    window.location.href = 'login.html';
});


// โหลดคำสั่งซื้อเมื่อเปิดหน้า
document.addEventListener('DOMContentLoaded', fetchOrders);