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

        const element =
            document.getElementById(id);

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


    function todayString() {

        const today = new Date();

        return today.toISOString().split("T")[0];
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
       NAVIGATION
       ========================================================= */

    window.scrollToSection =
        function(sectionId) {

            const section =
                document.getElementById(sectionId);

            if (!section) {
                return;
            }

            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        };


    function setupNavigation() {

        document
            .querySelectorAll('nav a[href^="#"]')
            .forEach(link => {

                link.addEventListener(
                    "click",
                    event => {

                        const targetId =
                            link
                                .getAttribute("href")
                                ?.substring(1);

                        const target =
                            document.getElementById(
                                targetId
                            );

                        if (target) {

                            event.preventDefault();

                            target.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });
                        }
                    }
                );
            });
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

                    <div class="empty-icon">
                        📦
                    </div>

                    <h3>No products yet</h3>

                    <p>
                        Add your first product to start
                        managing your inventory.
                    </p>

                </div>
            `;

            return;
        }

        renderProductResults(products);
    }


    function renderProductResults(items) {

        const list =
            document.getElementById("productsList");

        if (!list) {
            return;
        }

        if (!items.length) {

            list.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        🔍
                    </div>

                    <h3>No products found</h3>

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
                document.getElementById("productId");

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
                    title.textContent = "Edit Product";
                }

                if (hidden) {
                    hidden.value = product.id;
                }

                document.getElementById("productName").value =
                    product.name;

                document.getElementById("productPrice").value =
                    product.price;

                document.getElementById("productStock").value =
                    product.stock;

            } else {

                if (title) {
                    title.textContent = "Add Product";
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

                if (
                    !confirm(
                        "This product is connected to existing sales or invoices. Delete it anyway?"
                    )
                ) {
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

        if (!customers.length) {

            renderCustomerResults([]);

            return;
        }

        renderCustomerResults(customers);
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
                        ${
                            customers.length
                                ? "🔍"
                                : "👥"
                        }
                    </div>

                    <h3>
                        ${
                            customers.length
                                ? "No customers found"
                                : "No customers yet"
                        }
                    </h3>

                    <p>
                        ${
                            customers.length
                                ? "Try a different search."
                                : "Add your first customer to start building your customer list."
                        }
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


    window.openCustomerModal =
        function() {

            document
                .getElementById("customerForm")
                ?.reset();

            document
                .getElementById("customerModal")
                ?.classList.add("active");
        };


    window.closeCustomerModal =
        function() {

            document
                .getElementById("customerModal")
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

                if (
                    !confirm(
                        "This customer has invoices. Delete the customer anyway?"
                    )
                ) {
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

                const stock =
                    Number(product.stock) || 0;

                select.innerHTML += `
                    <option
                        value="${safe(product.id)}"
                        ${stock <= 0 ? "disabled" : ""}
                    >
                        ${safe(product.name)}
                        — ${money(product.price)}
                        — Stock: ${stock}
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
                .getElementById("saleModal")
                ?.classList.add("active");
        };


    window.closeSaleModal =
        function() {

            document
                .getElementById("saleModal")
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
                ? Number(product.price) * quantity
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

                    productName: product.name,

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


    function renderSales(items = sales) {

        const list =
            document.getElementById(
                "salesList"
            );

        if (!list) {
            return;
        }

        if (!items.length) {

            list.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ${
                            sales.length
                                ? "🔍"
                                : "🧾"
                        }
                    </div>

                    <h3>
                        ${
                            sales.length
                                ? "No sales found"
                                : "No sales yet"
                        }
                    </h3>

                    <p>
                        ${
                            sales.length
                                ? "Try a different search."
                                : "Your recorded sales will appear here."
                        }
                    </p>

                </div>
            `;

            return;
        }

        list.innerHTML =
            [...items]
                .sort(
                    (a, b) =>
                        new Date(b.date) -
                        new Date(a.date)
                )
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
                                    ${money(sale.total)}
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
                Number(sale.quantity || 0);
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

        renderTopProducts(ranked);

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

    function generateInvoiceNumber() {

        return (
            "INV-" +
            Math.floor(
                100000 +
                Math.random() * 900000
            )
        );
    }


    function renderInvoices(
        filter = "all",
        search = ""
    ) {

        const list =
            document.getElementById(
                "invoicesList"
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

        const query =
            String(search || "")
                .toLowerCase()
                .trim();

        if (query) {

            filtered =
                filtered.filter(
                    invoice => {

                        return (

                            String(
                                invoice.invoiceNumber || ""
                            )
                                .toLowerCase()
                                .includes(query)

                            ||

                            String(
                                invoice.customerName || ""
                            )
                                .toLowerCase()
                                .includes(query)

                            ||

                            String(
                                invoice.productName || ""
                            )
                                .toLowerCase()
                                .includes(query)

                        );
                    }
                );
        }

        if (!filtered.length) {

            list.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ${
                            invoices.length
                                ? "🔍"
                                : "🧾"
                        }
                    </div>

                    <h3>
                        ${
                            invoices.length
                                ? "No invoices found"
                                : "No invoices yet"
                        }
                    </h3>

                    <p>
                        ${
                            invoices.length
                                ? "Try a different search or filter."
                                : "Create your first invoice for a customer."
                        }
                    </p>

                </div>
            `;

            return;
        }

        list.innerHTML =
            filtered
                .sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                )
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


    window.filterInvoices =
        function(filter) {

            const search =
                document.getElementById(
                    "invoiceSearch"
                )?.value || "";

            renderInvoices(
                filter,
                search
            );
        };


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

            const modal =
                document.getElementById(
                    "invoiceModal"
                );

            if (!modal) {
                return;
            }

            const form =
                document.getElementById(
                    "invoiceForm"
                );

            form?.reset();

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
                            — Stock: ${Number(product.stock) || 0}
                        </option>
                    `;
                });
            }

            text(
                "invoiceNumber",
                generateInvoiceNumber()
            );

            const invoiceNumber =
                document.getElementById(
                    "invoiceNumber"
                );

            if (invoiceNumber) {
                invoiceNumber.value =
                    generateInvoiceNumber();
            }

            const quantity =
                document.getElementById(
                    "invoiceQuantity"
                );

            if (quantity) {
                quantity.value = 1;
            }

            const dueDate =
                document.getElementById(
                    "invoiceDueDate"
                );

            if (dueDate) {

                const due =
                    new Date();

                due.setDate(
                    due.getDate() + 14
                );

                dueDate.value =
                    due.toISOString()
                        .split("T")[0];
            }

            const discount =
                document.getElementById(
                    "invoiceDiscount"
                );

            if (discount) {
                discount.value = 0;
            }

            const tax =
                document.getElementById(
                    "invoiceTax"
                );

            if (tax) {
                tax.value = 0;
            }

            updateInvoiceTotal();

            modal.classList.add("active");
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
                "invoiceDiscountDisplay",
                "-" + money(0)
            );

            text(
                "invoiceTaxAmount",
                money(0)
            );

            text(
                "invoiceTaxDisplay",
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

        const safeDiscount =
            Math.min(
                Math.max(0, discount),
                subtotal
            );

        const afterDiscount =
            subtotal -
            safeDiscount;

        const tax =
            afterDiscount *
            (Math.max(0, taxRate) / 100);

        const total =
            afterDiscount +
            tax;

        text(
            "invoiceSubtotal",
            money(subtotal)
        );

        text(
            "invoiceDiscountDisplay",
            "-" + money(safeDiscount)
        );

        text(
            "invoiceTaxAmount",
            money(tax)
        );

        text(
            "invoiceTaxDisplay",
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

                const discountInput =
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
                    !Number.isFinite(discountInput) ||
                    discountInput < 0
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

                const discount =
                    Math.min(
                        discountInput,
                        subtotal
                    );

                const afterDiscount =
                    subtotal -
                    discount;

                const tax =
                    afterDiscount *
                    (taxRate / 100);

                const total =
                    afterDiscount +
                    tax;

                const numberElement =
                    document.getElementById(
                        "invoiceNumber"
                    );

                const invoiceNumber =
                    numberElement?.value ||
                    generateInvoiceNumber();

                const invoice = {

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

                    subtotal,

                    discount,

                    taxRate,

                    tax,

                    total,

                    dueDate:
                        dueDate ||
                        todayString(),

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
                    `Subtotal: ${money(invoice.subtotal)}\n` +
                    `Discount: -${money(invoice.discount)}\n` +
                    `Tax: ${money(invoice.tax)}\n` +
                    `Total: ${money(invoice.total)}\n` +
                    `Due: ${formatDate(invoice.dueDate)}\n` +
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
                        <span>Customer</span>
                        <strong>
                            ${safe(invoice.customerName)}
                        </strong>
                    </div>

                    <div class="invoice-preview-row">
                        <span>Product</span>
                        <strong>
                            ${safe(invoice.productName)}
                        </strong>
                    </div>

                    <div class="invoice-preview-row">
                        <span>Quantity</span>
                        <strong>
                            ${Number(invoice.quantity)}
                        </strong>
                    </div>

                    <div class="invoice-preview-row">
                        <span>Subtotal</span>
                        <strong>
                            ${money(invoice.subtotal)}
                        </strong>
                    </div>

                    <div class="invoice-preview-row">
                        <span>Discount</span>
                        <strong>
                            -${money(invoice.discount)}
                        </strong>
                    </div>

                    <div class="invoice-preview-row">
                        <span>
                            Tax (${Number(invoice.taxRate || 0)}%)
                        </span>
                        <strong>
                            ${money(invoice.tax)}
                        </strong>
                    </div>

                    <div class="invoice-preview-row">
                        <span>Due Date</span>
                        <strong>
                            ${formatDate(invoice.dueDate)}
                        </strong>
                    </div>

                    <div class="invoice-total-row">
                        <strong>Total</strong>
                        <strong>
                            ${money(invoice.total)}
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

        const salesSearch =
            document.getElementById(
                "salesSearch"
            );

        const invoiceSearch =
            document.getElementById(
                "invoiceSearch"
            );

        const invoiceStatusFilter =
            document.getElementById(
                "invoiceStatusFilter"
            );


        /* Product search */

        productSearch?.addEventListener(
            "input",
            () => {

                const query =
                    productSearch.value
                        .toLowerCase()
                        .trim();

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


        /* Customer search */

        customerSearch?.addEventListener(
            "input",
            () => {

                const query =
                    customerSearch.value
                        .toLowerCase()
                        .trim();

                const filtered =
                    customers.filter(
                        customer =>
                            String(
                                customer.name
                            )
                                .toLowerCase()
                                .includes(query)

                            ||

                            String(
                                customer.email
                            )
                                .toLowerCase()
                                .includes(query)

                            ||

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


        /* Sales search */

        salesSearch?.addEventListener(
            "input",
            () => {

                const query =
                    salesSearch.value
                        .toLowerCase()
                        .trim();

                const filtered =
                    sales.filter(
                        sale => {

                            return (

                                String(
                                    sale.productName || ""
                                )
                                    .toLowerCase()
                                    .includes(query)

                                ||

                                String(
                                    sale.total || ""
                                )
                                    .toLowerCase()
                                    .includes(query)

                            );
                        }
                    );

                renderSales(
                    filtered
                );
            }
        );


        /* Invoice search */

        invoiceSearch?.addEventListener(
            "input",
            () => {

                const filter =
                    invoiceStatusFilter?.value ||
                    "all";

                renderInvoices(
                    filter,
                    invoiceSearch.value
                );
            }
        );


        /* Invoice filter */

        invoiceStatusFilter?.addEventListener(
            "change",
            () => {

                renderInvoices(
                    invoiceStatusFilter.value,
                    invoiceSearch?.value || ""
                );
            }
        );
    }


    /* =========================================================
       BACKUP EXPORT
       ========================================================= */

    window.exportBackup =
    window.exportBusinessData =
        function() {

            const backup = {

                businessOS: true,

                version: "1.0",

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
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `businessos-backup-${todayString()}.json`;

            document
                .body
                .appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);
        };


    /* =========================================================
       BACKUP IMPORT
       ========================================================= */

    window.importBackup =
    window.importBusinessData =
        function(file = null) {

            if (file) {

                processBackupFile(file);

                return;
            }

            let input =
                document.getElementById(
                    "backupFile"
                );

            if (!input) {

                input =
                    document.createElement("input");

                input.type = "file";

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
                event => {

                    const selectedFile =
                        event.target.files?.[0];

                    if (!selectedFile) {
                        return;
                    }

                    processBackupFile(
                        selectedFile
                    );
                };

            input.click();
        };


    async function processBackupFile(file) {

        try {

            const content =
                await file.text();

            const backup =
                JSON.parse(content);

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

            console.error(error);

            alert(
                "Could not import this backup. Please select a valid BusinessOS JSON backup."
            );
        }
    }


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
       RECENT ACTIVITY
       ========================================================= */

    function renderRecentActivity() {

        const container =
            document.getElementById(
                "recentActivity"
            );

        if (!container) {
            return;
        }

        const activity = [];


        /* Sales */

        sales.forEach(sale => {

            activity.push({

                type: "sale",

                icon: "🛒",

                title:
                    `Sale: ${
                        sale.productName ||
                        "Product"
                    }`,

                detail:
                    `Quantity: ${
                        Number(
                            sale.quantity
                        ) || 0
                    }`,

                value:
                    money(sale.total),

                date:
                    sale.date || ""
            });
        });


        /* Invoices */

        invoices.forEach(invoice => {

            activity.push({

                type: "invoice",

                icon: "🧾",

                title:
                    `Invoice ${
                        invoice.invoiceNumber ||
                        ""
                    }`,

                detail:
                    invoice.customerName ||
                    "Customer",

                value:
                    money(invoice.total),

                date:
                    invoice.createdAt || ""
            });
        });


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

            if (event.key === "Escape") {

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
       RENDER ALL
       ========================================================= */

    function renderAll() {

        renderProducts();

        renderCustomers();

        renderSales();

        const invoiceFilter =
            document.getElementById(
                "invoiceStatusFilter"
            )?.value || "all";

        const invoiceSearch =
            document.getElementById(
                "invoiceSearch"
            )?.value || "";

        renderInvoices(
            invoiceFilter,
            invoiceSearch
        );

        updateAnalytics();

        renderRecentActivity();
    }


    /* =========================================================
       START APPLICATION
       ========================================================= */

    setupSearch();

    setupNavigation();

    renderAll();


    console.log(
        "BusinessOS loaded successfully."
    );

});
