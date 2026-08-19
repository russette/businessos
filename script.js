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

        if (!value) {
            return "—";
        }

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


    function todayString() {

        const today = new Date();

        return today.toISOString().split("T")[0];
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

                customerName:
                    "Jonathan Thomas",

                productId:
                    productTwoId,

                productName:
                    "MacBook Pro M4",

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
       DEMO DATA SWITCH
       ========================================================= */

    const USE_DEMO_DATA = false;

    if (USE_DEMO_DATA) {
        createDemoData();
    }


    /* =========================================================
       PRODUCTS
       ========================================================= */

    function renderProducts() {

        const list =
            document.getElementById("productsList");

        if (!list) {
            return;
        }


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
                                onclick="editProduct('${safe(product.id)}')">
                                Edit
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteProduct('${safe(product.id)}')">
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

            if (!modal) {
                return;
            }


            document
                .getElementById("productForm")
                ?.reset();


            const title =
                document.getElementById(
                    "productModalTitle"
                );


            const hidden =
                document.getElementById(
                    "productId"
                );


            if (productId) {

                const product =
                    products.find(
                        p =>
                            String(p.id) ===
                            String(productId)
                    );


                if (!product) {
                    return;
                }


                if (title) {
                    title.textContent =
                        "Edit Product";
                }


                if (hidden) {
                    hidden.value =
                        product.id;
                }


                const name =
                    document.getElementById(
                        "productName"
                    );


                const price =
                    document.getElementById(
                        "productPrice"
                    );


                const stock =
                    document.getElementById(
                        "productStock"
                    );


                if (name) {
                    name.value =
                        product.name;
                }


                if (price) {
                    price.value =
                        product.price;
                }


                if (stock) {
                    stock.value =
                        product.stock;
                }

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

                        product.name =
                            name;

                        product.price =
                            price;

                        product.stock =
                            stock;
                    }

                } else {

                    products.push({

                        id:
                            createId(),

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


                if (!proceed) {
                    return;
                }

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
                    product =>
                        String(product.id) !==
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


        if (!list) {
            return;
        }


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
                            onclick="deleteCustomer('${safe(customer.id)}')">
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

                    id:
                        createId(),

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


                if (!proceed) {
                    return;
                }

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


            if (!select) {
                return;
            }


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

                    id:
                        createId(),

                    productId:
                        product.id,

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


        if (!list) {
            return;
        }


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
                                    onclick="deleteSale('${safe(sale.id)}')">
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

        const totalRevenue =
            sales.reduce(
                (sum, sale) =>
                    sum +
                    Number(sale.total || 0),
                0
            );


        const today =
            todayString();


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


                    if (saleDate === today) {

                        return (
                            sum +
                            Number(sale.total || 0)
                        );
                    }


                    return sum;

                },
                0
            );


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


        const lowStockProducts =
            products.filter(
                product =>
                    Number(product.stock || 0) <= 3
            ).length;


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
           DASHBOARD NUMBERS
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


        renderTopProducts(
            ranked
        );


        renderInventoryAlerts();


        renderRevenueTrend();
    }


    /* =========================================================
       TOP PRODUCTS
       ========================================================= */

    function renderTopProducts(ranked) {

        const container =
            document.getElementById(
                "topProducts"
            );


        if (!container) {
            return;
        }


        if (!ranked.length) {

            container.innerHTML = `
                <div class="empty-chart">
                    <p>
                        No sales data yet.
                    </p>
                </div>
            `;

            return;
        }


        const top =
            ranked.slice(0, 5);


        const max =
            top[0][1] || 1;


        container.innerHTML =
            top.map(
                (item, index) => {

                    const name =
                        item[0];

                    const quantity =
                        item[1];


                    const percentage =
                        Math.max(
                            8,
                            (
                                quantity /
                                max
                            ) * 100
                        );


                    const medals =
                        ["🥇", "🥈", "🥉"];


                    return `
                        <div class="top-product">

                            <div class="top-product-rank">
                                ${
                                    medals[index] ||
                                    `#${index + 1}`
                                }
                            </div>

                            <div class="top-product-info">

                                <div class="top-product-header">

                                    <strong>
                                        ${safe(name)}
                                    </strong>

                                    <span>
                                        ${quantity}
                                        ${
                                            quantity === 1
                                                ? "sale"
                                                : "sales"
                                        }
                                    </span>

                                </div>

                                <div class="top-product-progress">

                                    <div
                                        class="top-product-progress-bar"
                                        style="width:${percentage}%">
                                    </div>

                                </div>

                            </div>

                        </div>
                    `;

                }
            ).join("");
    }


    /* =========================================================
       INVENTORY ALERTS
       ========================================================= */

    function renderInventoryAlerts() {

        const container =
            document.getElementById(
                "inventoryAlerts"
            );


        if (!container) {
            return;
        }


        const lowStock =
            products.filter(
                product =>
                    Number(product.stock || 0) <= 3
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
            lowStock.map(
                product => {

                    return `
                        <div class="success-message"
                             style="
                                background:#fff7ed;
                                border-color:#fed7aa;
                                color:#9a3412;
                             ">

                            ⚠️
                            <strong>
                                ${safe(product.name)}
                            </strong>

                            has only
                            ${Number(product.stock) || 0}
                            units left.

                        </div>
                    `;
                }
            ).join("");
    }


    /* =========================================================
       REVENUE TREND
       ========================================================= */

    function renderRevenueTrend() {

       const container =
    document.getElementById(
        "revenueChart"
    );


        if (!container) {
            return;
        }


        if (!sales.length) {

            container.innerHTML = `
                <div class="empty-chart">
                    <p>
                        Revenue data will appear
                        after your first sale.
                    </p>
                </div>
            `;

            return;
        }


        const grouped = {};


        sales.forEach(sale => {

            if (!sale.date) {
                return;
            }


            const date =
                new Date(sale.date);


            if (Number.isNaN(date.getTime())) {
                return;
            }


            const key =
                date.toISOString()
                    .split("T")[0];


            grouped[key] =
                (
                    grouped[key] || 0
                ) +
                Number(sale.total || 0);
        });


        const dates =
            Object.keys(grouped)
                .sort()
                .slice(-7);


        if (!dates.length) {
            return;
        }


        const values =
            dates.map(
                date =>
                    grouped[date]
            );


        const max =
            Math.max(...values, 1);


        container.innerHTML = `

            <div style="
                display:flex;
                align-items:flex-end;
                gap:12px;
                height:180px;
                padding:20px;
            ">

                ${
                    dates.map(
                        (date, index) => {

                            const height =
                                Math.max(
                                    8,
                                    (
                                        values[index] /
                                        max
                                    ) * 120
                                );


                            return `
                                <div style="
                                    flex:1;
                                    height:100%;
                                    display:flex;
                                    flex-direction:column;
                                    justify-content:flex-end;
                                    align-items:center;
                                    gap:7px;
                                ">

                                    <strong style="
                                        font-size:10px;
                                    ">
                                        ${money(values[index])}
                                    </strong>

                                    <div style="
                                        width:100%;
                                        max-width:55px;
                                        height:${height}px;
                                        background:linear-gradient(
                                            180deg,
                                            #2563eb,
                                            #60a5fa
                                        );
                                        border-radius:8px 8px 3px 3px;
                                    "></div>

                                    <span style="
                                        font-size:10px;
                                        color:#64748b;
                                    ">
                                        ${formatDate(date)}
                                    </span>

                                </div>
                            `;
                        }
                    ).join("")
                }

            </div>
        `;
    }


    /* =========================================================
       INVOICES
       ========================================================= */

    function renderInvoices(filter = "all") {

        const list =
            document.getElementById(
                "invoiceList"
            );


        if (!list) {
            return;
        }


        let filtered =
            [...invoices];


        if (filter === "paid") {

            filtered =
                filtered.filter(
                    invoice =>
                        invoice.status === "Paid"
                );
        }


        if (filter === "unpaid") {

            filtered =
                filtered.filter(
                    invoice =>
                        invoice.status !== "Paid"
                );
        }


        if (!filtered.length) {

            list.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        🧾
                    </div>

                    <h3>
                        No invoices found
                    </h3>

                    <p>
                        Create an invoice to
                        start tracking billing.
                    </p>

                </div>
            `;

            return;
        }


        list.innerHTML =
            filtered
                .reverse()
                .map(invoice => {

                    const status =
                        invoice.status || "Unpaid";


                    return `
                        <div class="invoice-card">

                            <div class="invoice-main">

                                <div class="invoice-icon">
                                    🧾
                                </div>

                                <div>

                                    <strong>
                                        ${safe(
                                            invoice.invoiceNumber ||
                                            "Invoice"
                                        )}
                                    </strong>

                                    <p>
                                        ${safe(
                                            invoice.customerName ||
                                            "Unknown Customer"
                                        )}
                                    </p>

                                    <p>
                                        ${safe(
                                            invoice.productName ||
                                            "Unknown Product"
                                        )}
                                        ×
                                        ${Number(invoice.quantity) || 0}
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
                                    ${money(invoice.total)}
                                </strong>

                                <br>

                                <span
                                    class="invoice-status"
                                    style="
                                        background:${
                                            status === "Paid"
                                                ? "#dcfce7"
                                                : "#fef3c7"
                                        };
                                        color:${
                                            status === "Paid"
                                                ? "#166534"
                                                : "#92400e"
                                        };
                                    "
                                >
                                    ${safe(status)}
                                </span>

                                <div
                                    style="
                                        margin-top:10px;
                                        display:flex;
                                        gap:7px;
                                        flex-wrap:wrap;
                                        justify-content:flex-end;
                                    "
                                >

                                    ${
                                        status === "Paid"
                                            ? `
                                                <button
                                                    class="secondary-btn"
                                                    onclick="toggleInvoiceStatus('${safe(invoice.id)}')">
                                                    Mark as Unpaid
                                                </button>
                                            `
                                            : `
                                                <button
                                                    onclick="toggleInvoiceStatus('${safe(invoice.id)}')">
                                                    Mark as Paid
                                                </button>
                                            `
                                    }

                                    <button
                                        class="edit-btn"
                                        onclick="viewInvoice('${safe(invoice.id)}')">
                                        👁️ View Invoice
                                    </button>

                                    <button
                                        class="delete-btn"
                                        onclick="deleteInvoice('${safe(invoice.id)}')">
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>
                    `;

                })
                .join("");
    }


    window.toggleInvoiceStatus =
        function(invoiceId) {

            const invoice =
                invoices.find(
                    item =>
                        String(item.id) ===
                        String(invoiceId)
                );


            if (!invoice) {
                return;
            }


            invoice.status =
                invoice.status === "Paid"
                    ? "Unpaid"
                    : "Paid";


            saveData();

            renderAll();
        };


    window.deleteInvoice =
        function(invoiceId) {

            if (
                !confirm(
                    "Delete this invoice?"
                )
            ) {
                return;
            }


            invoices =
                invoices.filter(
                    invoice =>
                        String(invoice.id) !==
                        String(invoiceId)
                );


            saveData();

            renderAll();
        };


    /* =========================================================
       INVOICE MODAL
       ========================================================= */

    window.openInvoiceModal =
        function() {

            const customerSelect =
                document.getElementById(
                    "invoiceCustomer"
                );


            const productSelect =
                document.getElementById(
                    "invoiceProduct"
                );


            if (customerSelect) {

                customerSelect.innerHTML = `
                    <option value="">
                        Select a customer
                    </option>
                `;


                customers.forEach(customer => {

                    customerSelect.innerHTML += `
                        <option value="${safe(customer.id)}">
                            ${safe(customer.name)}
                        </option>
                    `;
                });
            }


            if (productSelect) {

                productSelect.innerHTML = `
                    <option value="">
                        Select a product
                    </option>
                `;


                products.forEach(product => {

                    productSelect.innerHTML += `
                        <option value="${safe(product.id)}">
                            ${safe(product.name)}
                            — ${money(product.price)}
                        </option>
                    `;
                });
            }


            document
                .getElementById(
                    "invoiceForm"
                )
                ?.reset();


            const quantity =
                document.getElementById(
                    "invoiceQuantity"
                );


            if (quantity) {
                quantity.value = 1;
            }


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


    function updateInvoiceTotal() {

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


        if (!product) {

            text(
                "invoiceSubtotal",
                money(0)
            );

            text(
                "invoiceTaxAmount",
                money(0)
            );

            text(
                "invoiceTotal",
                money(0)
            );

            return;
        }


        const subtotal =
            Number(product.price) *
            quantity;


        const afterDiscount =
            Math.max(
                0,
                subtotal - discount
            );


        const tax =
            afterDiscount *
            (taxRate / 100);


        const total =
            afterDiscount +
            tax;


        text(
            "invoiceSubtotal",
            money(subtotal)
        );


        text(
            "invoiceTaxAmount",
            money(tax)
        );


        text(
            "invoiceTotal",
            money(total)
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


                const dueDate =
                    document.getElementById(
                        "invoiceDueDate"
                    )?.value;


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


                if (
                    !Number.isFinite(discount) ||
                    discount < 0
                ) {

                    alert(
                        "Discount cannot be negative."
                    );

                    return;
                }


                if (
                    !Number.isFinite(taxRate) ||
                    taxRate < 0
                ) {

                    alert(
                        "Tax rate cannot be negative."
                    );

                    return;
                }


                const subtotal =
                    Number(product.price) *
                    quantity;


                const afterDiscount =
                    Math.max(
                        0,
                        subtotal - discount
                    );


                const tax =
                    afterDiscount *
                    (taxRate / 100);


                const total =
                    afterDiscount +
                    tax;


                const invoice = {

                    id:
                        createId(),

                    invoiceNumber:
                        "INV-" +
                        Math.floor(
                            100000 +
                            Math.random() * 900000
                        ),

                    customerId:
                        customer.id,

                    customerName:
                        customer.name,

                    productId:
                        product.id,

                    productName:
                        product.name,

                    quantity,

                    subtotal,

                    discount,

                    taxRate,

                    tax,

                    total,

                    dueDate:
                        dueDate ||
                        new Date()
                            .toISOString()
                            .split("T")[0],

                    status:
                        "Unpaid",

                    createdAt:
                        new Date().toISOString()
                };


                invoices.push(invoice);


                saveData();

                renderAll();

                closeInvoiceModal();


                alert(
                    "Invoice created successfully."
                );
            }
        );


    /* =========================================================
       VIEW INVOICE
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
                return;
            }


            const modal =
                document.getElementById(
                    "invoiceViewModal"
                );


            const content =
                document.getElementById(
                    "invoiceViewContent"
                );


            if (!modal || !content) {

                alert(
                    `Invoice ${invoice.invoiceNumber}\n\n` +
                    `Customer: ${invoice.customerName}\n` +
                    `Product: ${invoice.productName}\n` +
                    `Quantity: ${invoice.quantity}\n` +
                    `Total: ${money(invoice.total)}\n` +
                    `Status: ${invoice.status}`
                );

                return;
            }


            content.innerHTML = `

                <div class="invoice-modal-header">

                    <p class="eyebrow">
                        BUSINESSOS INVOICE
                    </p>

                    <h2>
                        ${safe(invoice.invoiceNumber)}
                    </h2>

                    <p>
                        Created:
                        ${formatDate(invoice.createdAt)}
                    </p>

                </div>


                <div class="invoice-preview">

                    <div class="invoice-preview-row">

                        <span>
                            Customer
                        </span>

                        <strong>
                            ${safe(
                                invoice.customerName
                            )}
                        </strong>

                    </div>


                    <div class="invoice-preview-row">

                        <span>
                            Product
                        </span>

                        <strong>
                            ${safe(
                                invoice.productName
                            )}
                        </strong>

                    </div>


                    <div class="invoice-preview-row">

                        <span>
                            Quantity
                        </span>

                        <strong>
                            ${Number(
                                invoice.quantity
                            )}
                        </strong>

                    </div>


                    <div class="invoice-preview-row">

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ${money(
                                invoice.subtotal
                            )}
                        </strong>

                    </div>


                    <div class="invoice-preview-row">

                        <span>
                            Discount
                        </span>

                        <strong>
                            -${money(
                                invoice.discount
                            )}
                        </strong>

                    </div>


                    <div class="invoice-preview-row">

                        <span>
                            Tax
                            (${Number(
                                invoice.taxRate || 0
                            )}%)
                        </span>

                        <strong>
                            ${money(
                                invoice.tax
                            )}
                        </strong>

                    </div>


                    <div class="invoice-preview-row">

                        <span>
                            Due Date
                        </span>

                        <strong>
                            ${formatDate(
                                invoice.dueDate
                            )}
                        </strong>

                    </div>


                    <div class="invoice-total-row">

                        <strong>
                            Total
                        </strong>

                        <strong>
                            ${money(
                                invoice.total
                            )}
                        </strong>

                    </div>


                    <div style="
                        margin-top:15px;
                        text-align:center;
                    ">

                        <span
                            class="invoice-status"
                            style="
                                background:${
                                    invoice.status === "Paid"
                                        ? "#dcfce7"
                                        : "#fef3c7"
                                };
                                color:${
                                    invoice.status === "Paid"
                                        ? "#166534"
                                        : "#92400e"
                                };
                            "
                        >
                            ${safe(invoice.status)}
                        </span>

                    </div>

                </div>
            `;


            modal.classList.add("active");
        };


    window.closeInvoiceViewModal =
        function() {

            document
                .getElementById(
                    "invoiceViewModal"
                )
                ?.classList.remove("active");
        };


    /* =========================================================
       SEARCH
       ========================================================= */

    function setupSearch() {

        const productSearch =
            document.getElementById(
                "productSearch"
            );


        const customerSearch =
            document.getElementById(
                "customerSearch"
            );


        if (productSearch) {

            productSearch.addEventListener(
                "input",
                () => {

                    const query =
                        productSearch.value
                            .toLowerCase()
                            .trim();


                    const list =
                        document.getElementById(
                            "productsList"
                        );


                    if (!list) {
                        return;
                    }


                    const filtered =
                        products.filter(
                            product =>
                                String(
                                    product.name
                                )
                                    .toLowerCase()
                                    .includes(query)
                        );


                    renderProductResults(
                        filtered
                    );
                }
            );
        }


        if (customerSearch) {

            customerSearch.addEventListener(
                "input",
                () => {

                    const query =
                        customerSearch.value
                            .toLowerCase()
                            .trim();


                    const list =
                        document.getElementById(
                            "customersList"
                        );


                    if (!list) {
                        return;
                    }


                    const filtered =
                        customers.filter(
                            customer =>
                                String(
                                    customer.name
                                )
                                    .toLowerCase()
                                    .includes(query) ||

                                String(
                                    customer.email
                                )
                                    .toLowerCase()
                                    .includes(query) ||

                                String(
                                    customer.phone
                                )
                                    .toLowerCase()
                                    .includes(query)
                        );


                    renderCustomerResults(
                        filtered
                    );
                }
            );
        }
    }


    function renderProductResults(items) {

        const list =
            document.getElementById(
                "productsList"
            );


        if (!list) {
            return;
        }


        if (!items.length) {

            list.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        🔍
                    </div>

                    <h3>
                        No products found
                    </h3>

                    <p>
                        Try a different search.
                    </p>

                </div>
            `;

            return;
        }


        list.innerHTML =
            items.map(product => {

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
                                onclick="editProduct('${safe(product.id)}')">
                                Edit
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteProduct('${safe(product.id)}')">
                                Delete
                            </button>

                        </div>

                    </div>
                `;

            }).join("");
    }


    function renderCustomerResults(items) {

        const list =
            document.getElementById(
                "customersList"
            );


        if (!list) {
            return;
        }


        if (!items.length) {

            list.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        🔍
                    </div>

                    <h3>
                        No customers found
                    </h3>

                    <p>
                        Try a different search.
                    </p>

                </div>
            `;

            return;
        }


        list.innerHTML =
            items.map(customer => {

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
                            onclick="deleteCustomer('${safe(customer.id)}')">
                            Delete
                        </button>

                    </div>
                `;

            }).join("");
    }


    /* =========================================================
       INVOICE FILTER BUTTONS
       ========================================================= */

    window.filterInvoices =
        function(filter) {

            renderInvoices(
                filter
            );
        };


    document
        .getElementById(
            "invoiceFilter"
        )
        ?.addEventListener(
            "change",
            event => {

                renderInvoices(
                    event.target.value
                );
            }
        );


    /* =========================================================
       BACKUP
       ========================================================= */

    window.exportBackup =
        function() {

            const backup = {

                businessOS:
                    true,

                version:
                    "1.0",

                exportedAt:
                    new Date().toISOString(),

                products,

                customers,

                sales,

                invoices
            };


            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            backup,
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
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                `businessos-backup-${todayString()}.json`;


            document
                .body
                .appendChild(link);


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );
        };


    /* =========================================================
       IMPORT BACKUP
       ========================================================= */

    window.importBackup =
        function() {

            let input =
                document.getElementById(
                    "backupFile"
                );


            if (!input) {

                input =
                    document.createElement(
                        "input"
                    );

                input.type =
                    "file";

                input.accept =
                    ".json,application/json";

                input.id =
                    "backupFile";

                input.style.display =
                    "none";


                document
                    .body
                    .appendChild(input);
            }


            input.value = "";


            input.onchange =
                async event => {

                    const file =
                        event.target.files?.[0];


                    if (!file) {
                        return;
                    }


                    try {

                        const content =
                            await file.text();


                        const backup =
                            JSON.parse(
                                content
                            );


                        if (
                            !backup ||
                            !Array.isArray(
                                backup.products
                            ) ||
                            !Array.isArray(
                                backup.customers
                            ) ||
                            !Array.isArray(
                                backup.sales
                            ) ||
                            !Array.isArray(
                                backup.invoices
                            )
                        ) {

                            throw new Error(
                                "Invalid backup file."
                            );
                        }


                        if (
                            !confirm(
                                "Importing this backup will replace your current BusinessOS data. Continue?"
                            )
                        ) {
                            return;
                        }


                        products =
                            backup.products;

                        customers =
                            backup.customers;

                        sales =
                            backup.sales;

                        invoices =
                            backup.invoices;


                        saveData();

                        renderAll();


                        alert(
                            "BusinessOS backup imported successfully."
                        );

                    } catch (error) {

                        console.error(
                            error
                        );


                        alert(
                            "Could not import this backup. Please select a valid BusinessOS JSON backup."
                        );
                    }
                };


            input.click();
        };


    /* =========================================================
       RESET BUSINESS DATA
       ========================================================= */

    window.resetBusinessData =
        function() {

            const firstConfirm =
                confirm(
                    "This will permanently delete all BusinessOS data stored in this browser. Continue?"
                );


            if (!firstConfirm) {
                return;
            }


            const secondConfirm =
                confirm(
                    "Are you absolutely sure? Products, customers, sales and invoices will be deleted."
                );


            if (!secondConfirm) {
                return;
            }


            products = [];

            customers = [];

            sales = [];

            invoices = [];


            localStorage.removeItem(
                "businessOSProducts"
            );


            localStorage.removeItem(
                "businessOSCustomers"
            );


            localStorage.removeItem(
                "businessOSSales"
            );


            localStorage.removeItem(
                "businessOSInvoices"
            );


            renderAll();


            alert(
                "BusinessOS data has been reset."
            );
        };


    /* =========================================================
       MODAL CLICK OUTSIDE
       ========================================================= */

    document.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "modal"
                )
            ) {

                event.target.classList.remove(
                    "active"
                );
            }
        }
    );


    /* =========================================================
       ESCAPE KEY
       ========================================================= */

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
                    .forEach(
                        modal =>
                            modal.classList.remove(
                                "active"
                            )
                    );
            }
        }
    );


    /* =========================================================
       NAVIGATION
       ========================================================= */

    function setupNavigation() {

        document
            .querySelectorAll(
                'nav a[href^="#"]'
            )
            .forEach(link => {

                link.addEventListener(
                    "click",
                    event => {

                        const targetId =
                            link
                                .getAttribute(
                                    "href"
                                )
                                ?.substring(1);


                        const target =
                            document.getElementById(
                                targetId
                            );


                        if (target) {

                            event.preventDefault();


                            target.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "start"
                            });
                        }
                    }
                );
            });
    }


    /* =========================================================
       RENDER ALL
       ========================================================= */

