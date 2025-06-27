document.addEventListener('DOMContentLoaded', () => {

    // --- SIMULACIÓN DE DATOS ---
    const menuItems = [
        { id: 1, name: 'Spaghetti Carbonara', category: 'pastas', price: 18, description: 'Pasta con huevo, queso pecorino, guanciale y pimienta negra.', image: 'https://images.unsplash.com/photo-1608796837873-a3d7d7457a43?auto=format&fit=crop&q=80&w=1974' },
        { id: 2, name: 'Pizza Margherita', category: 'pizzas', price: 15, description: 'Salsa de tomate San Marzano, mozzarella fresca, albahaca y aceite de oliva.', image: 'https://images.unsplash.com/photo-1598021680133-eb3a38043645?auto=format&fit=crop&q=80&w=1964' },
        { id: 3, name: 'Bruschetta al Pomodoro', category: 'entradas', price: 9, description: 'Pan tostado con tomates frescos, ajo, albahaca y aceite de oliva.', image: 'https://images.unsplash.com/photo-1579631542720-3a838317e579?auto=format&fit=crop&q=80&w=2070' },
        { id: 4, name: 'Lasagna alla Bolognese', category: 'pastas', price: 20, description: 'Capas de pasta con ragú de carne, bechamel y queso Parmigiano Reggiano.', image: 'https://images.unsplash.com/photo-1619895092494-11c5a931619e?auto=format&fit=crop&q=80&w=1974' },
        { id: 5, name: 'Pizza Prosciutto e Funghi', category: 'pizzas', price: 19, description: 'Mozzarella, jamón cocido, champiñones frescos y salsa de tomate.', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1981' }
    ];
    
    // Simulación de disponibilidad de mesas
    const tablesData = [
        { id: 1, name: "T1", status: "available" }, { id: 2, name: "T2", status: "occupied" },
        { id: 3, name: "T3", status: "available" }, { id: 4, name: "T4", status: "available" },
        { id: 5, name: "T5", status: "available" }, { id: 6, name: "T6", status: "occupied" },
        { id: 7, name: "T7", status: "occupied" }, { id: 8, name: "T8", status: "available" },
        { id: 9, name: "T9", status: "available" }, { id: 10, name: "T10", status: "available" },
        { id: 11, name: "T11", status: "occupied" }, { id: 12, name: "T12", status: "available" }
    ];

    let cart = JSON.parse(localStorage.getItem('virgilioCart')) || [];
    let loggedInUser = JSON.parse(localStorage.getItem('virgilioUser')) || null;
    
    // --- FUNCIONES GENERALES ---
    const showToast = (message) => {
        const toast = document.getElementById('toast-notification');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    const updateUIForUser = () => {
        const userActionBtn = document.getElementById('user-action-btn');
        if (loggedInUser) {
            userActionBtn.textContent = `Hola, ${loggedInUser.name.split(' ')[0]}`;
            userActionBtn.dataset.page = 'profile';
        } else {
            userActionBtn.textContent = 'Iniciar Sesión';
            userActionBtn.dataset.page = 'login';
        }
    };

    // --- NAVEGACIÓN ---
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('nav a, .btn[data-page], #mobile-menu a');

    const showPage = (pageId) => {
        pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            window.scrollTo(0, 0);
            if (pageId === 'reservations') {
                renderTableMap();
            }
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            if (pageId === 'login' && !loggedInUser) {
                document.getElementById('login-modal').style.display = 'block';
            } else if (pageId) {
                showPage(pageId);
            }
        });
    });
    
    // --- MENÚ HAMBURGUESA ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    hamburgerBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
    });

    // --- LÓGICA DE RESERVAS ---
    const tableMap = document.getElementById('table-map');
    const selectedTableDisplay = document.getElementById('selected-table-display');
    const selectedTableInput = document.getElementById('selected-table-input');
    const reservationForm = document.getElementById('reservation-form');

    const renderTableMap = () => {
        tableMap.innerHTML = '';
        tablesData.forEach(table => {
            const tableEl = document.createElement('div');
            tableEl.classList.add('table-seat', table.status);
            tableEl.dataset.tableId = table.id;
            tableEl.textContent = table.name;
            tableMap.appendChild(tableEl);
        });
    };

    tableMap.addEventListener('click', (e) => {
        const clickedTable = e.target;
        if (clickedTable.classList.contains('available')) {
            const currentSelected = tableMap.querySelector('.selected');
            if (currentSelected) {
                currentSelected.classList.remove('selected');
            }
            clickedTable.classList.add('selected');
            const tableId = clickedTable.dataset.tableId;
            const tableName = tablesData.find(t => t.id == tableId).name;
            
            selectedTableDisplay.textContent = tableName;
            selectedTableInput.value = tableId;
        } else if (clickedTable.classList.contains('occupied')) {
            showToast('Esta mesa ya se encuentra ocupada.');
        }
    });

    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedTableInput.value) {
            showToast('Por favor, selecciona una mesa disponible.');
            return;
        }
        showToast(`Reserva para la mesa ${selectedTableDisplay.textContent} recibida. Recibirás una confirmación pronto.`);
        e.target.reset();
        selectedTableDisplay.textContent = 'Ninguna';
        selectedTableInput.value = '';
        renderTableMap();
    });
    
    // --- LÓGICA DE MENÚ Y CARRITO ---
    const menuGrid = document.getElementById('menu-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const renderMenu = (filter = 'all') => {
        menuGrid.innerHTML = '';
        const filteredItems = filter === 'all' ? menuItems : menuItems.filter(item => item.category === filter);
        filteredItems.forEach(item => {
            menuGrid.innerHTML += `
                <div class="menu-card">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="menu-card-content">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <div class="menu-card-footer">
                            <span class="menu-card-price">$${item.price}</span>
                            <button class="btn add-to-cart-btn" data-id="${item.id}">Añadir</button>
                        </div>
                    </div>
                </div>
            `;
        });
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMenu(btn.dataset.filter);
        });
    });

    const cartSidebar = document.getElementById('cart-sidebar');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const cartCounterEl = document.getElementById('cart-counter');

    const updateCart = () => {
        cartItemsContainer.innerHTML = '';
        let totalPrice = 0;
        if(cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color: #666;">Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                cartItemsContainer.innerHTML += `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>$${item.price} x ${item.quantity}</p>
                        </div>
                        <div class="cart-item-actions">
                            <button class="remove-from-cart-btn" data-id="${item.id}">&times;</button>
                        </div>
                    </div>
                `;
                totalPrice += item.price * item.quantity;
            });
        }
        cartTotalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
        cartCounterEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        localStorage.setItem('virgilioCart', JSON.stringify(cart));
    };

    menuGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = parseInt(e.target.dataset.id);
            const menuItem = menuItems.find(item => item.id === id);
            const cartItem = cart.find(item => item.id === id);
            if (cartItem) {
                cartItem.quantity++;
            } else {
                cart.push({ ...menuItem, quantity: 1 });
            }
            updateCart();
            showToast(`${menuItem.name} añadido al pedido.`);
        }
    });
    
    cartItemsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('remove-from-cart-btn')) {
            const id = parseInt(e.target.dataset.id);
            cart = cart.filter(item => item.id !== id);
            updateCart();
        }
    });

    document.getElementById('cart-icon').addEventListener('click', () => cartSidebar.classList.add('open'));
    document.getElementById('close-cart').addEventListener('click', () => cartSidebar.classList.remove('open'));

    // --- LÓGICA DE MODALES Y AUTENTICACIÓN ---
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close-btn');

    closeBtns.forEach(btn => btn.addEventListener('click', () => modals.forEach(m => m.style.display = 'none')));
    window.addEventListener('click', e => {
        modals.forEach(m => { if(e.target == m) m.style.display = 'none' });
    });
    
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('register-modal').style.display = 'block';
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-modal').style.display = 'none';
        document.getElementById('login-modal').style.display = 'block';
    });

    document.getElementById('login-form').addEventListener('submit', e => {
        e.preventDefault();
        loggedInUser = { name: 'Usuario Ejemplo', email: e.target.querySelector('input[type=email]').value };
        localStorage.setItem('virgilioUser', JSON.stringify(loggedInUser));
        updateUIForUser();
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('profile-welcome').textContent = `Bienvenido, ${loggedInUser.name}`;
        showPage('profile');
    });
    
    document.getElementById('register-form').addEventListener('submit', e => {
        e.preventDefault();
        loggedInUser = { name: e.target.querySelector('input[type=text]').value, email: e.target.querySelector('input[type=email]').value };
        localStorage.setItem('virgilioUser', JSON.stringify(loggedInUser));
        updateUIForUser();
        document.getElementById('register-modal').style.display = 'none';
        document.getElementById('profile-welcome').textContent = `Bienvenido, ${loggedInUser.name}`;
        showPage('profile');
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        loggedInUser = null;
        localStorage.removeItem('virgilioUser');
        updateUIForUser();
        showPage('home');
    });

    // --- LÓGICA DE PAGO ---
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if(cart.length === 0) {
            showToast('Tu carrito está vacío.');
            return;
        }
        document.getElementById('payment-modal').style.display = 'block';
    });

    document.getElementById('payment-form').addEventListener('submit', e => {
        e.preventDefault();
        showToast('¡Pago exitoso! Tu pedido está en preparación.');
        cart = [];
        updateCart();
        document.getElementById('payment-modal').style.display = 'none';
        cartSidebar.classList.remove('open');
    });

    // --- LÓGICA DE PERFIL ---
    const profileTabs = document.querySelectorAll('.profile-tab-btn');
    const profileContents = document.querySelectorAll('.profile-content');
    
    profileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            profileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            profileContents.forEach(c => c.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    document.getElementById('feedback-form').addEventListener('submit', e => {
        e.preventDefault();
        showToast('Gracias por tu comentario.');
        e.target.reset();
    });

    // --- INICIALIZACIÓN DE LA APP ---
    renderMenu();
    updateCart();
    updateUIForUser();
    showPage('home'); 
});