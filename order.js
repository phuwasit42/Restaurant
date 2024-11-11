

document.addEventListener('DOMContentLoaded', async function () {
    const orderTableBody = document.getElementById('order-table');

    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
            throw new Error('Failed to fetch order data');
        }

        const orders = await response.json();
        console.log('Orders from MongoDB:', orders); // ตรวจสอบข้อมูลที่โหลดมาจาก MongoDB

        if (orders.length > 0) {
            orders.forEach((order, index) => {
                const orderDate = new Date(order.createdAt).toLocaleDateString('th-TH');
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${order._id}</td>
                    <td>${orderDate}</td>
                    <td>
                        <ul>
                            ${order.items.map(item => `<li>${item.productName} x ${item.quantity} (ราคา: ${item.price} บาท)</li>`).join('')}
                        </ul>
                    </td>
                    <td>${order.status || 'กำลังตรวจสอบ'}</td>
                `;
                orderTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6">ไม่มีประวัติการสั่งซื้อ</td>`;
            orderTableBody.appendChild(row);
        }
    } catch (error) {
        console.error('Error loading order data:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลการสั่งซื้อ');
    }
});