function renderAll() {

    renderProducts();

    renderCustomers();

    renderSales();

    renderInvoices();

    updateAnalytics();

    renderRecentActivity();
}

    /* =========================================================
       START APPLICATION
       ========================================================= */
function renderRecentActivity() {

    const container =
        document.getElementById("recentActivity");

    if (!container) {
        return;
    }

    const activity = [];

    /* Recent sales */

    sales.forEach(sale => {

        activity.push({

            type: "sale",

            icon: "🛒",

            title: `Sale: ${sale.productName || "Product"}`,

            detail:
                `Quantity: ${Number(sale.quantity) || 0}`,

            value:
                money(sale.total),

            date:
                sale.date || ""

        });

    });


    /* Recent invoices */

    invoices.forEach(invoice => {

        activity.push({

            type: "invoice",

            icon: "🧾",

            title:
                `Invoice ${invoice.invoiceNumber || ""}`,

            detail:
                invoice.customerName ||
                "Customer",

            value:
                money(invoice.total),

            date:
                invoice.createdAt || ""

        });

    });


    /* Sort newest first */

    activity.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    const recent =
        activity.slice(0, 6);


    if (!recent.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📊
                </div>

                <h3>
                    No recent activity
                </h3>

                <p>
                    Your latest business activity
                    will appear here.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        recent.map(item => {

            return `

                <div class="activity-item">

                    <div class="activity-icon">
                        ${item.icon}
                    </div>

                    <div class="activity-info">

                        <strong>
                            ${safe(item.title)}
                        </strong>

                        <span>
                            ${safe(item.detail)}
                            •
                            ${formatDate(item.date)}
                        </span>

                    </div>

                    <div class="activity-value">
                        ${item.value}
                    </div>

                </div>

            `;

        }).join("");
}
    setupSearch();

    setupNavigation();

    renderAll();


    console.log(
        "BusinessOS loaded successfully."
    );

});
