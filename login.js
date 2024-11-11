document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            alert('Login successful');
            // เปลี่ยนเส้นทางไปยังหน้าหลักหรือหน้าที่ต้องการ
            window.location.href = 'main.html';
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
    }
});

// Function to show reset password form and hide login form
function showResetForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('reset-form').style.display = 'block';
}

// Function to show login form and hide reset password form
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('reset-form').style.display = 'none';
}

document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            alert('Login successful');
            localStorage.setItem('username', data.username); // บันทึกชื่อผู้ใช้ลงใน localStorage
            window.location.href = 'main.html'; // เปลี่ยนเส้นทางไปยังหน้าหลัก
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
    }
});


document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        let response;
        if (username === 'admin01') {
            // Admin login
            response = await fetch('http://localhost:3000/api/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
        } else {
            // Customer login
            response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
        }

        if (response.ok) {
            if (username === 'admin01') {
                window.location.href = 'admin.html'; // เปลี่ยนเส้นทางไปยังหน้าสำหรับแอดมิน
            } else {
                window.location.href = 'main.html'; // เปลี่ยนเส้นทางไปยังหน้าหลัก
            }
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
    }
});



