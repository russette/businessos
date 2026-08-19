document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       BUSINESSOS
       Complete Business Management System
       ========================================================= */

    /* =========================================================
       DATA
       ========================================================= */

   let products =
        JSON.parse(localStorage.getItem("businessOSProducts")) || [];

    let customers =
        JSON.parse(localStorage.getItem("businessOSCustomers")) || [];

    let sales =
        JSON.parse(localStorage.getItem("businessOSSales")) || [];

    let invoices =
        JSON.parse(localStorage.getItem("businessOSInvoices")) || [];


    /* =========================================================
       HELPERS
       ========================================================= */

    function createId() {
        return Date.now().toString(36) +
            Math.random().toString(36).slice(2);
    }

    function money(value) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(Number(value) || 0);
    }

    function safe(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function text(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function saveData() {

        localStorage.setItem(
            "businessOSProducts",
            JSON.stringify(products)
        );

        localStorage.setItem(
            "businessOSCustomers",
            JSON.stringify(customers)
        );

        localStorage.setItem(
            "businessOSSales",
            JSON.stringify(sales)
        );

        localStorage.setItem(
            "businessOSInvoices",
            JSON.stringify(invoices)
        );
    }


    /* =========================================================
       DEMO DATA
       ========================================================= */

    function createDemoData() {

        const hasData =
            products.length > 0 ||
            customers.length > 0 ||
            sales.length > 0 ||
            invoices.length > 0;

        if (hasData) {
            return false;
        }

        const productOneId = createId();
        const productTwoId = createId();
        const customerId = createId();

        const today = new Date();

        products = [

            {
                id: productOneId,
                name: "MacBook Pro",
                price: 1956,
                stock: 9
            },

            {
                id: productTwoId,
                name: "MacBook Pro M4",
                price: 1999,
                stock: 9
            }

        ];

        customers = [

            {
                id: customerId,
                name: "Jonathan Thomas",
                email: "cynwayne@gmail.com",
                phone: "+1................"
            }

        ];

        sales = [

            {
                id: createId(),
                productId: productOneId,
                productName: "MacBook Pro",
                quantity: 1,
                total: 1956,
                date: today.toISOString()
            },

            {
                id: createId(),
                productId: productTwoId,
                productName: "MacBook Pro M4",
                quantity: 1,
                total: 1999,
                date: today.toISOString()
            }

        ];

        const dueDate = new Date();

        dueDate.setDate(
            dueDate.getDate() + 14
        );

        invoices = [

            {
                id: createId(),

                invoiceNumber:
                    "INV-" +
                    Math.floor(
                        100000 +
                        Math.random() * 900000
                    ),

                customerId,
                customerName: "Jonathan Thomas",

                productId: productTwoId,
                productName: "MacBook Pro M4",

                quantity: 3,

                subtotal: 5997,

                discount: 300,

                taxRate: 10.83,

                tax: 617.42,

                total: 6314.42,

                dueDate:
                    dueDate.toISOString().split("T")[0],

                status: "Paid",

                createdAt:
                    today.toISOString()
            }

        ];

        saveData();

        return true;
    }


    /* =========================================================
       STARTUP
       ========================================================= */

    const USE_DEMO_DATA = true;

    if (USE_DEMO_DATA) {

        const demoCreated =
            createDemoData();

        if (demoCreated) {
            console.log(
                "BusinessOS demo data created."
            );
        }
    }


    /* =========================================================
       PRODUCTS
       ========================================================= */

    function renderProducts() {

        const list =
            document.getElementById("productsList");

        if (!list) return;

        if (!products.length) {

            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>

                    <h3>No products yet</h3>

                    <p>
                        Add your first product to start
                        managing your inventory.
                    </p>
                </div>
            `;

            return;
        }

        list.innerHTML =
            products.map(product => {

                const stock =
                    Number(product.stock) || 0;

                return `
                    <div class="product-card">

                        <h3>
                            ${safe(product.name)}
                        </h3>

                        <p class="product-price">
                            ${money(product.price)}
                        </p>

                        <p>
                            Stock: ${stock}
                        </p>

                        <span class="status">
                            ${
                                stock > 0
                                    ? "IN STOCK"
                                    : "OUT OF STOCK"
                            }
                        </span>

                        <div class="product-actions">

                            <button
                                class="edit-btn"
                                onclick="editProduct('${product.id}')">
                                Edit
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteProduct('${product.id}')">
                                Delete
                            </button>

                        </div>

                    </div>
                `;
            }).join("");
    }


    window.openProductModal =
        function(productId = null) {

            const modal =
                document.getElementById("productModal");

            if (!modal) return;

            document
                .getElementById("productForm")
                ?.reset();

            const title =
                document.getElementById(
                    "productModalTitle"
                );

            const hidden =
                document.getElementById("productId");

            if (productId) {

                const product =
                    products.find(
                        p =>
                            String(p.id) ===
                            String(productId)
                    );

                if (!product) return;

                if (title) {
                    title.textContent =
                        "Edit Product";
                }

                if (hidden) {
                    hidden.value = product.id;
                }

                const name =
                    document.getElementById("productName");

                const price =
                    document.getElementById("productPrice");

                const stock =
                    document.getElementById("productStock");

                if (name) name.value = product.name;
                if (price) price.value = product.price;
                if (stock) stock.value = product.stock;

            } else {

                if (title) {
                    title.textContent =
                        "Add Product";
                }

                if (hidden) {
                    hidden.value = "";
                }
            }

            modal.classList.add("active");
        };


    window.closeProductModal =
        function() {

            document
                .getElementById("productModal")
                ?.classList.remove("active");
        };


    window.editProduct =
        function(productId) {
            openProductModal(productId);
        };


    document
        .getElementById("productForm")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const productId =
                    document.getElementById(
                        "productId"
                    )?.value;

                const name =
                    document.getElementById(
                        "productName"
                    )?.value.trim();

                const price =
                    Number(
                        document.getElementById(
                            "productPrice"
                        )?.value
                    );

                const stock =
                    Number(
                        document.getElementById(
                            "productStock"
                        )?.value
                    );

                if (!name) {

                    alert(
                        "Enter a product name."
                    );

                    return;
                }

                if (
                    !Number.isFinite(price) ||
                    !Number.isFinite(stock) ||
                    price < 0 ||
                    stock < 0
                ) {

                    alert(
                        "Price and stock cannot be negative."
                    );

                    return;
                }

                if (productId) {

                    const product =
                        products.find(
                            p =>
                                String(p.id) ===
                                String(productId)
                        );

                    if (product) {

                        product.name = name;
                        product.price = price;
                        product.stock = stock;
                    }

                } else {

                    products.push({

                        id: createId(),

                        name,

                        price,

                        stock
                    });
                }

                saveData();

                renderAll();

                closeProductModal();
            }
        );


    window.deleteProduct =
        function(productId) {

            const usedInSales =
                sales.some(
                    sale =>
                        String(sale.productId) ===
                        String(productId)
                );

            const usedInInvoices =
                invoices.some(
                    invoice =>
                        String(invoice.productId) ===
                        String(productId)
                );

            if (
                usedInSales ||
                usedInInvoices
            ) {

                const proceed =
                    confirm(
                        "This product is connected to existing sales or invoices. Delete it anyway?"
                    );

                if (!proceed) return;

            } else {

                if (
                    !confirm(
                        "Delete this product?"
                    )
                ) {
                    return;
                }
            }

            products =
                products.filter(
                    p =>
                        String(p.id) !==
                        String(productId)
                );

            saveData();

            renderAll();
        };


    /* =========================================================
       CUSTOMERS
       ========================================================= */

    function renderCustomers() {

        const list =
            document.getElementById(
                "customersList"
            );

        if (!list) return;

        if (!customers.length) {

            list.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        👥
                    </div>

                    <h3>
                        No customers yet
                    </h3>

                    <p>
                        Add your first customer
                        to start building
                        your customer list.
                    </p>

                </div>
            `;

            return;
        }

        list.innerHTML =
            customers.map(customer => {

                return `
                    <div class="customer-card">

                        <h3>
                            ${safe(customer.name)}
                        </h3>

                        ${
                            customer.email
                                ? `
                                    <p>
                                        📧
                                        ${safe(customer.email)}
                                    </p>
                                `
                                : ""
                        }

                        ${
                            customer.phone
                                ? `
                                    <p>
                                        📱
                                        ${safe(customer.phone)}
                                    </p>
                                `
                                : ""
                        }

                        <button
                            class="delete-btn"
                            onclick="deleteCustomer('${customer.id}')">
                            Delete
                        </button>

                    </div>
                `;

            }).join("");
    }


    window.openCustomerModal =
        function() {

            document
                .getElementById(
                    "customerForm"
                )
                ?.reset();

            document
                .getElementById(
                    "customerModal"
                )
                ?.classList.add("active");
        };


    window.closeCustomerModal =
        function() {

            document
                .getElementById(
                    "customerModal"
                )
                ?.classList.remove("active");
        };


    document
        .getElementById("customerForm")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const name =
                    document.getElementById(
                        "customerName"
                    )?.value.trim();

                const email =
                    document.getElementById(
                        "customerEmail"
                    )?.value.trim();

                const phone =
                    document.getElementById(
                        "customerPhone"
                    )?.value.trim();

                if (!name) {

                    alert(
                        "Enter customer name."
                    );

                    return;
                }

                customers.push({

                    id: createId(),

                    name,

                    email,

                    phone
                });

                saveData();

                renderAll();

                closeCustomerModal();
            }
        );


    window.deleteCustomer =
        function(customerId) {

            const hasInvoices =
                invoices.some(
                    invoice =>
                        String(invoice.customerId) ===
                        String(customerId)
                );

            if (hasInvoices) {

                const proceed =
                    confirm(
                        "This customer has invoices. Delete the customer anyway?"
                    );

                if (!proceed) return;

            } else {

                if (
                    !confirm(
                        "Delete this customer?"
                    )
                ) {
                    return;
                }
            }

            customers =
                customers.filter(
                    customer =>
                        String(customer.id) !==
                        String(customerId)
                );

            saveData();

            renderAll();
        };


    /* =========================================================
       SALES
       ========================================================= */

    window.openSaleModal =
        function() {

            const select =
                document.getElementById(
                    "saleProduct"
                );

            if (!select) return;

            select.innerHTML = `
                <option value="">
                    Select a product
                </option>
            `;

            products.forEach(product => {

                select.innerHTML += `
                    <option value="${safe(product.id)}">
                        ${safe(product.name)}
                        — ${money(product.price)}
                        — Stock: ${Number(product.stock) || 0}
                    </option>
                `;
            });

            const quantity =
                document.getElementById(
                    "saleQuantity"
                );

            if (quantity) {
                quantity.value = 1;
            }

            updateSaleTotal();

            document
                .getElementById(
                    "saleModal"
                )
                ?.classList.add("active");
        };


    window.closeSaleModal =
        function() {

            document
                .getElementById(
                    "saleModal"
                )
                ?.classList.remove("active");
        };


    function updateSaleTotal() {

        const productId =
            document.getElementById(
                "saleProduct"
            )?.value;

        const quantity =
            Number(
                document.getElementById(
                    "saleQuantity"
                )?.value
            ) || 0;

        const product =
            products.find(
                p =>
                    String(p.id) ===
                    String(productId)
            );

        const total =
            product
                ? Number(product.price) *
                  quantity
                : 0;

        text(
            "saleTotal",
            money(total)
        );
    }


    document
        .getElementById("saleProduct")
        ?.addEventListener(
            "change",
            updateSaleTotal
        );


    document
        .getElementById("saleQuantity")
        ?.addEventListener(
            "input",
            updateSaleTotal
        );


    document
        .getElementById("saleForm")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const productId =
                    document.getElementById(
                        "saleProduct"
                    )?.value;

                const quantity =
                    Number(
                        document.getElementById(
                            "saleQuantity"
                        )?.value
                    );

                const product =
                    products.find(
                        p =>
                            String(p.id) ===
                            String(productId)
                    );

                if (!product) {

                    alert(
                        "Select a product."
                    );

                    return;
                }

                if (
                    !Number.isFinite(quantity) ||
                    quantity <= 0
                ) {

                    alert(
                        "Quantity must be at least 1."
                    );

                    return;
                }

                const stock =
                    Number(product.stock) || 0;

                if (quantity > stock) {

                    alert(
                        `Only ${stock} units of ${product.name} are available.`
                    );

                    return;
                }

                const total =
                    Number(product.price) *
                    quantity;

                sales.push({

                    id: createId(),

                    productId: product.id,

                    productName:
                        product.name,

                    quantity,

                    total,

                    date:
                        new Date().toISOString()
                });

                product.stock =
                    stock - quantity;

                saveData();

                renderAll();

                closeSaleModal();

                alert(
                    "Sale recorded successfully."
                );
            }
        );


    function renderSales() {

        const list =
            document.getElementById(
                "salesList"
            );

        if (!list) return;

        if (!sales.length) {

            list.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        🧾
                    </div>

                    <h3>
                        No sales yet
                    </h3>

                    <p>
                        Your recorded sales
                        will appear here.
                    </p>

                </div>
            `;

            return;
        }

        list.innerHTML =
            [...sales]
                .reverse()
                .map(sale => {

                    return `
                        <div class="sale-card">

                            <div class="sale-info">

                                <div class="sale-icon">
                                    🧾
                                </div>

                                <div>

                                    <strong>
                                        ${safe(
                                            sale.productName ||
                                            "Unknown Product"
                                        )}
                                    </strong>

                                    <p>
                                        Quantity:
                                        ${Number(sale.quantity) || 0}
                                    </p>

                                    <p>
                                        ${formatDate(
                                            sale.date
                                        )}
                                    </p>

                                </div>

                            </div>

                            <div>

                                <strong>
                                    ${money(
                                        sale.total
                                    )}
                                </strong>

                                <br>

                                <button
                                    class="delete-btn"
                                    onclick="deleteSale('${sale.id}')">
                                    Delete
                                </button>

                            </div>

                        </div>
                    `;
                })
                .join("");
    }


    window.deleteSale =
        function(saleId) {

            if (
                !confirm(
                    "Delete this sale and restore the inventory?"
                )
            ) {
                return;
            }

            const sale =
                sales.find(
                    s =>
                        String(s.id) ===
                        String(saleId)
                );

            if (!sale) {

                alert(
                    "Sale not found."
                );

                return;
            }

            const product =
                products.find(
                    p =>
                        String(p.id) ===
                        String(sale.productId)
                );

            if (product) {

                product.stock =
                    Number(product.stock || 0) +
                    Number(sale.quantity || 0);
            }

            sales =
                sales.filter(
                    s =>
                        String(s.id) !==
                        String(saleId)
                );

            saveData();

            renderAll();

            alert(
                "Sale deleted and inventory restored."
            );
        };


    /* =========================================================
       ANALYTICS
       ========================================================= */

 function updateAnalytics() {

    /* =====================================================
       REVENUE
       ===================================================== */

    const totalRevenue =
        sales.reduce(
            (sum, sale) =>
                sum + Number(sale.total || 0),
            0
        );


    /* =====================================================
       TODAY'S REVENUE
       ===================================================== */

    const today =
        new Date();

    const todayString =
        today.toISOString().split("T")[0];

    const todayRevenue =
        sales.reduce(
            (sum, sale) => {

                if (!sale.date) {
                    return sum;
                }

                const saleDate =
                    new Date(sale.date)
                        .toISOString()
                        .split("T")[0];

                if (saleDate === todayString) {

                    return (
                        sum +
                        Number(sale.total || 0)
                    );

                }

                return sum;

            },
            0
        );


    /* =====================================================
       SALES
       ===================================================== */

    const unitsSold =
        sales.reduce(
            (sum, sale) =>
                sum +
                Number(sale.quantity || 0),
            0
        );


    const averageSale =
        sales.length
            ? totalRevenue / sales.length
            : 0;


    const largestSale =
        sales.length
            ? Math.max(
                ...sales.map(
                    sale =>
                        Number(
                            sale.total || 0
                        )
                )
            )
            : 0;


    /* =====================================================
       INVENTORY
       ===================================================== */

    const unitsInStock =
        products.reduce(
            (sum, product) =>
                sum +
                Number(product.stock || 0),
            0
        );


    const inventoryValue =
        products.reduce(
            (sum, product) =>
                sum +
                (
                    Number(product.price || 0) *
                    Number(product.stock || 0)
                ),
            0
        );


    /* =====================================================
       LOW STOCK
       ===================================================== */

    const lowStockProducts =
        products.filter(
            product =>
                Number(product.stock || 0) <= 3
        ).length;


    /* =====================================================
       INVOICES
       ===================================================== */

    const paidInvoices =
        invoices.filter(
            invoice =>
                invoice.status === "Paid"
        ).length;


    const unpaidInvoices =
        invoices.filter(
            invoice =>
                invoice.status !== "Paid"
        ).length;


    /* =====================================================
       BEST SELLER
       ===================================================== */

    const productSales = {};


    sales.forEach(sale => {

        const name =
            sale.productName ||
            "Unknown Product";

        productSales[name] =
            (
                productSales[name] || 0
            ) +
            Number(
                sale.quantity || 0
            );

    });


    const ranked =
        Object.entries(productSales)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    const bestSeller =
        ranked.length
            ? ranked[0][0]
            : "—";


    /* =====================================================
       UPDATE DASHBOARD
       ===================================================== */

    text(
        "totalRevenue",
        money(totalRevenue)
    );


    text(
        "todayRevenue",
        money(todayRevenue)
    );


    text(
        "totalProducts",
        products.length
    );


    text(
        "totalCustomers",
        customers.length
    );


    text(
        "totalSales",
        sales.length
    );


    text(
        "paidInvoices",
        paidInvoices
    );


    text(
        "unpaidInvoices",
        unpaidInvoices
    );


    text(
        "lowStockProducts",
        lowStockProducts
    );


    /* =====================================================
       ANALYTICS CARDS
       ===================================================== */

    text(
        "averageSale",
        money(averageSale)
    );


    text(
        "unitsInStock",
        unitsInStock
    );


    text(
        "inventoryValue",
        money(inventoryValue)
    );


    text(
        "bestSeller",
        bestSeller
    );


    /* =====================================================
       SALES OVERVIEW
       ===================================================== */

    text(
        "overviewRevenue",
        money(totalRevenue)
    );


    text(
        "unitsSold",
        unitsSold
    );


    text(
        "overviewAverage",
        money(averageSale)
    );


    text(
        "largestSale",
        money(largestSale)
    );


    /* =====================================================
       EXTRA DASHBOARD COMPONENTS
       ===================================================== */

    renderTopProducts(ranked);

    renderInventoryAlerts();

    renderRevenueChart();

}
    /* =========================================================
       TOP PRODUCTS
       ========================================================= */

    function renderTopProducts(ranked) {

        const container =
            document.getElementById(
                "topProducts"
            );

        if (!container) return;

        if (!ranked.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No sales yet.
                </div>
            `;

            return;
        }

        const maxSold =
            Math.max(
                ...ranked.map(
                    item =>
                        Number(item[1]) || 0
                )
            );

        container.innerHTML =
            ranked
                .slice(0, 5)
                .map(
                    ([name, quantity], index) => {

                        const sold =
                            Number(quantity) || 0;

                        const percentage =
                            maxSold > 0
                                ? (
                                    sold /
                                    maxSold
                                ) * 100
                                : 0;

                        let medal =
                            `#${index + 1}`;

                        if (index === 0)
                            medal = "🥇";

                        if (index === 1)
                            medal = "🥈";

                        if (index === 2)
                            medal = "🥉";

                        return `
                            <div class="top-product">

                                <div class="top-product-rank">
                                    ${medal}
                                </div>

                                <div class="top-product-info">

                                    <div class="top-product-header">

                                        <strong>
                                            ${safe(name)}
                                        </strong>

                                        <span>
                                            ${sold}
                                            ${
                                                sold === 1
                                                    ? "sale"
                                                    : "sales"
                                            }
                                        </span>

                                    </div>

                                    <div class="top-product-progress">

                                        <div
                                            class="top-product-progress-bar"
                                            style="
                                                width:${percentage}%;
                                            ">
                                        </div>

                                    </div>

                                </div>

                            </div>
                        `;
                    }
                )
                .join("");
    }


    /* =========================================================
       INVENTORY ALERTS
       ========================================================= */

    function renderInventoryAlerts() {

        const container =
            document.getElementById(
                "inventoryAlerts"
            );

        if (!container) return;

        const lowStock =
            products.filter(
                product =>
                    Number(product.stock) <= 3
            );

        if (!lowStock.length) {

            container.innerHTML = `
                <div class="success-message">
                    ✅ All products have healthy stock levels.
                </div>
            `;

            return;
        }

        container.innerHTML =
            lowStock
                .map(
                    product => `

                        <div class="success-message">

                            ⚠️

                            ${safe(product.name)}

                            has only

                            ${Number(product.stock) || 0}

                            left in stock.

                        </div>

                    `
                )
                .join("");
    }


    /* =========================================================
       REVENUE CHART
       ========================================================= */

    function renderRevenueChart() {

        const container =
            document.getElementById(
                "revenueChart"
            );

        if (!container) return;

        if (!sales.length) {

            container.innerHTML = `
                <div class="empty-chart">
                    Make your first sale to see
                    your revenue trend.
                </div>
            `;

            return;
        }

        const recent =
            [...sales]
                .sort(
                    (a, b) =>
                        new Date(a.date) -
                        new Date(b.date)
                )
                .slice(-10);

        const max =
            Math.max(
                ...recent.map(
                    sale =>
                        Number(
                            sale.total || 0
                        )
                )
            );

        container.innerHTML = `
            <div style="
                width:100%;
                height:180px;
                display:flex;
                align-items:flex-end;
                gap:10px;
                padding:20px;
                box-sizing:border-box;
            ">

                ${recent.map(sale => {

                    const amount =
                        Number(
                            sale.total || 0
                        );

                    const height =
                        max > 0
                            ? Math.max(
                                10,
                                (
                                    amount /
                                    max
                                ) * 130
                            )
                            : 10;

                    return `
                        <div
                            title="${money(amount)}"
                            style="
                                flex:1;
                                height:${height}px;
                                background:#2563eb;
                                border-radius:
                                    7px 7px 2px 2px;
                            ">
                        </div>
                    `;

                }).join("")}

            </div>
        `;
    }


    /* =========================================================
       INVOICES
       ========================================================= */

    window.openInvoiceModal =
        function() {

            populateInvoiceCustomers();

            populateInvoiceProducts();

            document
                .getElementById(
                    "invoiceForm"
                )
                ?.reset();

            generateInvoiceNumber();

            setDueDate();

            updateInvoiceTotal();

            document
                .getElementById(
                    "invoiceModal"
                )
                ?.classList.add("active");
        };


    window.closeInvoiceModal =
        function() {

            document
                .getElementById(
                    "invoiceModal"
                )
                ?.classList.remove("active");
        };


    function populateInvoiceCustomers() {

        const select =
            document.getElementById(
                "invoiceCustomer"
            );

        if (!select) return;

        select.innerHTML = `
            <option value="">
                Select a customer
            </option>
        `;

        customers.forEach(customer => {

            select.innerHTML += `
                <option value="${safe(customer.id)}">
                    ${safe(customer.name)}
                </option>
            `;
        });
    }


    function populateInvoiceProducts() {

        const select =
            document.getElementById(
                "invoiceProduct"
            );

        if (!select) return;

        select.innerHTML = `
            <option value="">
                Select a product
            </option>
        `;

        products.forEach(product => {

            select.innerHTML += `
                <option value="${safe(product.id)}">
                    ${safe(product.name)}
                    — ${money(product.price)}
                    — Stock: ${Number(product.stock) || 0}
                </option>
            `;
        });
    }


    function generateInvoiceNumber() {

        const input =
            document.getElementById(
                "invoiceNumber"
            );

        if (!input) return;

        let number;

        do {

            number =
                "INV-" +
                Math.floor(
                    100000 +
                    Math.random() * 900000
                );

        } while (
            invoices.some(
                invoice =>
                    invoice.invoiceNumber ===
                    number
            )
        );

        input.value = number;
    }


    function setDueDate() {

        const input =
            document.getElementById(
                "invoiceDueDate"
            );

        if (!input) return;

        const date = new Date();

        date.setDate(
            date.getDate() + 14
        );

        input.value =
            date.toISOString()
                .split("T")[0];
    }


    function calculateInvoice() {

        const productId =
            document.getElementById(
                "invoiceProduct"
            )?.value;

        const quantity =
            Number(
                document.getElementById(
                    "invoiceQuantity"
                )?.value
            ) || 0;

        const discount =
            Number(
                document.getElementById(
                    "invoiceDiscount"
                )?.value
            ) || 0;

        const taxRate =
            Number(
                document.getElementById(
                    "invoiceTax"
                )?.value
            ) || 0;

        const product =
            products.find(
                p =>
                    String(p.id) ===
                    String(productId)
            );

        const subtotal =
            product
                ? Number(product.price) *
                  quantity
                : 0;

        const actualDiscount =
            Math.min(
                Math.max(
                    discount,
                    0
                ),
                subtotal
            );

        const taxable =
            subtotal -
            actualDiscount;

        const tax =
            taxable *
            (Math.max(taxRate, 0) / 100);

        const total =
            taxable + tax;

        return {

            subtotal,

            discount:
                actualDiscount,

            taxRate:
                Math.max(taxRate, 0),

            tax,

            total
        };
    }


    function updateInvoiceTotal() {

        const result =
            calculateInvoice();

        text(
            "invoiceSubtotal",
            money(result.subtotal)
        );

        text(
            "invoiceDiscountDisplay",
            "-" +
            money(result.discount)
        );

        text(
            "invoiceTaxDisplay",
            money(result.tax)
        );

        text(
            "invoiceTotal",
            money(result.total)
        );
    }


    document
        .getElementById(
            "invoiceProduct"
        )
        ?.addEventListener(
            "change",
            updateInvoiceTotal
        );


    document
        .getElementById(
            "invoiceQuantity"
        )
        ?.addEventListener(
            "input",
            updateInvoiceTotal
        );


    document
        .getElementById(
            "invoiceDiscount"
        )
        ?.addEventListener(
            "input",
            updateInvoiceTotal
        );


    document
        .getElementById(
            "invoiceTax"
        )
        ?.addEventListener(
            "input",
            updateInvoiceTotal
        );


    document
        .getElementById(
            "invoiceForm"
        )
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const customerId =
                    document.getElementById(
                        "invoiceCustomer"
                    )?.value;

                const productId =
                    document.getElementById(
                        "invoiceProduct"
                    )?.value;

                const quantity =
                    Number(
                        document.getElementById(
                            "invoiceQuantity"
                        )?.value
                    );

                const customer =
                    customers.find(
                        c =>
                            String(c.id) ===
                            String(customerId)
                    );

                const product =
                    products.find(
                        p =>
                            String(p.id) ===
                            String(productId)
                    );

                if (!customer) {

                    alert(
                        "Select a customer."
                    );

                    return;
                }

                if (!product) {

                    alert(
                        "Select a product."
                    );

                    return;
                }

                if (
                    !Number.isFinite(quantity) ||
                    quantity <= 0
                ) {

                    alert(
                        "Quantity must be at least 1."
                    );

                    return;
                }

                const stock =
                    Number(product.stock) || 0;

                if (quantity > stock) {

                    alert(
                        `Only ${stock} units of ${product.name} are available.`
                    );

                    return;
                }

                const result =
                    calculateInvoice();

                const invoiceNumber =
                    document.getElementById(
                        "invoiceNumber"
                    )?.value ||
                    "INV-" +
                    Date.now();

                invoices.push({

                    id: createId(),

                    invoiceNumber,

                    customerId:
                        customer.id,

                    customerName:
                        customer.name,

                    productId:
                        product.id,

                    productName:
                        product.name,

                    quantity,

                    subtotal:
                        result.subtotal,

                    discount:
                        result.discount,

                    taxRate:
                        result.taxRate,

                    tax:
                        result.tax,

                    total:
                        result.total,

                    dueDate:
                        document.getElementById(
                            "invoiceDueDate"
                        )?.value || "",

                    status:
                        "Unpaid",

                    createdAt:
                        new Date().toISOString()
                });

                /*
                 * IMPORTANT:
                 * Creating an invoice now reduces
                 * available inventory.
                 */

                product.stock =
                    stock - quantity;

                saveData();

                renderAll();

                closeInvoiceModal();

                alert(
                    "Invoice created successfully."
                );
            }
        );


    /* =========================================================
       RENDER INVOICES
       ========================================================= */

    function renderInvoices() {

        const list =
            document.getElementById(
                "invoicesList"
            );

        if (!list) return;

        if (!invoices.length) {

            list.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        🧾
                    </div>

                    <h3>
                        No invoices yet
                    </h3>

                    <p>
                        Create your first invoice
                        for a customer.
                    </p>

                </div>
            `;

            return;
        }

        list.innerHTML =
            [...invoices]
                .reverse()
                .map(invoice => {

                    const paid =
                        invoice.status === "Paid";

                    return `
                        <div class="invoice-card">

                            <div class="invoice-main">

                                <div class="invoice-icon">
                                    🧾
                                </div>

                                <div>

                                    <h3>
                                        ${safe(
                                            invoice.invoiceNumber
                                        )}
                                    </h3>

                                    <p>
                                        ${safe(
                                            invoice.customerName
                                        )}
                                    </p>

                                    <p>
                                        ${safe(
                                            invoice.productName
                                        )}
                                        ×
                                        ${Number(
                                            invoice.quantity
                                        ) || 0}
                                    </p>

                                    <p>
                                        Due:
                                        ${formatDate(
                                            invoice.dueDate
                                        )}
                                    </p>

                                </div>

                            </div>

                            <div class="invoice-meta">

                                <strong>
                                    ${money(
                                        invoice.total
                                    )}
                                </strong>

                                <span
                                    class="invoice-status"
                                    style="
                                        display:inline-block;
                                        margin:8px 0;
                                    "
                                >
                                    ${
                                        paid
                                            ? "Paid"
                                            : "Unpaid"
                                    }
                                </span>

                                <br>

                                <button
                                    type="button"
                                    class="edit-btn"
                                    onclick="toggleInvoicePaid('${invoice.id}')"
                                >
                                    ${
                                        paid
                                            ? "Mark as Unpaid"
                                            : "Mark as Paid"
                                    }
                                </button>

                                <button
                                    type="button"
                                    class="secondary-btn"
                                    onclick="viewInvoice('${invoice.id}')"
                                >
                                    👁️ View Invoice
                                </button>

                                <button
                                    type="button"
                                    class="delete-btn"
                                    onclick="deleteInvoice('${invoice.id}')"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    `;
                })
                .join("");
    }


    /* =========================================================
       TOGGLE INVOICE STATUS
       ========================================================= */

    window.toggleInvoicePaid =
        function(invoiceId) {

            const invoice =
                invoices.find(
                    item =>
                        String(item.id) ===
                        String(invoiceId)
                );

            if (!invoice) {

                alert(
                    "Invoice not found."
                );

                return;
            }

            invoice.status =
                invoice.status === "Paid"
                    ? "Unpaid"
                    : "Paid";

            saveData();

            renderInvoices();

            updateAnalytics();
        };


    /* =========================================================
       VIEW / PRINT INVOICE
       ========================================================= */

    window.viewInvoice =
        function(invoiceId) {

            const invoice =
                invoices.find(
                    item =>
                        String(item.id) ===
                        String(invoiceId)
                );

            if (!invoice) {

                alert(
                    "Invoice not found."
                );

                return;
            }

            const customer =
                customers.find(
                    item =>
                        String(item.id) ===
                        String(invoice.customerId)
                );

            const printWindow =
                window.open(
                    "",
                    "_blank",
                    "width=900,height=800"
                );

            if (!printWindow) {

                alert(
                    "Please allow pop-ups for BusinessOS."
                );

                return;
            }

            const customerEmail =
                customer?.email
                    ? `
                        <p>
                            ${safe(customer.email)}
                        </p>
                    `
                    : "";

            const customerPhone =
                customer?.phone
                    ? `
                        <p>
                            ${safe(customer.phone)}
                        </p>
                    `
                    : "";

            const unitPrice =
                invoice.quantity > 0
                    ? Number(invoice.subtotal) /
                      Number(invoice.quantity)
                    : 0;

            const paid =
                invoice.status === "Paid";

            printWindow.document.write(`

                <!DOCTYPE html>

                <html>

                <head>

                    <title>
                        ${safe(
                            invoice.invoiceNumber
                        )}
                        | BusinessOS
                    </title>

                    <style>

                        * {
                            box-sizing:border-box;
                        }

                        body {
                            margin:0;
                            padding:40px;
                            font-family:
                                Arial,
                                sans-serif;
                            background:#f3f4f6;
                            color:#111827;
                        }

                        .invoice {
                            max-width:800px;
                            margin:auto;
                            padding:50px;
                            background:white;
                            box-shadow:
                                0 10px 40px
                                rgba(0,0,0,.08);
                        }

                        .header {
                            display:flex;
                            justify-content:
                                space-between;
                            gap:30px;
                            margin-bottom:50px;
                        }

                        .brand {
                            font-size:28px;
                            font-weight:800;
                        }

                        .brand span {
                            color:#2563eb;
                        }

                        .invoice-title {
                            text-align:right;
                        }

                        .invoice-title h1 {
                            margin:0 0 5px;
                            font-size:30px;
                        }

                        .invoice-title p {
                            margin:4px 0;
                            color:#6b7280;
                        }

                        .status {
                            display:inline-block;
                            margin-top:10px;
                            padding:6px 12px;
                            border-radius:999px;
                            background:
                                ${
                                    paid
                                        ? "#dcfce7"
                                        : "#fef3c7"
                                };
                            color:
                                ${
                                    paid
                                        ? "#166534"
                                        : "#92400e"
                                };
                            font-weight:700;
                        }

                        .details {
                            display:grid;
                            grid-template-columns:
                                1fr 1fr;
                            gap:30px;
                            margin-bottom:40px;
                        }

                        .details h3 {
                            margin-bottom:8px;
                            font-size:12px;
                            text-transform:
                                uppercase;
                            color:#6b7280;
                        }

                        .details p {
                            margin:4px 0;
                        }

                        table {
                            width:100%;
                            border-collapse:
                                collapse;
                            margin-bottom:30px;
                        }

                        th {
                            padding:12px;
                            text-align:left;
                            background:#f8fafc;
                            border-bottom:
                                1px solid #e5e7eb;
                        }

                        td {
                            padding:15px 12px;
                            border-bottom:
                                1px solid #e5e7eb;
                        }

                        .right {
                            text-align:right;
                        }

                        .totals {
                            width:320px;
                            margin-left:auto;
                        }

                        .total-row {
                            display:flex;
                            justify-content:
                                space-between;
                            padding:8px 0;
                        }

                        .grand-total {
                            margin-top:10px;
                            padding-top:15px;
                            border-top:
                                2px solid #111827;
                            font-size:20px;
                            font-weight:800;
                        }

                        .footer {
                            margin-top:50px;
                            padding-top:20px;
                            border-top:
                                1px solid #e5e7eb;
                            text-align:center;
                            color:#6b7280;
                            font-size:13px;
                        }

                        .print-button {
                            display:block;
                            margin:25px auto 0;
                            padding:12px 20px;
                            border:0;
                            border-radius:8px;
                            background:#2563eb;
                            color:white;
                            font-weight:700;
                            cursor:pointer;
                        }

                        @media print {

                            body {
                                padding:0;
                                background:white;
                            }

                            .invoice {
                                box-shadow:none;
                                max-width:none;
                            }

                            .print-button {
                                display:none;
                            }

                        }

                    </style>

                </head>

                <body>

                    <div class="invoice">

                        <div class="header">

                            <div>

                                <div class="brand">
                                    Business<span>OS</span>
                                </div>

                                <p>
                                    Business Management System
                                </p>

                            </div>

                            <div class="invoice-title">

                                <h1>
                                    INVOICE
                                </h1>

                                <p>
                                    ${safe(
                                        invoice.invoiceNumber
                                    )}
                                </p>

                                <div class="status">

                                    ${
                                        paid
                                            ? "PAID"
                                            : "UNPAID"
                                    }

                                </div>

                            </div>

                        </div>


                        <div class="details">

                            <div>

                                <h3>
                                    Bill To
                                </h3>

                                <p>
                                    <strong>
                                        ${safe(
                                            invoice.customerName
                                        )}
                                    </strong>
                                </p>

                                ${customerEmail}

                                ${customerPhone}

                            </div>


                            <div>

                                <h3>
                                    Invoice Details
                                </h3>

                                <p>
                                    <strong>
                                        Due Date:
                                    </strong>

                                    ${formatDate(
                                        invoice.dueDate
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Created:
                                    </strong>

                                    ${formatDate(
                                        invoice.createdAt
                                    )}
                                </p>

                            </div>

                        </div>


                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th class="right">
                                        Quantity
                                    </th>

                                    <th class="right">
                                        Price
                                    </th>

                                    <th class="right">
                                        Total
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                <tr>

                                    <td>
                                        ${safe(
                                            invoice.productName
                                        )}
                                    </td>

                                    <td class="right">
                                        ${invoice.quantity}
                                    </td>

                                    <td class="right">
                                        ${money(unitPrice)}
                                    </td>

                                    <td class="right">
                                        ${money(
                                            invoice.subtotal
                                        )}
                                    </td>

                                </tr>

                            </tbody>

                        </table>


                        <div class="totals">

                            <div class="total-row">

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    ${money(
                                        invoice.subtotal
                                    )}
                                </strong>

                            </div>


                            <div class="total-row">

                                <span>
                                    Discount
                                </span>

                                <strong>
                                    -${money(
                                        invoice.discount
                                    )}
                                </strong>

                            </div>


                            <div class="total-row">

                                <span>
                                    Tax (${Number(
                                        invoice.taxRate
                                    ) || 0}%)
                                </span>

                                <strong>
                                    ${money(
                                        invoice.tax
                                    )}
                                </strong>

                            </div>


                            <div
                                class="total-row grand-total"
                            >

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ${money(
                                        invoice.total
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div class="footer">

                            Thank you for doing business with us.

                            <br>

                            BusinessOS —
                            Built by Russette

                        </div>


                        <button
                            class="print-button"
                            onclick="window.print()"
                        >
                            🖨️ Print / Save as PDF
                        </button>

                    </div>

                </body>

                </html>

            `);

            printWindow.document.close();
        };


    /* =========================================================
       DELETE INVOICE
       ========================================================= */

    window.deleteInvoice =
        function(invoiceId) {

            if (
                !confirm(
                    "Delete this invoice and restore the inventory?"
                )
            ) {
                return;
            }

            const invoice =
                invoices.find(
                    item =>
                        String(item.id) ===
                        String(invoiceId)
                );

            if (!invoice) {

                alert(
                    "Invoice not found."
                );

                return;
            }

            /*
             * Restore the inventory that was
             * consumed by this invoice.
             */

            const product =
                products.find(
                    product =>
                        String(product.id) ===
                        String(invoice.productId)
                );

            if (product) {

                product.stock =
                    Number(product.stock || 0) +
                    Number(invoice.quantity || 0);
            }

            invoices =
                invoices.filter(
                    item =>
                        String(item.id) !==
                        String(invoiceId)
                );

            saveData();

            renderAll();

            alert(
                "Invoice deleted and inventory restored."
            );
        };


    /* =========================================================
       EXPORT BUSINESS DATA
       ========================================================= */

    window.exportBusinessData =
        function() {

            const data = {

                products,

                customers,

                sales,

                invoices,

                exportedAt:
                    new Date().toISOString(),

                version:
                    "BusinessOS 2.0"

            };

            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            data,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `businessos-backup-${new Date()
                    .toISOString()
                    .split("T")[0]}.json`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);

            alert(
                "BusinessOS backup exported successfully."
            );
        };


    /* =========================================================
       IMPORT BUSINESS DATA
       ========================================================= */

    window.importBusinessData =
        function(file) {

            if (!file) return;

            const reader =
                new FileReader();

            reader.onload =
                function(event) {

                    try {

                        const data =
                            JSON.parse(
                                event.target.result
                            );

                        if (
                            !data ||
                            !Array.isArray(
                                data.products
                            ) ||
                            !Array.isArray(
                                data.customers
                            ) ||
                            !Array.isArray(
                                data.sales
                            ) ||
                            !Array.isArray(
                                data.invoices
                            )
                        ) {

                            throw new Error(
                                "Invalid BusinessOS backup."
                            );
                        }

                        const confirmed =
                            confirm(
                                "Import this backup? Your current BusinessOS data will be replaced."
                            );

                        if (!confirmed) {
                            return;
                        }

                        products =
                            data.products;

                        customers =
                            data.customers;

                        sales =
                            data.sales;

                        invoices =
                            data.invoices;

                        saveData();

                        renderAll();

                        alert(
                            "BusinessOS backup imported successfully."
                        );

                    } catch (error) {

                        console.error(error);

                        alert(
                            "Could not import this backup. Make sure it is a valid BusinessOS JSON file."
                        );
                    }
                };

            reader.readAsText(file);
        };


    /* =========================================================
       RESET BUSINESS DATA
       ========================================================= */

    window.resetBusinessData =
        function() {

            if (
                !confirm(
                    "Delete ALL BusinessOS data? This cannot be undone."
                )
            ) {
                return;
            }

            products = [];

            customers = [];

            sales = [];

            invoices = [];

            saveData();

            renderAll();

            alert(
                "BusinessOS data has been completely reset."
            );
        };


    /* =========================================================
       MODAL CLOSE
       ========================================================= */

    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        modal.classList.remove(
                            "active"
                        );
                    }
                }
            );
        });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal.active"
                    )
                    .forEach(modal => {

                        modal.classList.remove(
                            "active"
                        );
                    });
            }
        }
    );


    /* =========================================================
       SCROLL
       ========================================================= */

    window.scrollToSection =
        function(sectionId) {

            document
                .getElementById(sectionId)
                ?.scrollIntoView({
                    behavior: "smooth"
                });
        };


    /* =========================================================
       RENDER EVERYTHING
       ========================================================= */

    function renderAll() {

        renderProducts();

        renderCustomers();

        renderSales();

        renderInvoices();

        updateAnalytics();
    }


    /* =========================================================
       START BUSINESSOS
       ========================================================= */
/* =========================================================
   SEARCH & FILTERS
   ========================================================= */

let productSearchTerm = "";
let customerSearchTerm = "";
let salesSearchTerm = "";
let invoiceSearchTerm = "";
let invoiceStatusFilter = "all";


/* =========================================================
   PRODUCT SEARCH
   ========================================================= */

document
    .getElementById("productSearch")
    ?.addEventListener("input", event => {

        productSearchTerm =
            event.target.value
                .toLowerCase()
                .trim();

        renderProducts();
    });


/* =========================================================
   CUSTOMER SEARCH
   ========================================================= */

document
    .getElementById("customerSearch")
    ?.addEventListener("input", event => {

        customerSearchTerm =
            event.target.value
                .toLowerCase()
                .trim();

        renderCustomers();
    });


/* =========================================================
   SALES SEARCH
   ========================================================= */

document
    .getElementById("salesSearch")
    ?.addEventListener("input", event => {

        salesSearchTerm =
            event.target.value
                .toLowerCase()
                .trim();

        renderSales();
    });


/* =========================================================
   INVOICE SEARCH
   ========================================================= */

document
    .getElementById("invoiceSearch")
    ?.addEventListener("input", event => {

        invoiceSearchTerm =
            event.target.value
                .toLowerCase()
                .trim();

        renderInvoices();
    });


/* =========================================================
   INVOICE STATUS FILTER
   ========================================================= */

document
    .getElementById("invoiceStatusFilter")
    ?.addEventListener("change", event => {

        invoiceStatusFilter =
            event.target.value;

        renderInvoices();
    });


/* =========================================================
   SEARCH-AWARE PRODUCT RENDERING
   ========================================================= */

const originalRenderProducts =
    renderProducts;

renderProducts = function() {

    const list =
        document.getElementById("productsList");

    if (!list) return;

    const filtered =
        products.filter(product => {

            const name =
                String(product.name || "")
                    .toLowerCase();

            return name.includes(
                productSearchTerm
            );
        });

    if (!filtered.length) {

        list.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🔍
                </div>

                <h3>
                    No products found
                </h3>

                <p>
                    Try a different search term.
                </p>

            </div>
        `;

        return;
    }

    list.innerHTML =
        filtered.map(product => {

            const stock =
                Number(product.stock) || 0;

            return `
                <div class="product-card">

                    <h3>
                        ${safe(product.name)}
                    </h3>

                    <p class="product-price">
                        ${money(product.price)}
                    </p>

                    <p>
                        Stock: ${stock}
                    </p>

                    <span class="status">
                        ${
                            stock > 0
                                ? "IN STOCK"
                                : "OUT OF STOCK"
                        }
                    </span>

                    <div class="product-actions">

                        <button
                            class="edit-btn"
                            onclick="editProduct('${product.id}')">
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteProduct('${product.id}')">
                            Delete
                        </button>

                    </div>

                </div>
            `;

        }).join("");
};


/* =========================================================
   SEARCH-AWARE CUSTOMER RENDERING
   ========================================================= */

const originalRenderCustomers =
    renderCustomers;

renderCustomers = function() {

    const list =
        document.getElementById(
            "customersList"
        );

    if (!list) return;

    const filtered =
        customers.filter(customer => {

            const name =
                String(customer.name || "")
                    .toLowerCase();

            const email =
                String(customer.email || "")
                    .toLowerCase();

            const phone =
                String(customer.phone || "")
                    .toLowerCase();

            return (
                name.includes(customerSearchTerm) ||
                email.includes(customerSearchTerm) ||
                phone.includes(customerSearchTerm)
            );
        });

    if (!filtered.length) {

        list.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🔍
                </div>

                <h3>
                    No customers found
                </h3>

                <p>
                    Try a different search term.
                </p>

            </div>
        `;

        return;
    }

    list.innerHTML =
        filtered.map(customer => {

            return `
                <div class="customer-card">

                    <h3>
                        ${safe(customer.name)}
                    </h3>

                    ${
                        customer.email
                            ? `
                                <p>
                                    📧
                                    ${safe(customer.email)}
                                </p>
                            `
                            : ""
                    }

                    ${
                        customer.phone
                            ? `
                                <p>
                                    📱
                                    ${safe(customer.phone)}
                                </p>
                            `
                            : ""
                    }

                    <button
                        class="delete-btn"
                        onclick="deleteCustomer('${customer.id}')">
                        Delete
                    </button>

                </div>
            `;

        }).join("");
};


/* =========================================================
   SEARCH-AWARE SALES RENDERING
   ========================================================= */

const originalRenderSales =
    renderSales;

renderSales = function() {

    const list =
        document.getElementById(
            "salesList"
        );

    if (!list) return;

    const filtered =
        sales.filter(sale => {

            const productName =
                String(
                    sale.productName || ""
                ).toLowerCase();

            return productName.includes(
                salesSearchTerm
            );
        });

    if (!filtered.length) {

        list.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🔍
                </div>

                <h3>
                    No sales found
                </h3>

                <p>
                    Try a different search term.
                </p>

            </div>
        `;

        return;
    }

    list.innerHTML =
        [...filtered]
            .reverse()
            .map(sale => {

                return `
                    <div class="sale-card">

                        <div class="sale-info">

                            <div class="sale-icon">
                                🧾
                            </div>

                            <div>

                                <strong>
                                    ${safe(
                                        sale.productName ||
                                        "Unknown Product"
                                    )}
                                </strong>

                                <p>
                                    Quantity:
                                    ${Number(
                                        sale.quantity
                                    ) || 0}
                                </p>

                                <p>
                                    ${formatDate(
                                        sale.date
                                    )}
                                </p>

                            </div>

                        </div>

                        <div>

                            <strong>
                                ${money(sale.total)}
                            </strong>

                            <br>

                            <button
                                class="delete-btn"
                                onclick="deleteSale('${sale.id}')">
                                Delete
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");
};


/* =========================================================
   SEARCH + FILTER INVOICES
   ========================================================= */

const originalRenderInvoices =
    renderInvoices;

renderInvoices = function() {

    const list =
        document.getElementById(
            "invoicesList"
        );

    if (!list) return;

    const filtered =
        invoices.filter(invoice => {

            const number =
                String(
                    invoice.invoiceNumber || ""
                ).toLowerCase();

            const customer =
                String(
                    invoice.customerName || ""
                ).toLowerCase();

            const product =
                String(
                    invoice.productName || ""
                ).toLowerCase();

            const matchesSearch =
                number.includes(invoiceSearchTerm) ||
                customer.includes(invoiceSearchTerm) ||
                product.includes(invoiceSearchTerm);

            const matchesStatus =
                invoiceStatusFilter === "all" ||
                (
                    invoiceStatusFilter === "paid" &&
                    invoice.status === "Paid"
                ) ||
                (
                    invoiceStatusFilter === "unpaid" &&
                    invoice.status !== "Paid"
                );

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    if (!filtered.length) {

        list.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🔍
                </div>

                <h3>
                    No invoices found
                </h3>

                <p>
                    Try changing your search or filter.
                </p>

            </div>
        `;

        return;
    }

    list.innerHTML =
        [...filtered]
            .reverse()
            .map(invoice => {

                const paid =
                    invoice.status === "Paid";

                return `
                    <div class="invoice-card">

                        <div class="invoice-main">

                            <div class="invoice-icon">
                                🧾
                            </div>

                            <div>

                                <h3>
                                    ${safe(
                                        invoice.invoiceNumber
                                    )}
                                </h3>

                                <p>
                                    ${safe(
                                        invoice.customerName
                                    )}
                                </p>

                                <p>
                                    ${safe(
                                        invoice.productName
                                    )}
                                    ×
                                    ${Number(
                                        invoice.quantity
                                    ) || 0}
                                </p>

                                <p>
                                    Due:
                                    ${formatDate(
                                        invoice.dueDate
                                    )}
                                </p>

                            </div>

                        </div>

                        <div class="invoice-meta">

                            <strong>
                                ${money(
                                    invoice.total
                                )}
                            </strong>

                            <span
                                class="invoice-status"
                                style="
                                    display:inline-block;
                                    margin:8px 0;
                                "
                            >
                                ${
                                    paid
                                        ? "Paid"
                                        : "Unpaid"
                                }
                            </span>

                            <br>

                            <button
                                type="button"
                                class="edit-btn"
                                onclick="toggleInvoicePaid('${invoice.id}')"
                            >
                                ${
                                    paid
                                        ? "Mark as Unpaid"
                                        : "Mark as Paid"
                                }
                            </button>

                            <button
                                type="button"
                                class="secondary-btn"
                                onclick="viewInvoice('${invoice.id}')"
                            >
                                👁️ View Invoice
                            </button>

                            <button
                                type="button"
                                class="delete-btn"
                                onclick="deleteInvoice('${invoice.id}')"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");
};


/* =========================================================
   FINAL RENDER
   ========================================================= */

renderAll();

});
