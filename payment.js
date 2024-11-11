document.addEventListener('DOMContentLoaded', async function () {
    const orderItemsContainer = document.getElementById('order-items');
    const totalPriceElement = document.getElementById('total-price');
    const deliveryOptions = document.getElementsByName('deliveryOption');
    const addressDetails = document.getElementById('address-details');
    const paymentOptions = document.getElementsByName('paymentMethod');
    const creditCardDetails = document.getElementById('credit-card-details');
    const promptpayDetails = document.getElementById('promptpay-details');
    const truemoneyDetails = document.getElementById('truemoney-details');
    const otpSection = document.getElementById('otp-section');
    const placeOrderButton = document.getElementById('placeOrderButton');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;

    // แสดงรายการในตะกร้า
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ราคา: ${item.price} บาท - จำนวน: ${item.quantity}`;
        orderItemsContainer.appendChild(li);
        total += item.price * item.quantity;
    });

    totalPriceElement.textContent = total;

    // แสดงหรือซ่อนกล่องที่อยู่ตามการเลือกวิธีการรับ
    if (deliveryOptions) {
        deliveryOptions.forEach(option => {
            option.addEventListener('change', function () {
                addressDetails.style.display = (option.value === 'delivery' && option.checked) ? 'block' : 'none';
            });
        });
    }

    // แสดงหรือซ่อนการกรอกข้อมูลบัตรเครดิต, QR Code Promptpay, หรือ Truemoney Wallet ตามการเลือกชำระเงิน
    if (paymentOptions) {
        paymentOptions.forEach(option => {
            option.addEventListener('change', function () {
                creditCardDetails.style.display = 'none';
                promptpayDetails.style.display = 'none';
                truemoneyDetails.style.display = 'none';

                if (option.value === 'credit-card' && option.checked) {
                    creditCardDetails.style.display = 'block';
                } else if (option.value === 'promptpay' && option.checked) {
                    promptpayDetails.style.display = 'block';
                } else if (option.value === 'wallet' && option.checked) {
                    truemoneyDetails.style.display = 'block';
                }
            });
        });
    }

    // ขอ OTP
    const requestOtpButton = document.getElementById('request-otp');
    if (requestOtpButton) {
        requestOtpButton.addEventListener('click', function () {
            const phoneNumber = document.getElementById('truemoney-phone').value.trim();
            if (!phoneNumber || phoneNumber.length !== 10 || isNaN(phoneNumber)) {
                alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
                return;
            }

            // แสดงส่วน OTP
            otpSection.style.display = 'block';
            alert('รหัส OTP ถูกส่งไปยังเบอร์โทรศัพท์ของคุณแล้ว');
        });
    }

    // ยืนยัน OTP
    const confirmOtpButton = document.getElementById('confirm-otp');
    if (confirmOtpButton) {
        confirmOtpButton.addEventListener('click', function () {
            const otpCode = document.getElementById('otp-code').value.trim();
            if (!otpCode || otpCode.length !== 6 || isNaN(otpCode)) {
                alert('กรุณากรอก OTP ให้ถูกต้อง');
                return;
            }

            alert('การชำระเงินด้วย Truemoney Wallet เสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ');
            localStorage.removeItem('cart');
            window.location.href = 'order-status.html';
        });
    }

    // ฟังก์ชันสั่งซื้อสินค้า
    const placeOrderElement = document.getElementById('place-order');
    if (placeOrderElement) {
        placeOrderElement.addEventListener('click', function () {
            const selectedDeliveryOption = document.querySelector('input[name="deliveryOption"]:checked');
            if (selectedDeliveryOption && selectedDeliveryOption.value === 'delivery') {
                const deliveryAddress = document.getElementById('delivery-address').value.trim();
                if (!deliveryAddress) {
                    alert('กรุณากรอกรายละเอียดที่อยู่สำหรับการจัดส่ง');
                    return;
                }
            }

            alert('การสั่งซื้อเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ');
            localStorage.removeItem('cart');
            window.location.href = 'main.html';
        });
    }

    // ฟังก์ชันแสดงสรุปรายการสั่งซื้อ
    function displayOrderSummary() {
        const summaryContainer = document.getElementById('orderSummary');
        if (summaryContainer) {
            let total = 0;
            summaryContainer.innerHTML = "";

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                summaryContainer.innerHTML += `<p>${item.name} x${item.quantity} ราคา ${itemTotal} บาท</p>`;
            });

            summaryContainer.innerHTML += `<p><strong>ราคารวม: ${total} บาท</strong></p>`;
        }
    }

    displayOrderSummary();

    // ฟังก์ชันสั่งซื้อและส่งไปยังเซิร์ฟเวอร์
    async function placeOrder() {
        console.log("Placing order...");
    
        const items = cart.map(item => ({
            productName: item.name,
            quantity: item.quantity,
            price: item.price
        }));
        const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
        localStorage.setItem('lastOrder', JSON.stringify({ items, totalAmount }));
        window.location.href = 'order.html';
    }
    
    if (placeOrderButton) {
        placeOrderButton.addEventListener('click', placeOrder);
    }

    // แสดงรายการสั่งซื้อจากฐานข้อมูล
    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
            throw new Error('Failed to fetch order data');
        }

        const orders = await response.json();
        console.log('Orders from MongoDB:', orders);

        if (orders.length > 0) {
            const lastOrder = orders[orders.length - 1];
            let total = 0;

            lastOrder.items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.productName} - ราคา: ${item.price} บาท - จำนวน: ${item.quantity}`;
                orderItemsContainer.appendChild(li);
                total += item.price * item.quantity;
            });

            totalPriceElement.textContent = total;
        } else {
            orderItemsContainer.innerHTML = '<li>ไม่มีรายการสั่งซื้อ</li>';
        }
    } catch (error) {
        console.error('Error loading order summary:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลการสั่งซื้อ');
    }
});
