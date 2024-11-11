let cart = JSON.parse(localStorage.getItem('cart')) || [];

function toggleCart() {
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer.style.display === 'none') {
        cartContainer.style.display = 'block';
        renderCartItems();
    } else {
        cartContainer.style.display = 'none';
    }
}

function searchMenu() {
    const searchText = document.getElementById('search-menu').value.toLowerCase().trim();
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        const itemName = item.querySelector('button').getAttribute('data-name').toLowerCase();
        if (itemName.includes(searchText)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}


// ฟังก์ชันแสดงรายการสินค้าในตะกร้า
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    cartItemsContainer.innerHTML = ''; // ล้างรายการเก่า
    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('cart-item');
        li.innerHTML = `
            <div class="cart-item-container">
                <div class="cart-item-details">
                    <p><strong>${item.name}</strong> - ราคา: ${item.price} บาท</p>
                    <p>รายละเอียด: ${item.details || 'ไม่มีรายละเอียด'}</p>
                    <p>ช้อนส้อม: ${item.fork ? item.fork : 'ไม่ระบุ'}</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
        `;
        li.style.marginBottom = '20px'; // เพิ่มช่องว่างระหว่างรายการ
        cartItemsContainer.appendChild(li);
        total += item.price * item.quantity;
    });

    totalElement.textContent = total; // อัปเดตราคารวม
}



function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}


// ฟังก์ชันเพิ่มหรือลดจำนวนสินค้า
// ฟังก์ชันเพิ่มหรือลดจำนวนสินค้าในตะกร้า
function updateQuantity(index, change) {
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
    } else {
        cart.splice(index, 1); // ลบรายการออกถ้าจำนวนเป็น 0
    }

    localStorage.setItem('cart', JSON.stringify(cart)); // อัปเดตใน localStorage
    updateCartCount(); // อัปเดตจำนวนในไอคอนรถเข็น
    renderCartItems(); // แสดงรายการในตะกร้าใหม่
}
// ฟังก์ชันเพิ่มสินค้าเข้าตะกร้า
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function () {
        const itemName = this.getAttribute('data-name');
        const itemPrice = parseInt(this.getAttribute('data-price'), 10);
        const existingItem = cart.find(item => item.name === itemName);

        if (existingItem) {
            existingItem.quantity++; // ถ้ามีสินค้าอยู่แล้ว เพิ่มจำนวน
        } else {
            cart.push({ name: itemName, price: itemPrice, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems(); // แสดงรายการตะกร้าทันทีที่เพิ่ม
    });
});


// ฟังก์ชันอัปเดตจำนวนสินค้าในไอคอนรถเข็น
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// เรียกใช้งานฟังก์ชันเมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', function () {
    updateCartCount();
    renderCartItems();
});



// ฟังก์ชันล้างตะกร้า
document.getElementById('clear-cart').addEventListener('click', function () {
    cart = [];
    localStorage.removeItem('cart'); // ลบข้อมูลตะกร้าใน localStorage
    renderCartItems(); // แสดงตะกร้าที่ว่างเปล่า
    updateCartCount(); // อัปเดตจำนวนในตะกร้าเป็น 0
    alert('ตะกร้าสินค้าถูกล้างแล้ว');
});

// ฟังก์ชันสั่งซื้อสินค้า (ตัวอย่าง)
// ฟังก์ชันสั่งซื้อสินค้า
document.getElementById('checkout').addEventListener('click', async function () {
    if (cart.length === 0) {
        alert('ตะกร้าสินค้าของคุณว่างเปล่า');
    } else {
        const username = localStorage.getItem('username') || 'guest';
        const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

        // เตรียมข้อมูลที่จะส่งไปยัง MongoDB
        const orderData = {
            items: cart.map(item => ({
                productName: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
        };

        try {
            // ส่งคำสั่งซื้อไปยัง MongoDB ผ่าน API
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                alert('สั่งซื้อสินค้าสำเร็จ! ข้อมูลถูกบันทึกในระบบแล้ว');
                // ล้างตะกร้า
                cart = [];
                localStorage.removeItem('cart');
                renderCartItems();
                updateCartCount();

                // เปลี่ยนเส้นทางไปยังหน้า payment.html
                window.location.href = 'payment.html';
            } else {
                alert('เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        }
    }
});




// ฟังก์ชันเพิ่มสินค้าเข้าตะกร้า
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function () {
        const itemName = this.getAttribute('data-name');
        const itemPrice = parseInt(this.getAttribute('data-price'), 10);
        const itemDetails = document.getElementById('item-details').value; // รายละเอียดของอาหาร
        const forkIncluded = document.getElementById('fork-option').checked; // ตรวจสอบว่ารับช้อนส้อมหรือไม่
        const itemQuantity = parseInt(document.getElementById('item-quantity').value, 10); // จำนวนที่เลือก

        // เพิ่มรายการใหม่ทุกครั้งที่ผู้ใช้กดเพิ่มเข้าตะกร้า
        cart.push({
            name: itemName,
            price: itemPrice,
            quantity: itemQuantity,
            details: itemDetails,
            fork: forkIncluded ? 'รับช้อนส้อม' : 'ไม่รับช้อนส้อม'
        });

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(); // อัปเดตจำนวนในไอคอนรถเข็น
        renderCartItems(); // แสดงรายการตะกร้าทันทีที่เพิ่ม
    });
});

// Get the modal
var modal = document.getElementById("addToCartModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Get the confirm button
var confirmButton = document.getElementById('confirm-add-to-cart');

// Get quantity, details and fork option inputs
var quantityInput = document.getElementById('quantity');
var detailsInput = document.getElementById('item-details');
var forkCheckbox = document.getElementById('fork-option');

let selectedItem = null; // เก็บข้อมูลของสินค้าที่เลือก

// ฟังก์ชันเปิด Modal และเก็บสินค้าที่เลือก
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function () {
        selectedItem = {
            name: this.getAttribute('data-name'),
            price: parseInt(this.getAttribute('data-price'), 10)
        };
        modal.style.display = "block"; // แสดง modal
    });
});

