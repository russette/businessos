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

                        <h3>${safe(product.name)}</h3>

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
                document.getElementById("productModalTitle");

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
                    title.textContent = "Edit Product";
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
        ?.addEventListener("submit", event => {

            event.preventDefault();

            const productId =
                document.getElementById("productId")?.value;

            const name =
                document
                    .getElementById("productName")
                    ?.value.trim();

            const price =
                Number(
                    document
                        .getElementById("productPrice")
                        ?.value
                );

            const stock =
                Number(
                    document
                        .getElementById("productStock")
                        ?.value
                );

            if (!name) {
                alert("Enter a product name.");
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
        });


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

            if (usedInSales || usedInInvoices) {

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
            document.getElementById("customersList");

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
                        to start building your
                        customer list.
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
        ?.addEventListener("submit", event => {

            event.preventDefault();

            const name =
                document
                    .getElementById("customerName")
                    ?.value.trim();

            const email =
                document
                    .getElementById("customerEmail")
                    ?.value.trim();

            const phone =
                document
                    .getElementById("customerPhone")
                    ?.value.trim();

            if (!name) {
                alert("Enter customer name.");
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
        });


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
                document.getElementById("saleProduct");

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
                document.getElementById("saleQuantity");

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
            document.getElementById("saleProduct")?.value;

        const quantity =
            Number(
                document.getElementById("saleQuantity")?.value
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
        ?.addEventListener("submit", event => {

            event.preventDefault();

            const productId =
                document.getElementById("saleProduct")?.value;

            const quantity =
                Number(
                    document
                        .getElementById("saleQuantity")
                        ?.value
                );

            const product =
                products.find(
                    p =>
                        String(p.id) ===
                        String(productId)
                );

            if (!product) {
                alert("Select a product.");
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
                Number(product.price) * quantity;

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
        });


    function renderSales() {

        const list =
            document.getElementById("salesList");

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
                alert("Sale not found.");
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
       INVOICES
       ========================================================= */

    window.openInvoiceModal =
        function() {

            const customerSelect =
                document.getElementById("invoiceCustomer");

            const productSelect =
                document.getElementById("invoiceProduct");

            if (customerSelect) {

                customerSelect.innerHTML = `
                    <option value="">
                        Select customer
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
                        Select product
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

            const quantity =
                document.getElementById("invoiceQuantity");

            if (quantity) {
                quantity.value = 1;
            }

            const dueDate =
                document.getElementById("invoiceDueDate");

            if (dueDate) {

                const date = new Date();

                date.setDate(
                    date.getDate() + 14
                );

                dueDate.value =
                    date.toISOString()
                        .split("T")[0];
            }

            updateInvoiceTotal();

            document
                .getElementById("invoiceModal")
                ?.classList.add("active");
        };


    window.closeInvoiceModal =
        function() {

            document
                .getElementById("invoiceModal")
                ?.classList.remove("active");
        };


    function updateInvoiceTotal() {

        const productId =
            document
                .getElementById("invoiceProduct")
                ?.value;

        const quantity =
            Number(
                document
                    .getElementById("invoiceQuantity")
                    ?.value
            ) || 0;

        const discount =
            Number(
                document
                    .getElementById("invoiceDiscount")
                    ?.value
            ) || 0;

        const taxRate =
            Number(
                document
                    .getElementById("invoiceTax")
                    ?.value
            ) || 0;

        const product =
            products.find(
                p =>
                    String(p.id) ===
                    String(productId)
            );

        const subtotal =
            product
                ? Number(product.price) * quantity
                : 0;

        const taxable =
            Math.max(
                0,
                subtotal - discount
            );

        const tax =
            taxable * (taxRate / 100);

        const total =
            taxable + tax;

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


    [
        "invoiceProduct",
        "invoiceQuantity",
        "invoiceDiscount",
        "invoiceTax"
    ].forEach(id => {

        document
            .getElementById(id)
            ?.addEventListener(
                "input",
                updateInvoiceTotal
            );

        document
            .getElementById(id)
            ?.addEventListener(
                "change",
                updateInvoiceTotal
            );
    });


    document
        .getElementById("invoiceForm")
        ?.addEventListener("submit", event => {

            event.preventDefault();

            const customerId =
                document
                    .getElementById("invoiceCustomer")
                    ?.value;

            const productId =
                document
                    .getElementById("invoiceProduct")
                    ?.value;

            const quantity =
                Number(
                    document
                        .getElementById("invoiceQuantity")
                        ?.value
                );

            const discount =
                Number(
                    document
                        .getElementById("invoiceDiscount")
                        ?.value
                ) || 0;

            const taxRate =
                Number(
                    document
                        .getElementById("invoiceTax")
                        ?.value
                ) || 0;

            const dueDate =
                document
                    .getElementById("invoiceDueDate")
                    ?.value;

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

            if (discount < 0) {

                alert(
                    "Discount cannot be negative."
                );

                return;
            }

            if (taxRate < 0) {

                alert(
                    "Tax cannot be negative."
                );

                return;
            }

            const subtotal =
                Number(product.price) *
                quantity;

            const taxable =
                Math.max(
                    0,
                    subtotal - discount
                );

            const tax =
                taxable *
                (taxRate / 100);

            const total =
                taxable + tax;

            const invoiceNumber =
                "INV-" +
                Math.floor(
                    100000 +
                    Math.random() * 900000
                );

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

                subtotal,

                discount,

                taxRate,

                tax,

                total,

                dueDate,

                status: "Paid",

                createdAt:
                    new Date().toISOString()
            });

            saveData();
            renderAll();
            closeInvoiceModal();

            alert(
                `Invoice ${invoiceNumber} created successfully.`
            );
        });


    function renderInvoices() {

        const list =
            document.getElementById("invoicesList");

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
                        to start billing customers.
                    </p>

                </div>
            `;

            return;
        }

        list.innerHTML =
            [...invoices]
                .reverse()
                .map(invoice => {

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
                                    ${money(invoice.total)}
                                </strong>

                                <br>

                                <span class="invoice-status">
                                    ${safe(
                                        invoice.status
                                    )}
                                </span>

                                <div class="product-actions">

                                    <button
                                        onclick="toggleInvoiceStatus('${invoice.id}')">
                                        ${
                                            invoice.status === "Paid"
                                                ? "Mark as Unpaid"
                                                : "Mark as Paid"
                                        }
                                    </button>

                                    <button
                                        class="edit-btn"
                                        onclick="viewInvoice('${invoice.id}')">
                                        👁️ View Invoice
                                    </button>

                                    <button
                                        class="delete-btn"
                                        onclick="deleteInvoice('${invoice.id}')">
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
                    i =>
                        String(i.id) ===
                        String(invoiceId)
                );

            if (!invoice) return;

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


    window.viewInvoice =
        function(invoiceId) {

            const invoice =
                invoices.find(
                    i =>
                        String(i.id) ===
                        String(invoiceId)
                );

            if (!invoice) return;

            alert(
                `Invoice: ${invoice.invoiceNumber}

Customer: ${invoice.customerName}

Product: ${invoice.productName}

Quantity: ${invoice.quantity}

Subtotal: ${money(invoice.subtotal)}

Discount: ${money(invoice.discount)}

Tax: ${money(invoice.tax)}

Total: ${money(invoice.total)}

Status: ${invoice.status}

Due: ${formatDate(invoice.dueDate)}`
            );
        };


    /* =========================================================
       ANALYTICS
       ========================================================= */

    function updateAnalytics() {

        const totalRevenue =
            sales.reduce(
                (sum, sale) =>
                    sum + Number(sale.total || 0),
                0
            );


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

                    if (
                        saleDate ===
                        todayString
                    ) {
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
           DASHBOARD
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
            "overviewUnits",
            unitsSold
        );

        text(
            "overviewAverage",
            money(averageSale)
        );

        text(
            "overviewLargest",
            money(largestSale)
        );


        /* =====================================================
           TOP PRODUCTS
           ===================================================== */

        const topProducts =
            document.getElementById(
                "topProducts"
            );

        if (topProducts) {

            if (!ranked.length) {

                topProducts.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            🏆
                        </div>

                        <h3>
                            No sales yet
                        </h3>

                        <p>
                            Your best-selling products
                            will appear here.
                        </p>
                    </div>
                `;

            } else {

                const highest =
                    ranked[0][1];

                topProducts.innerHTML =
                    ranked
                        .slice(0, 5)
                        .map(
                            ([name, quantity], index) => {

                                const percentage =
                                    highest
                                        ? (
                                            quantity /
                                            highest
                                        ) * 100
                                        : 0;

                                const medals = [
                                    "🥇",
                                    "🥈",
                                    "🥉"
                                ];

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
                                                    sale${
                                                        quantity === 1
                                                            ? ""
                                                            : "s"
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
                        )
                        .join("");
            }
        }


        /* =====================================================
           INVENTORY ALERTS
           ===================================================== */

        const inventoryAlerts =
            document.getElementById(
                "inventoryAlerts"
            );

        if (inventoryAlerts) {

            const lowProducts =
                products.filter(
                    product =>
                        Number(product.stock || 0) <= 3
                );

            if (!lowProducts.length) {

                inventoryAlerts.innerHTML = `
                    <div class="success-message">
                        ✅ All products have healthy stock levels.
                    </div>
                `;

            } else {

                inventoryAlerts.innerHTML =
                    lowProducts
                        .map(product => {

                            return `
                                <div class="success-message"
                                     style="background:#fff7ed;border-color:#fed7aa;color:#9a3412;">

                                    ⚠️
                                    ${safe(product.name)}
                                    has only
                                    ${Number(product.stock) || 0}
                                    unit${
                                        Number(product.stock) === 1
                                            ? ""
                                            : "s"
                                    }
                                    left.

                                </div>
                            `;

                        })
                        .join("");
            }
        }


        /* =====================================================
           REVENUE TREND
           ===================================================== */

        const revenueChart =
            document.getElementById(
                "revenueChart"
            );

        if (revenueChart) {

            if (!sales.length) {

                revenueChart.innerHTML = `
                    <div class="empty-chart">
                        No sales data available yet.
                    </div>
                `;

            } else {

                const grouped = {};

                sales.forEach(sale => {

                    const date =
                        new Date(sale.date);

                    if (
                        Number.isNaN(
                            date.getTime()
                        )
                    ) {
                        return;
                    }

                    const key =
                        date
                            .toISOString()
                            .split("T")[0];

                    grouped[key] =
                        (
                            grouped[key] || 0
                        ) +
                        Number(
                            sale.total || 0
                        );
                });


                const entries =
                    Object.entries(grouped)
                        .sort(
                            (a, b) =>
                                new Date(a[0]) -
                                new Date(b[0])
                        )
                        .slice(-7);


                revenueChart.innerHTML = `
                    <div style="
                        padding:20px;
                        display:flex;
                        flex-direction:column;
                        gap:12px;
                    ">

                        ${
                            entries.map(
                                ([date, amount]) => `
                                    <div style="
                                        display:flex;
                                        justify-content:space-between;
                                        gap:15px;
                                        padding:10px 0;
                                        border-bottom:1px solid #e5e7eb;
                                    ">

                                        <span>
                                            ${formatDate(date)}
                                        </span>

                                        <strong>
                                            ${money(amount)}
                                        </strong>

                                    </div>
                                `
                            ).join("")
                        }

                    </div>
                `;
            }
        }
    }


    /* =========================================================
       SEARCH
       ========================================================= */

    function setupSearch(
        inputId,
        listId,
        type
    ) {

        const input =
            document.getElementById(inputId);

        if (!input) return;

        input.addEventListener(
            "input",
            () => {

                const query =
                    input.value
                        .toLowerCase()
                        .trim();

                const cards =
                    document
                        .getElementById(listId)
                        ?.children;

                if (!cards) return;

                Array.from(cards)
                    .forEach(card => {

                        if (
                            card.classList.contains(
                                "empty-state"
                            )
                        ) {
                            return;
                        }

                        let searchable = "";

                        if (type === "products") {
                            searchable =
                                card.textContent.toLowerCase();
                        }

                        if (type === "customers") {
                            searchable =
                                card.textContent.toLowerCase();
                        }

                        if (type === "sales") {
                            searchable =
                                card.textContent.toLowerCase();
                        }

                        if (type === "invoices") {
                            searchable =
                                card.textContent.toLowerCase();
                        }

                        card.style.display =
                            searchable.includes(query)
                                ? ""
                                : "none";
                    });
            }
        );
    }


    setupSearch(
        "productSearch",
        "productsList",
        "products"
    );

    setupSearch(
        "customerSearch",
        "customersList",
        "customers"
    );

    setupSearch(
        "salesSearch",
        "salesList",
        "sales"
    );

    setupSearch(
        "invoiceSearch",
        "invoicesList",
        "invoices"
    );


    /* =========================================================
       BACKUP
       ========================================================= */

    window.exportBackup =
        function() {

            const backup = {

                version: 1,

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
                `businessos-backup-${
                    new Date()
                        .toISOString()
                        .split("T")[0]
                }.json`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);
        };


    /* =========================================================
       IMPORT BACKUP
       ========================================================= */

    window.importBackup =
        function(event) {

            const file =
                event.target.files?.[0];

            if (!file) return;

            const reader =
                new FileReader();

            reader.onload =
                function(e) {

                    try {

                        const backup =
                            JSON.parse(
                                e.target.result
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
                            "Backup imported successfully."
                        );

                    } catch (error) {

                        console.error(error);

                        alert(
                            "This backup file is invalid."
                        );
                    }
                };

            reader.readAsText(file);

            event.target.value = "";
        };


    /* =========================================================
       RESET BUSINESS DATA
       ========================================================= */

    window.resetBusinessData =
        function() {

            const firstConfirm =
                confirm(
                    "WARNING: This will permanently delete all BusinessOS data. Continue?"
                );

            if (!firstConfirm) {
                return;
            }

            const secondConfirm =
                prompt(
                    "Type DELETE to confirm."
                );

            if (
                secondConfirm !==
                "DELETE"
            ) {
                alert(
                    "Reset cancelled."
                );

                return;
            }

            products = [];
            customers = [];
            sales = [];
            invoices = [];

            saveData();

            renderAll();

            alert(
                "BusinessOS data has been reset."
            );
        };


    /* =========================================================
       CLOSE MODALS WHEN CLICKING OUTSIDE
       ========================================================= */

    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {
                        modal.classList.remove(
                            "active"
                        );
                    }
                }
            );
        });


    /* =========================================================
       ESCAPE KEY CLOSES MODALS
       ========================================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            document
                .querySelectorAll(".modal.active")
                .forEach(modal => {

                    modal.classList.remove(
                        "active"
                    );
                });
        }
    );


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

    renderAll();

    console.log(
        "BusinessOS loaded successfully."
    );

});
