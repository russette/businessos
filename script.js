document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       BUSINESSOS
       COMPLETE BUSINESS MANAGEMENT SYSTEM
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
       PAYSTACK CONFIGURATION
       ========================================================= */

    /*
     * IMPORTANT:
     *
     * Your BusinessOS dashboard can display USD.
     *
     * However, because your Paystack merchant account is Ghana-based,
     * Paystack currently expects GHS for your merchant transactions.
     *
     * Therefore:
     *
     * BusinessOS display currency = USD
     * Paystack payment currency   = GHS
     *
     * Example:
     * BusinessOS Pro = $900 display price
     * Paystack charge = GHS 900
     *
     * Change PRO_PRICE_GHS if you want another amount.
     */

    const PAYSTACK_PUBLIC_KEY =
        "pk_test_2321844583071969c00a747ba838b337df808a44";

    const PAYSTACK_CURRENCY =
        "GHS";

    const PRO_PRICE_GHS =
        900;


    /* =========================================================
       HELPERS
       ========================================================= */

    function createId() {

        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2)
        );
    }


    function createReference(prefix = "BUSINESSOS") {

        return (
            prefix +
            "-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase()
        );
    }


    function money(value) {

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(Number(value) || 0);
    }


    function ghcMoney(value) {

        return new Intl.NumberFormat("en-GH", {
            style: "currency",
            currency: "GHS"
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

        const year =
            today.getFullYear();

        const month =
            String(today.getMonth() + 1).padStart(2, "0");

        const day =
            String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
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


    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            String(email).trim()
        );
    }


    /* =========================================================
       NAVIGATION
       ========================================================= */

    window.scrollToSection = function(sectionId) {

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

                link.addEventListener("click", event => {

                    const href =
                        link.getAttribute("href");

                    if (!href) {
                        return;
                    }

                    const targetId =
                        href.substring(1);

                    const target =
                        document.getElementById(targetId);

                    if (target) {

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                });
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
                    <div class="empty-icon">🔍</div>

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

                const nameInput =
                    document.getElementById(
                        "productName"
                    );

                const priceInput =
                    document.getElementById(
                        "productPrice"
                    );

                const stockInput =
                    document.getElementById(
                        "productStock"
                    );

                if (nameInput) {
                    nameInput.value =
                        product.name || "";
                }

                if (priceInput) {
                    priceInput.value =
                        product.price ?? "";
                }

                if (stockInput) {
                    stockInput.value =
                        product.stock ?? "";
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

            window.openProductModal(productId);
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
                    document
                        .getElementById("productName")
                        ?.value
                        .trim();

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

                        product.updatedAt =
                            new Date().toISOString();
                    }

                } else {

                    products.push({

                        id:
                            createId(),

                        name,

                        price,

                        stock,

                        createdAt:
                            new Date().toISOString(),

                        updatedAt:
                            new Date().toISOString()
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
                    document
                        .getElementById(
                            "customerName"
                        )
                        ?.value
                        .trim();

                const email =
                    document
                        .getElementById(
                            "customerEmail"
                        )
                        ?.value
                        .trim();

                const phone =
                    document
                        .getElementById(
                            "customerPhone"
                        )
                        ?.value
                        .trim();

                if (!name) {

                    alert(
                        "Enter customer name."
                    );

                    return;
                }

                if (
                    email &&
                    !isValidEmail(email)
                ) {

                    alert(
                        "Enter a valid email address."
                    );

                    return;
                }

                customers.push({

                    id:
                        createId(),

                    name,

                    email,

                    phone,

                    createdAt:
                        new Date().toISOString()
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
                    quantity <= 0 ||
                    !Number.isInteger(quantity)
                ) {

                    alert(
                        "Quantity must be a whole number greater than 0."
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
                                        ${
                                            Number(
                                                sale.quantity
                                            ) || 0
                                        }
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


    function setInvoiceDefaults() {

        const number =
            document.getElementById(
                "invoiceNumber"
            );

        if (number) {

            number.value =
                generateInvoiceNumber();
        }

        const dueDate =
            document.getElementById(
                "invoiceDueDate"
            );

        if (dueDate) {

            const date =
                new Date();

            date.setDate(
                date.getDate() + 7
            );

            const year =
                date.getFullYear();

            const month =
                String(
                    date.getMonth() + 1
                ).padStart(2, "0");

            const day =
                String(
                    date.getDate()
                ).padStart(2, "0");

            dueDate.value =
                `${year}-${month}-${day}`;
        }
    }


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

            if (
                !customerSelect ||
                !productSelect
            ) {
                return;
            }

            customerSelect.innerHTML = `
                <option value="">
                    Select a customer
                </option>
            `;

            customers.forEach(customer => {

                customerSelect.innerHTML += `
                    <option
                        value="${safe(customer.id)}">
                        ${safe(customer.name)}
                    </option>
                `;
            });

            productSelect.innerHTML = `
                <option value="">
                    Select a product
                </option>
            `;

            products.forEach(product => {

                productSelect.innerHTML += `
                    <option
                        value="${safe(product.id)}">
                        ${safe(product.name)}
                        — ${money(product.price)}
                    </option>
                `;
            });

            document
                .getElementById("invoiceForm")
                ?.reset();

            setInvoiceDefaults();

            updateInvoicePreview();

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


    function updateInvoicePreview() {

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

        const validDiscount =
            Math.min(
                Math.max(discount, 0),
                subtotal
            );

        const taxableAmount =
            Math.max(
                subtotal - validDiscount,
                0
            );

        const tax =
            taxableAmount *
            (
                Math.max(taxRate, 0) /
                100
            );

        const total =
            taxableAmount + tax;

        text(
            "invoiceSubtotal",
            money(subtotal)
        );

        text(
            "invoiceDiscountDisplay",
            "-" + money(validDiscount)
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
        .getElementById("invoiceProduct")
        ?.addEventListener(
            "change",
            updateInvoicePreview
        );


    document
        .getElementById("invoiceQuantity")
        ?.addEventListener(
            "input",
            updateInvoicePreview
        );


    document
        .getElementById("invoiceDiscount")
        ?.addEventListener(
            "input",
            updateInvoicePreview
        );


    document
        .getElementById("invoiceTax")
        ?.addEventListener(
            "input",
            updateInvoicePreview
        );


    document
        .getElementById("invoiceForm")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const invoiceNumber =
                    document.getElementById(
                        "invoiceNumber"
                    )?.value.trim();

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

                const dueDate =
                    document.getElementById(
                        "invoiceDueDate"
                    )?.value;

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
                    quantity <= 0 ||
                    !Number.isInteger(quantity)
                ) {

                    alert(
                        "Quantity must be a whole number greater than 0."
                    );

                    return;
                }

                if (!dueDate) {

                    alert(
                        "Select a due date."
                    );

                    return;
                }

                if (
                    discount < 0 ||
                    taxRate < 0
                ) {

                    alert(
                        "Discount and tax cannot be negative."
                    );

                    return;
                }

                const subtotal =
                    Number(product.price) *
                    quantity;

                const validDiscount =
                    Math.min(
                        discount,
                        subtotal
                    );

                const taxableAmount =
                    Math.max(
                        subtotal -
                        validDiscount,
                        0
                    );

                const tax =
                    taxableAmount *
                    (taxRate / 100);

                const total =
                    taxableAmount + tax;

                invoices.push({

                    id:
                        createId(),

                    invoiceNumber:
                        invoiceNumber ||
                        generateInvoiceNumber(),

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

                    discount:
                        validDiscount,

                    taxRate,

                    tax,

                    total,

                    dueDate,

                    status:
                        "unpaid",

                    createdAt:
                        new Date().toISOString()
                });

                saveData();

                renderAll();

                closeInvoiceModal();

                alert(
                    "Invoice created successfully."
                );
            }
        );


    function renderInvoices(
        items = invoices
    ) {

        const list =
            document.getElementById(
                "invoicesList"
            );

        if (!list) {
            return;
        }

        if (!items.length) {

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
            [...items]
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt
                        ) -
                        new Date(
                            a.createdAt
                        )
                )
                .map(invoice => {

                    const paid =
                        invoice.status ===
                        "paid";

                    return `
                        <div class="invoice-card">

                            <div>

                                <h3>
                                    ${safe(
                                        invoice.invoiceNumber ||
                                        "Invoice"
                                    )}
                                </h3>

                                <p>
                                    👤
                                    ${safe(
                                        invoice.customerName ||
                                        "Unknown Customer"
                                    )}
                                </p>

                                <p>
                                    📦
                                    ${safe(
                                        invoice.productName ||
                                        "Unknown Product"
                                    )}
                                    ×
                                    ${
                                        Number(
                                            invoice.quantity
                                        ) || 0
                                    }
                                </p>

                                <p>
                                    📅 Due:
                                    ${formatDate(
                                        invoice.dueDate
                                    )}
                                </p>

                            </div>

                            <div class="invoice-card-right">

                                <strong>
                                    ${money(
                                        invoice.total
                                    )}
                                </strong>

                                <span
                                    class="invoice-status ${
                                        paid
                                            ? "paid"
                                            : "unpaid"
                                    }">

                                    ${
                                        paid
                                            ? "PAID"
                                            : "UNPAID"
                                    }

                                </span>

                                <div
                                    class="invoice-actions">

                                    <button
                                        class="secondary-btn"
                                        onclick="toggleInvoiceStatus('${safe(invoice.id)}')">

                                        ${
                                            paid
                                                ? "Mark Unpaid"
                                                : "Mark Paid"
                                        }

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
                    i =>
                        String(i.id) ===
                        String(invoiceId)
                );

            if (!invoice) {
                return;
            }

            invoice.status =
                invoice.status === "paid"
                    ? "unpaid"
                    : "paid";

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
       DASHBOARD STATS
       ========================================================= */

    function updateDashboardStats() {

        const totalRevenue =
            sales.reduce(
                (sum, sale) =>
                    sum +
                    Number(
                        sale.total || 0
                    ),
                0
            );

        const today =
            todayString();

        const todayRevenue =
            sales
                .filter(sale => {

                    if (!sale.date) {
                        return false;
                    }

                    const date =
                        new Date(
                            sale.date
                        );

                    if (
                        Number.isNaN(
                            date.getTime()
                        )
                    ) {
                        return false;
                    }

                    const year =
                        date.getFullYear();

                    const month =
                        String(
                            date.getMonth() + 1
                        ).padStart(2, "0");

                    const day =
                        String(
                            date.getDate()
                        ).padStart(2, "0");

                    return (
                        `${year}-${month}-${day}` ===
                        today
                    );

                })
                .reduce(
                    (sum, sale) =>
                        sum +
                        Number(
                            sale.total || 0
                        ),
                    0
                );

        const paidInvoices =
            invoices.filter(
                invoice =>
                    invoice.status ===
                    "paid"
            ).length;

        const unpaidInvoices =
            invoices.filter(
                invoice =>
                    invoice.status !==
                    "paid"
            ).length;

        const lowStock =
            products.filter(
                product =>
                    Number(
                        product.stock
                    ) <= 5
            ).length;

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
            lowStock
        );
    }


    /* =========================================================
       ANALYTICS
       ========================================================= */

    function updateAnalytics() {

        const totalRevenue =
            sales.reduce(
                (sum, sale) =>
                    sum +
                    Number(
                        sale.total || 0
                    ),
                0
            );

        const averageSale =
            sales.length
                ? totalRevenue /
                  sales.length
                : 0;

        const unitsInStock =
            products.reduce(
                (sum, product) =>
                    sum +
                    Number(
                        product.stock || 0
                    ),
                0
            );

        const inventoryValue =
            products.reduce(
                (sum, product) =>
                    sum +
                    (
                        Number(
                            product.price || 0
                        ) *
                        Number(
                            product.stock || 0
                        )
                    ),
                0
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


        const productSales = {};

        sales.forEach(sale => {

            const name =
                sale.productName ||
                "Unknown Product";

            productSales[name] =
                (
                    productSales[name] ||
                    0
                ) +
                Number(
                    sale.quantity || 0
                );
        });


        const bestSeller =
            Object.entries(
                productSales
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0];

        text(
            "bestSeller",
            bestSeller
                ? bestSeller[0]
                : "—"
        );


        const unitsSold =
            sales.reduce(
                (sum, sale) =>
                    sum +
                    Number(
                        sale.quantity || 0
                    ),
                0
            );


        const largestSale =
            sales.length
                ? Math.max(
                    ...sales.map(
                        sale =>
                            Number(
                                sale.total ||
                                0
                            )
                    )
                )
                : 0;


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


        renderTopProducts();

        renderInventoryAlerts();

        renderRevenueChart();
    }


    /* =========================================================
       TOP PRODUCTS
       ========================================================= */

    function renderTopProducts() {

        const container =
            document.getElementById(
                "topProducts"
            );

        if (!container) {
            return;
        }

        if (!sales.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No sales yet.
                </div>
            `;

            return;
        }

        const totals = {};

        sales.forEach(sale => {

            const name =
                sale.productName ||
                "Unknown Product";

            totals[name] =
                (
                    totals[name] ||
                    0
                ) +
                Number(
                    sale.quantity ||
                    0
                );
        });

        const ranking =
            Object.entries(totals)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 5);

        container.innerHTML =
            ranking
                .map(
                    (
                        [name, quantity],
                        index
                    ) => {

                        return `
                            <div
                                class="top-product-row">

                                <span>
                                    #${index + 1}
                                </span>

                                <strong>
                                    ${safe(name)}
                                </strong>

                                <span>
                                    ${quantity} sold
                                </span>

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

        if (!container) {
            return;
        }

        const lowStockProducts =
            products.filter(
                product =>
                    Number(
                        product.stock
                    ) <= 5
            );

        if (!lowStockProducts.length) {

            container.innerHTML = `
                <div class="success-message">
                    ✅ All products have healthy stock levels.
                </div>
            `;

            return;
        }

        container.innerHTML =
            lowStockProducts
                .map(product => {

                    const stock =
                        Number(
                            product.stock
                        ) || 0;

                    return `
                        <div
                            class="inventory-alert">

                            <strong>
                                ⚠️
                                ${safe(
                                    product.name
                                )}
                            </strong>

                            <span>
                                Only
                                ${stock}
                                left
                            </span>

                        </div>
                    `;

                })
                .join("");
    }


    /* =========================================================
       REVENUE CHART
       ========================================================= */

    function renderRevenueChart() {

        const chart =
            document.getElementById(
                "revenueChart"
            );

        if (!chart) {
            return;
        }

        if (!sales.length) {

            chart.innerHTML = `
                <div class="empty-chart">
                    Make your first sale to see your revenue trend.
                </div>
            `;

            return;
        }

        const daily = {};

        sales.forEach(sale => {

            const date =
                new Date(
                    sale.date
                );

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return;
            }

            const key =
                date.toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric"
                    }
                );

            daily[key] =
                (
                    daily[key] ||
                    0
                ) +
                Number(
                    sale.total || 0
                );
        });

        const entries =
            Object.entries(daily)
                .slice(-7);

        const max =
            Math.max(
                ...entries.map(
                    entry =>
                        entry[1]
                ),
                1
            );

        chart.innerHTML = `
            <div class="revenue-bars">

                ${
                    entries
                        .map(
                            ([date, amount]) => {

                                const height =
                                    Math.max(
                                        8,
                                        (
                                            amount /
                                            max
                                        ) * 100
                                    );

                                return `
                                    <div
                                        class="revenue-bar-item">

                                        <div
                                            class="revenue-bar"
                                            style="height:${height}%"
                                            title="${money(amount)}">
                                        </div>

                                        <span>
                                            ${safe(date)}
                                        </span>

                                    </div>
                                `;
                            }
                        )
                        .join("")
                }

            </div>
        `;
    }


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

        const activities = [];


        sales.forEach(sale => {

            activities.push({

                type:
                    "sale",

                icon:
                    "🛒",

                title:
                    `Sale: ${
                        sale.productName ||
                        "Product"
                    }`,

                detail:
                    `${money(
                        sale.total
                    )} • ${
                        sale.quantity
                    } unit(s)`,

                date:
                    sale.date
            });
        });


        invoices.forEach(invoice => {

            activities.push({

                type:
                    "invoice",

                icon:
                    "🧾",

                title:
                    `Invoice ${
                        invoice.invoiceNumber ||
                        ""
                    }`,

                detail:
                    `${
                        invoice.customerName ||
                        "Customer"
                    } • ${
                        money(
                            invoice.total
                        )
                    }`,

                date:
                    invoice.createdAt
            });
        });


        customers.forEach(customer => {

            activities.push({

                type:
                    "customer",

                icon:
                    "👤",

                title:
                    `Customer added: ${
                        customer.name
                    }`,

                detail:
                    customer.email ||
                    customer.phone ||
                    "New customer",

                date:
                    customer.createdAt ||
                    new Date().toISOString()
            });
        });


        products.forEach(product => {

            activities.push({

                type:
                    "product",

                icon:
                    "📦",

                title:
                    `Product: ${
                        product.name
                    }`,

                detail:
                    `${money(
                        product.price
                    )} • Stock: ${
                        product.stock
                    }`,

                date:
                    product.createdAt ||
                    new Date().toISOString()
            });
        });


        activities.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


        const recent =
            activities.slice(0, 8);


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
            recent
                .map(activity => {

                    return `
                        <div
                            class="activity-item">

                            <div
                                class="activity-icon">

                                ${activity.icon}

                            </div>

                            <div
                                class="activity-info">

                                <strong>
                                    ${safe(
                                        activity.title
                                    )}
                                </strong>

                                <p>
                                    ${safe(
                                        activity.detail
                                    )}
                                </p>

                            </div>

                            <span
                                class="activity-date">

                                ${formatDate(
                                    activity.date
                                )}

                            </span>

                        </div>
                    `;

                })
                .join("");
    }


    /* =========================================================
       SEARCH
       ========================================================= */

    function setupSearch() {

        const productSearch =
            document.getElementById(
                "productSearch"
            );

        if (productSearch) {

            productSearch.addEventListener(
                "input",
                () => {

                    const query =
                        productSearch.value
                            .trim()
                            .toLowerCase();

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


        const customerSearch =
            document.getElementById(
                "customerSearch"
            );

        if (customerSearch) {

            customerSearch.addEventListener(
                "input",
                () => {

                    const query =
                        customerSearch.value
                            .trim()
                            .toLowerCase();

                    const filtered =
                        customers.filter(
                            customer =>

                                String(
                                    customer.name
                                )
                                .toLowerCase()
                                .includes(query) ||

                                String(
                                    customer.email ||
                                    ""
                                )
                                .toLowerCase()
                                .includes(query) ||

                                String(
                                    customer.phone ||
                                    ""
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


        const salesSearch =
            document.getElementById(
                "salesSearch"
            );

        if (salesSearch) {

            salesSearch.addEventListener(
                "input",
                () => {

                    const query =
                        salesSearch.value
                            .trim()
                            .toLowerCase();

                    const filtered =
                        sales.filter(
                            sale =>

                                String(
                                    sale.productName ||
                                    ""
                                )
                                .toLowerCase()
                                .includes(query) ||

                                String(
                                    sale.total ||
                                    ""
                                )
                                .includes(query)
                        );

                    renderSales(
                        filtered
                    );
                }
            );
        }


        const invoiceSearch =
            document.getElementById(
                "invoiceSearch"
            );

        const invoiceStatusFilter =
            document.getElementById(
                "invoiceStatusFilter"
            );


        function filterInvoices() {

            const query =
                invoiceSearch?.value
                    .trim()
                    .toLowerCase() ||
                "";

            const status =
                invoiceStatusFilter?.value ||
                "all";

            const filtered =
                invoices.filter(
                    invoice => {

                        const matchesSearch =
                            !query ||

                            String(
                                invoice.invoiceNumber ||
                                ""
                            )
                            .toLowerCase()
                            .includes(query) ||

                            String(
                                invoice.customerName ||
                                ""
                            )
                            .toLowerCase()
                            .includes(query) ||

                            String(
                                invoice.productName ||
                                ""
                            )
                            .toLowerCase()
                            .includes(query);


                        const matchesStatus =
                            status === "all" ||
                            invoice.status ===
                            status;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );
                    }
                );

            renderInvoices(
                filtered
            );
        }


        invoiceSearch
            ?.addEventListener(
                "input",
                filterInvoices
            );

        invoiceStatusFilter
            ?.addEventListener(
                "change",
                filterInvoices
            );
    }


    /* =========================================================
       BACKUP / RESTORE
       ========================================================= */

    window.exportBusinessData =
        function() {

            const backup = {

                app:
                    "BusinessOS",

                version:
                    "2.0",

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


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );
        };


    window.importBusinessData =
        function(file) {

            if (!file) {
                return;
            }

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    try {

                        const data =
                            JSON.parse(
                                event.target.result
                            );


                        if (
                            !data ||
                            typeof data !==
                            "object"
                        ) {

                            throw new Error(
                                "Invalid backup"
                            );
                        }


                        if (
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
                                "Invalid backup structure"
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
                            "Business data restored successfully."
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


            reader.readAsText(
                file
            );
        };


    /* =========================================================
       RESET BUSINESS DATA
       ========================================================= */

    window.resetBusinessData =
        function() {

            const firstConfirm =
                confirm(
                    "Are you sure you want to reset ALL BusinessOS data?"
                );


            if (!firstConfirm) {
                return;
            }


            const secondConfirm =
                confirm(
                    "This will permanently delete your products, customers, sales and invoices from this browser. Continue?"
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
                "All BusinessOS data has been reset."
            );
        };


    /* =========================================================
       MODAL BEHAVIOR
       ========================================================= */

    function setupModalBehavior() {

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
                    .querySelectorAll(
                        ".modal.active"
                    )
                    .forEach(modal => {

                        modal.classList.remove(
                            "active"
                        );
                    });
            }
        );
    }


    /* =========================================================
       DARK MODE
       ========================================================= */

    function setupDarkMode() {

        const themeToggle =
            document.getElementById(
                "themeToggle"
            );

        if (!themeToggle) {
            return;
        }


        const savedTheme =
            localStorage.getItem(
                "businessOSTheme"
            );


        if (
            savedTheme ===
            "dark"
        ) {

            document.body.classList.add(
                "dark-mode"
            );

            themeToggle.textContent =
                "☀️ Light Mode";

        } else {

            themeToggle.textContent =
                "🌙 Dark Mode";
        }


        themeToggle.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "dark-mode"
                );


                const darkMode =
                    document.body.classList.contains(
                        "dark-mode"
                    );


                localStorage.setItem(
                    "businessOSTheme",
                    darkMode
                        ? "dark"
                        : "light"
                );


                themeToggle.textContent =
                    darkMode
                        ? "☀️ Light Mode"
                        : "🌙 Dark Mode";
            }
        );
    }


    /* =========================================================
       PAYSTACK LOADER CHECK
       ========================================================= */

    function paystackReady() {

        if (
            typeof PaystackPop ===
            "undefined"
        ) {

            alert(
                "Paystack could not be loaded.\n\n" +
                "Make sure the Paystack script is included " +
                "before script.js, then refresh the page."
            );

            console.error(
                "PaystackPop is undefined. " +
                "Load https://js.paystack.co/v2/inline.js " +
                "before script.js."
            );

            return false;
        }

        return true;
    }


    /* =========================================================
       PAYSTACK PAYMENT
       ========================================================= */

    window.payWithPaystack =
        function() {

            const email =
                prompt(
                    "Enter your email address:"
                );

            if (!email) {
                return;
            }


            if (!isValidEmail(email)) {

                alert(
                    "Please enter a valid email address."
                );

                return;
            }


            const amountInput =
                prompt(
                    "Enter payment amount in GHS:"
                );


            if (
                amountInput ===
                null
            ) {
                return;
            }


            const amount =
                Number(
                    amountInput
                );


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                alert(
                    "Enter a valid payment amount."
                );

                return;
            }


            if (!paystackReady()) {
                return;
            }


            try {

                const paystack =
                    new PaystackPop();


                paystack.newTransaction({

                    key:
                        PAYSTACK_PUBLIC_KEY,

                    email:
                        email.trim(),

                    amount:
                        Math.round(
                            amount * 100
                        ),

                    currency:
                        PAYSTACK_CURRENCY,

                    ref:
                        createReference(
                            "BOS-PAY"
                        ),

                    metadata: {

                        product:
                            "BusinessOS Payment",

                        source:
                            "BusinessOS Dashboard",

                        currency:
                            "GHS"
                    },


                    onLoad:
                        function(response) {

                            console.log(
                                "Paystack loaded:",
                                response
                            );
                        },


                    onSuccess:
                        function(transaction) {

                            console.log(
                                "Paystack payment successful:",
                                transaction
                            );


                            alert(
                                "🎉 Payment successful!\n\n" +
                                "Amount: " +
                                ghcMoney(amount) +
                                "\n\n" +
                                "Reference: " +
                                transaction.reference
                            );
                        },


                    onCancel:
                        function() {

                            alert(
                                "Payment cancelled."
                            );
                        },


                    onError:
                        function(error) {

                            console.error(
                                "Paystack error:",
                                error
                            );


                            const message =
                                error?.message ||
                                "The payment could not be completed.";


                            alert(
                                "Payment failed:\n\n" +
                                message
                            );
                        }

                });

            } catch (error) {

                console.error(
                    "Could not start Paystack:",
                    error
                );


                alert(
                    "Could not start Paystack.\n\n" +
                    "Please refresh the page and try again."
                );
            }
        };


    /* =========================================================
       BUSINESSOS PRO
       ========================================================= */

    const upgradeProBtn =
        document.getElementById(
            "upgradeProBtn"
        );


    if (upgradeProBtn) {

        upgradeProBtn.addEventListener(
            "click",
            () => {

                const email =
                    prompt(
                        "Enter your email address for BusinessOS Pro:"
                    );


                if (!email) {
                    return;
                }


                if (!isValidEmail(email)) {

                    alert(
                        "Please enter a valid email address."
                    );

                    return;
                }


                if (!paystackReady()) {
                    return;
                }


                const confirmed =
                    confirm(
                        `BusinessOS Pro costs ${ghcMoney(PRO_PRICE_GHS)} for this payment.\n\nContinue to Paystack?`
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    const paystack =
                        new PaystackPop();


                    paystack.newTransaction({

                        key:
                            PAYSTACK_PUBLIC_KEY,

                        email:
                            email.trim(),

                        amount:
                            Math.round(
                                PRO_PRICE_GHS *
                                100
                            ),

                        currency:
                            PAYSTACK_CURRENCY,

                        ref:
                            createReference(
                                "BOS-PRO"
                            ),


                        metadata: {

                            product:
                                "BusinessOS Pro",

                            plan:
                                "Pro",

                            source:
                                "BusinessOS",

                            currency:
                                "GHS"
                        },


                        onLoad:
                            function(response) {

                                console.log(
                                    "BusinessOS Pro payment loaded:",
                                    response
                                );
                            },


                        onSuccess:
                            function(transaction) {

                                console.log(
                                    "BusinessOS Pro payment successful:",
                                    transaction
                                );


                                /*
                                 * This only unlocks the UI locally.
                                 *
                                 * For a REAL production SaaS,
                                 * payment must also be verified
                                 * server-side before granting access.
                                 */

                                localStorage.setItem(
                                    "businessOSPro",
                                    "true"
                                );


                                alert(
                                    "🎉 Payment successful!\n\n" +
                                    "Welcome to BusinessOS Pro!\n\n" +
                                    "Amount paid: " +
                                    ghcMoney(
                                        PRO_PRICE_GHS
                                    ) +
                                    "\n\n" +
                                    "Reference: " +
                                    transaction.reference
                                );
                            },


                        onCancel:
                            function() {

                                alert(
                                    "Payment cancelled."
                                );
                            },


                        onError:
                            function(error) {

                                console.error(
                                    "Pro payment error:",
                                    error
                                );


                                alert(
                                    "Payment failed:\n\n" +
                                    (
                                        error?.message ||
                                        "Unknown payment error."
                                    )
                                );
                            }

                    });

                } catch (error) {

                    console.error(
                        "Paystack initialization error:",
                        error
                    );


                    alert(
                        "Could not start Paystack.\n\n" +
                        "Please refresh the page and try again."
                    );
                }

            }
        );
    }


    /* =========================================================
       PRICING FALLBACK BUTTONS
       ========================================================= */

    window.startProPlan =
        function() {

            if (upgradeProBtn) {

                upgradeProBtn.click();

                return;
            }


            alert(
                "BusinessOS Pro payment is available through the Upgrade button."
            );
        };


    window.startBusinessPlan =
        function() {

            alert(
                "BusinessOS Business is coming soon.\n\n" +
                "This plan will include multiple users, " +
                "advanced reports and priority support."
            );
        };


    /* =========================================================
       RENDER EVERYTHING
       ========================================================= */

    function renderAll() {

        renderProducts();

        renderCustomers();

        renderSales();

        renderInvoices();

        updateDashboardStats();

        updateAnalytics();

        renderRecentActivity();
    }


    /* =========================================================
       INITIALIZATION
       ========================================================= */

    setupNavigation();

    setupSearch();

    setupModalBehavior();

    setupDarkMode();

    renderAll();

});