// ฟังก์ชันปิด Modal
span.onclick = function() {
    modal.style.display = "none";
}

// เมื่อกดนอก Modal ให้ปิด
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// ฟังก์ชันยืนยันการเพิ่มสินค้าเข้าตะกร้า
confirmButton.addEventListener('click', function() {
    const itemName = selectedItem.name;
    const itemPrice = selectedItem.price;
    const itemQuantity = parseInt(quantityInput.value, 10);
    const itemDetails = detailsInput.value;
    const forkIncluded = forkCheckbox.checked;
    const itemImage = selectedItem.image; // จัดเก็บ URL ของรูปภาพของรายการที่เลือก

    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.quantity = itemQuantity; // แทนที่ด้วยจำนวนใหม่ที่ผู้ใช้เลือก
        existingItem.details = itemDetails;
        existingItem.fork = forkIncluded ? 'รับช้อนส้อม' : 'ไม่รับช้อนส้อม';
        existingItem.image = itemImage; // แทนที่รูปภาพด้วย URL เดิม
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            quantity: itemQuantity,
            details: itemDetails,
            fork: forkIncluded ? 'รับช้อนส้อม' : 'ไม่รับช้อนส้อม',
            image: itemImage // จัดเก็บ URL รูปภาพของรายการ
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();

    // ปิด modal หลังจากยืนยันการเพิ่ม
    modal.style.display = "none";
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

const priceSlider = document.getElementById('price-range');
const minPriceValue = document.getElementById('min-price-value');
const maxPriceValue = document.getElementById('max-price-value');

// Update input fields when slider changes
priceSlider.addEventListener('input', function () {
    const minValue = Math.min(parseInt(priceSlider.value), parseInt(maxPriceValue.value));
    const maxValue = Math.max(parseInt(priceSlider.value), parseInt(minPriceValue.value));

    minPriceValue.value = minValue;
    maxPriceValue.value = maxValue;

    filterByPrice();
});

// Update slider when input fields change
minPriceValue.addEventListener('input', function () {
    if (parseInt(minPriceValue.value) > parseInt(maxPriceValue.value)) {
        minPriceValue.value = maxPriceValue.value; // Ensure min doesn't exceed max
    }
    priceSlider.value = minPriceValue.value;
    filterByPrice();
});

maxPriceValue.addEventListener('input', function () {
    if (parseInt(maxPriceValue.value) < parseInt(minPriceValue.value)) {
        maxPriceValue.value = minPriceValue.value; // Ensure max doesn't go below min
    }
    priceSlider.value = maxPriceValue.value;
    filterByPrice();
});

// Function to filter menu items based on selected price range
function filterByPrice() {
    const minPrice = parseInt(minPriceValue.value, 10);
    const maxPrice = parseInt(maxPriceValue.value, 10);

    document.querySelectorAll('.menu-item').forEach(item => {
        const itemPrice = parseInt(item.querySelector('button').getAttribute('data-price'), 10);
        if (itemPrice >= minPrice && itemPrice <= maxPrice) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}


document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');
    if (username) {
        const loginLink = document.querySelector('.login-link');
        loginLink.textContent = username;
        loginLink.removeAttribute('href'); // นำลิงก์ออกเพื่อไม่ให้กดได้
    }
    updateCartCount();
    renderCartItems();
});

document.getElementById('checkout').addEventListener('click', function () {
    if (cart.length === 0) {
        alert('ตะกร้าสินค้าของคุณว่างเปล่า');
    } else {
        const username = localStorage.getItem('username');
        const orderId = 'ORD' + Date.now(); // สร้างหมายเลขคำสั่งซื้อแบบง่าย
        const orderDate = new Date().toLocaleString(); // วันที่และเวลา
        const phoneNumber = 'เบอร์ที่ระบุ'; // สมมติว่าเบอร์โทรมีการระบุไว้ตอนลงทะเบียน
        const orderItems = cart.map(item => `${item.name} (${item.quantity})`).join(', '); // รายการอาหาร

        // สร้างข้อมูลคำสั่งซื้อ
        const order = {
            orderId,
            orderDate,
            username,
            phoneNumber,
            orderItems,
            status: 'กำลังตรวจสอบ', // สถานะเริ่มต้น
        };

        // เก็บข้อมูลคำสั่งซื้อใน Local Storage
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // ล้างตะกร้า
        cart = [];
        localStorage.removeItem('cart');
        renderCartItems();
        updateCartCount();

        alert('สั่งซื้อสินค้าสำเร็จ!');

        // เปลี่ยนเส้นทางไปยังหน้า payment.html
        window.location.href = 'payment.html';
    }
});
