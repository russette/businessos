document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       BUSINESSOS
       COMPLETE BUSINESS MANAGEMENT SYSTEM
       PAYSTACK + VERCEL BACKEND
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
       BUSINESS CONTACT DETAILS
       ========================================================= */

    const BUSINESS_EMAIL = "crarcss@gmail.com";
    const BUSINESS_PHONE = "0205346707";
    const WHATSAPP_NUMBER = "233205346707";


    /* =========================================================
       PAYMENT CONFIGURATION
       ========================================================= */
const PAYMENT_API_URL =
    "https://businessos-wine-eight.vercel.app";

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

        const year = today.getFullYear();

        const month =
            String(today.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(today.getDate())
                .padStart(2, "0");

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
       CONTACT
       ========================================================= */

    window.openBusinessEmail = function () {

        window.location.href =
            `mailto:${BUSINESS_EMAIL}`;
    };


    window.openBusinessWhatsApp = function () {

        window.open(
            `https://wa.me/${WHATSAPP_NUMBER}`,
            "_blank",
            "noopener,noreferrer"
        );
    };


    window.callBusiness = function () {

        window.location.href =
            `tel:${BUSINESS_PHONE}`;
    };


    function setupBusinessContactLinks() {

        document
            .querySelectorAll('a[href^="mailto:"]')
            .forEach(link => {

                link.href =
                    `mailto:${BUSINESS_EMAIL}`;
            });


        document
            .querySelectorAll('a[href*="wa.me"]')
            .forEach(link => {

                link.href =
                    `https://wa.me/${WHATSAPP_NUMBER}`;

                link.target = "_blank";

                link.rel =
                    "noopener noreferrer";
            });


        document
            .querySelectorAll('a[href^="tel:"]')
            .forEach(link => {

                link.href =
                    `tel:${BUSINESS_PHONE}`;
            });
    }


    /* =========================================================
       CONTACT FORM
       ========================================================= */

    window.sendContactMessage =
        function(event) {

            if (event) {
                event.preventDefault();
            }

            const name =
                document
                    .getElementById("contactName")
                    ?.value
                    .trim() || "";

            const email =
                document
                    .getElementById("contactEmail")
                    ?.value
                    .trim() || "";

            const subject =
                document
                    .getElementById("contactSubject")
                    ?.value
                    .trim() || "";

            const message =
                document
                    .getElementById("contactMessage")
                    ?.value
                    .trim() || "";


            if (
                !name ||
                !email ||
                !subject ||
                !message
            ) {

                alert(
                    "Please complete all contact fields."
                );

                return;
            }


            if (!isValidEmail(email)) {

                alert(
                    "Please enter a valid email address."
                );

                return;
            }


            const emailSubject =
                encodeURIComponent(
                    "BusinessOS Contact: " +
                    subject
                );


            const emailBody =
                encodeURIComponent(
                    "Hello BusinessOS,\n\n" +
                    "Name: " +
                    name +
                    "\n" +
                    "Email: " +
                    email +
                    "\n\n" +
                    "Message:\n" +
                    message +
                    "\n\n" +
                    "Sent from BusinessOS."
                );


            window.location.href =
                "mailto:" +
                BUSINESS_EMAIL +
                "?subject=" +
                emailSubject +
                "&body=" +
                emailBody;
        };


    function setupContactForm() {

        const form =
            document.getElementById(
                "contactForm"
            );

        if (form) {

            form.addEventListener(
                "submit",
                window.sendContactMessage
            );
        }
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

                        const href =
                            link.getAttribute("href");

                        if (!href) {
                            return;
                        }

                        const target =
                            document.getElementById(
                                href.substring(1)
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
            document.getElementById(
                "productsList"
            );

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
            document.getElementById(
                "productsList"
            );

        if (!list) {
            return;
        }

        if (!items.length) {

            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>No products found</h3>
                    <p>Try a different search.</p>
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
                document.getElementById(
                    "productModal"
                );

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
                        .getElementById(
                            "productName"
                        )
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

                        product.name = name;
                        product.price = price;
                        product.stock = stock;

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

            const used =
                sales.some(
                    sale =>
                        String(sale.productId) ===
                        String(productId)
                ) ||
                invoices.some(
                    invoice =>
                        String(invoice.productId) ===
                        String(productId)
                );


            if (
                !confirm(
                    used
                        ? "This product is connected to existing records. Delete it anyway?"
                        : "Delete this product?"
                )
            ) {
                return;
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
                        ${customers.length ? "🔍" : "👥"}
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
                                : "Add your first customer."
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
                                ? `<p>📧 ${safe(customer.email)}</p>`
                                : ""
                        }

                        ${
                            customer.phone
                                ? `<p>📱 ${safe(customer.phone)}</p>`
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

            if (
                !confirm(
                    "Delete this customer?"
                )
            ) {
                return;
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
                        ${stock <= 0 ? "disabled" : ""}>

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
                    !Number.isInteger(quantity) ||
                    quantity <= 0
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
                        ${sales.length ? "🔍" : "🧾"}
                    </div>

                    <h3>
                        ${
                            sales.length
                                ? "No sales found"
                                : "No sales yet"
                        }
                    </h3>

                    <p>
                        Your recorded sales will appear here.
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

            const date = new Date();

            date.setDate(
                date.getDate() + 7
            );

            dueDate.value =
                date.toISOString()
                    .split("T")[0];
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
            Math.max(taxRate, 0) /
            100;


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
                    !Number.isInteger(quantity) ||
                    quantity <= 0
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


                const subtotal =
                    Number(product.price) *
                    quantity;


                const validDiscount =
                    Math.min(
                        Math.max(discount, 0),
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
                    Math.max(taxRate, 0) /
                    100;


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


    function renderInvoices(items = invoices) {

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
                        ${invoices.length ? "🔍" : "🧾"}
                    </div>

                    <h3>
                        ${
                            invoices.length
                                ? "No invoices found"
                                : "No invoices yet"
                        }
                    </h3>

                    <p>
                        Create your first invoice.
                    </p>

                </div>
            `;

            return;
        }


        list.innerHTML =
            [...items]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                )
                .map(invoice => {

                    const paid =
                        invoice.status === "paid";


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
                                    ${Number(
                                        invoice.quantity
                                    ) || 0}
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
                                    ${money(invoice.total)}
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

                                <div class="invoice-actions">

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
       DASHBOARD
       ========================================================= */

    function updateDashboardStats() {

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
            sales
                .filter(sale => {

                    if (!sale.date) {
                        return false;
                    }

                    const date =
                        new Date(sale.date);

                    if (
                        Number.isNaN(
                            date.getTime()
                        )
                    ) {
                        return false;
                    }

                    return (
                        date.toISOString()
                            .slice(0, 10) ===
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
                    invoice.status === "paid"
            ).length;


        const unpaidInvoices =
            invoices.filter(
                invoice =>
                    invoice.status !== "paid"
            ).length;


        const lowStock =
            products.filter(
                product =>
                    Number(product.stock) <= 5
            ).length;


        text("totalRevenue", money(totalRevenue));
        text("todayRevenue", money(todayRevenue));
        text("totalProducts", products.length);
        text("totalCustomers", customers.length);
        text("totalSales", sales.length);
        text("paidInvoices", paidInvoices);
        text("unpaidInvoices", unpaidInvoices);
        text("lowStockProducts", lowStock);
    }


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


        const averageSale =
            sales.length
                ? totalRevenue / sales.length
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
                    Number(product.price || 0) *
                    Number(product.stock || 0),
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
                (productSales[name] || 0) +
                Number(sale.quantity || 0);
        });


        const bestSeller =
            Object.entries(productSales)
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
                    Number(sale.quantity || 0),
                0
            );


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
                (totals[name] || 0) +
                Number(sale.quantity || 0);
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
                    ([name, quantity], index) => {

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
                    Number(product.stock) <= 5
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

                    return `
                        <div class="inventory-alert">

                            <strong>
                                ⚠️
                                ${safe(product.name)}
                            </strong>

                            <span>
                                Only
                                ${Number(product.stock) || 0}
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
                new Date(sale.date);


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
                (daily[key] || 0) +
                Number(sale.total || 0);
        });


        const entries =
            Object.entries(daily)
                .slice(-7);


        const max =
            Math.max(
                ...entries.map(
                    entry => entry[1]
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

                icon: "🛒",

                title:
                    `Sale: ${
                        sale.productName ||
                        "Product"
                    }`,

                detail:
                    `${money(sale.total)} • ${
                        sale.quantity
                    } unit(s)`,

                date:
                    sale.date
            });
        });


        invoices.forEach(invoice => {

            activities.push({

                icon: "🧾",

                title:
                    `Invoice ${
                        invoice.invoiceNumber || ""
                    }`,

                detail:
                    `${
                        invoice.customerName ||
                        "Customer"
                    } • ${
                        money(invoice.total)
                    }`,

                date:
                    invoice.createdAt
            });
        });


        customers.forEach(customer => {

            activities.push({

                icon: "👤",

                title:
                    `Customer added: ${
                        customer.name
                    }`,

                detail:
                    customer.email ||
                    customer.phone ||
                    "New customer",

                date:
                    customer.createdAt
            });
        });


        products.forEach(product => {

            activities.push({

                icon: "📦",

                title:
                    `Product: ${
                        product.name
                    }`,

                detail:
                    `${money(product.price)} • Stock: ${
                        product.stock
                    }`,

                date:
                    product.createdAt
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
                        <div class="activity-item">

                            <div class="activity-icon">
                                ${activity.icon}
                            </div>

                            <div class="activity-info">

                                <strong>
                                    ${safe(activity.title)}
                                </strong>

                                <p>
                                    ${safe(activity.detail)}
                                </p>

                            </div>

                            <span class="activity-date">
                                ${formatDate(activity.date)}
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


        productSearch?.addEventListener(
            "input",
            () => {

                const query =
                    productSearch.value
                        .trim()
                        .toLowerCase();


                renderProductResults(
                    products.filter(
                        product =>
                            String(
                                product.name
                            )
                            .toLowerCase()
                            .includes(query)
                    )
                );
            }
        );


        const customerSearch =
            document.getElementById(
                "customerSearch"
            );


        customerSearch?.addEventListener(
            "input",
            () => {

                const query =
                    customerSearch.value
                        .trim()
                        .toLowerCase();


                renderCustomerResults(
                    customers.filter(
                        customer =>

                            String(
                                customer.name
                            )
                            .toLowerCase()
                            .includes(query) ||

                            String(
                                customer.email || ""
                            )
                            .toLowerCase()
                            .includes(query) ||

                            String(
                                customer.phone || ""
                            )
                            .toLowerCase()
                            .includes(query)
                    )
                );
            }
        );


        const salesSearch =
            document.getElementById(
                "salesSearch"
            );


        salesSearch?.addEventListener(
            "input",
            () => {

                const query =
                    salesSearch.value
                        .trim()
                        .toLowerCase();


                renderSales(
                    sales.filter(
                        sale =>

                            String(
                                sale.productName || ""
                            )
                            .toLowerCase()
                            .includes(query) ||

                            String(
                                sale.total || ""
                            )
                            .includes(query)
                    )
                );
            }
        );


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
                    .toLowerCase() || "";


            const status =
                invoiceStatusFilter?.value ||
                "all";


            renderInvoices(
                invoices.filter(invoice => {

                    const matchesSearch =
                        !query ||

                        String(
                            invoice.invoiceNumber || ""
                        )
                        .toLowerCase()
                        .includes(query) ||

                        String(
                            invoice.customerName || ""
                        )
                        .toLowerCase()
                        .includes(query) ||

                        String(
                            invoice.productName || ""
                        )
                        .toLowerCase()
                        .includes(query);


                    const matchesStatus =
                        status === "all" ||
                        invoice.status === status;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                })
            );
        }


        invoiceSearch?.addEventListener(
            "input",
            filterInvoices
        );


        invoiceStatusFilter?.addEventListener(
            "change",
            filterInvoices
        );
    }


    /* =========================================================
       BACKUP
       ========================================================= */

    window.exportBusinessData =
        function() {

            const backup = {

                app: "BusinessOS",

                version: "3.0",

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


            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);
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
                            !Array.isArray(data.products) ||
                            !Array.isArray(data.customers) ||
                            !Array.isArray(data.sales) ||
                            !Array.isArray(data.invoices)
                        ) {

                            throw new Error(
                                "Invalid backup"
                            );
                        }


                        if (
                            !confirm(
                                "Importing this backup will replace your current BusinessOS data. Continue?"
                            )
                        ) {
                            return;
                        }


                        products = data.products;
                        customers = data.customers;
                        sales = data.sales;
                        invoices = data.invoices;


                        saveData();
                        renderAll();


                        alert(
                            "Business data restored successfully."
                        );

                    } catch (error) {

                        console.error(error);

                        alert(
                            "Could not import this backup."
                        );
                    }
                };


            reader.readAsText(file);
        };


    /* =========================================================
       RESET
       ========================================================= */

    window.resetBusinessData =
        function() {

            if (
                !confirm(
                    "Are you sure you want to reset ALL BusinessOS data?"
                )
            ) {
                return;
            }


            if (
                !confirm(
                    "This permanently deletes your BusinessOS browser data. Continue?"
                )
            ) {
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
       MODALS
       ========================================================= */

    function setupModalBehavior() {

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
                    event.key !== "Escape"
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


        if (savedTheme === "dark") {

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


                const dark =
                    document.body.classList.contains(
                        "dark-mode"
                    );


                localStorage.setItem(
                    "businessOSTheme",
                    dark ? "dark" : "light"
                );


                themeToggle.textContent =
                    dark
                        ? "☀️ Light Mode"
                        : "🌙 Dark Mode";
            }
        );
    }


    /* =========================================================
       PAYMENT BACKEND
       ========================================================= */

    function paymentBackendReady() {

        if (
            !PAYMENT_API_URL ||
            PAYMENT_API_URL.includes(
                "YOUR_VERCEL_URL"
            )
        ) {

            alert(
                "Your Vercel payment URL has not been configured."
            );

            return false;
        }


        if (
            !PAYSTACK_PUBLIC_KEY ||
            !PAYSTACK_PUBLIC_KEY.startsWith("pk_")
        ) {

            alert(
                "Your Paystack public key has not been configured."
            );

            return false;
        }


        return true;
    }


    /* =========================================================
       INITIALIZE PAYSTACK PAYMENT
       ========================================================= */

    async function initializeRealPayment({

        email,
        amountGHS,
        product,
        plan = null

    }) {

        if (!paymentBackendReady()) {
            return;
        }


        const reference =
            createReference("BOS");


        /*
         * IMPORTANT:
         *
         * We send the amount as GHS.
         *
         * Our Vercel backend converts the amount
         * to the smallest currency unit.
         */

        const response =
            await fetch(
                `${PAYMENT_API_URL}/api/initialize-payment`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            email:
                                email.trim(),

                            amount:
                                Number(amountGHS),

                            reference

                        })
                }
            );


        let result;

        try {

            result =
                await response.json();

        } catch (error) {

            throw new Error(
                "The payment server returned an invalid response."
            );
        }


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Unable to initialize payment."
            );
        }


        if (
            !result.status ||
            !result.data
        ) {

            throw new Error(
                result.error ||
                "Payment initialization failed."
            );
        }


        const authorizationUrl =
            result.data.authorization_url;


        if (!authorizationUrl) {

            throw new Error(
                "Paystack did not return a checkout URL."
            );
        }


        /*
         * Save pending payment information.
         */

        localStorage.setItem(
            "businessOSPendingPayment",
            JSON.stringify({

                reference:
                    result.data.reference ||
                    reference,

                email:
                    email.trim(),

                amount:
                    Number(amountGHS),

                product,

                plan,

                startedAt:
                    new Date().toISOString()

            })
        );


        /*
         * Redirect to Paystack checkout.
         */

        window.location.href =
            authorizationUrl;
    }


    /* =========================================================
       GENERAL PAYMENT
       ========================================================= */

    window.payWithPaystack =
        async function() {

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
                amountInput === null
            ) {
                return;
            }


            const amount =
                Number(amountInput);


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                alert(
                    "Enter a valid payment amount."
                );

                return;
            }


            try {

                await initializeRealPayment({

                    email,

                    amountGHS:
                        amount,

                    product:
                        "BusinessOS Payment"

                });

            } catch (error) {

                console.error(
                    "Payment initialization error:",
                    error
                );


                alert(
                    "Payment could not be started.\n\n" +
                    (
                        error.message ||
                        "Please try again."
                    )
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
            async () => {

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


                const confirmed =
                    confirm(
                        `BusinessOS Pro costs ${ghcMoney(PRO_PRICE_GHS)}.\n\nContinue to Paystack checkout?`
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    await initializeRealPayment({

                        email,

                        amountGHS:
                            PRO_PRICE_GHS,

                        product:
                            "BusinessOS Pro",

                        plan:
                            "Pro"

                    });

                } catch (error) {

                    console.error(
                        "BusinessOS Pro payment error:",
                        error
                    );


                    alert(
                        "Could not start BusinessOS Pro payment.\n\n" +
                        (
                            error.message ||
                            "Please try again."
                        )
                    );
                }

            }
        );
    }


    /* =========================================================
       PRICING BUTTONS
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
   PAYMENT RETURN / VERIFICATION
   ========================================================= */

async function verifyReturnedPayment() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const reference =
        params.get("reference") ||
        params.get("trxref");

    /*
     * User did not return from Paystack.
     */
    if (!reference) {
        return;
    }

    console.log(
        "Paystack reference detected:",
        reference
    );

    const pending =
        JSON.parse(
            localStorage.getItem(
                "businessOSPendingPayment"
            ) || "null"
        );

    try {

        /*
         * Make sure our backend exists.
         */
        if (!PAYMENT_API_URL) {

            throw new Error(
                "Payment server is not configured."
            );
        }


        /*
         * Verify payment with our Vercel backend.
         */
        const response =
            await fetch(
                `${PAYMENT_API_URL}/api/verify-payment`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            reference
                        })
                }
            );


        let result;

        try {

            result =
                await response.json();

        } catch (error) {

            throw new Error(
                "The payment server returned an invalid response."
            );
        }


        console.log(
            "Payment verification response:",
            result
        );


        /*
         * Backend returned an HTTP error.
         */
        if (!response.ok) {

            throw new Error(
                result.error ||
                "Payment verification failed."
            );
        }


        /*
         * Backend must confirm success.
         */
        if (
            !result.status ||
            !result.data
        ) {

            throw new Error(
                result.error ||
                "Paystack verification failed."
            );
        }


        const payment =
            result.data;


        console.log(
            "Verified Paystack payment:",
            payment
        );


        /*
         * Payment must actually be successful.
         */
        if (
            payment.status !==
            "success"
        ) {

            throw new Error(
                `Payment status is "${payment.status}".`
            );
        }


        /*
         * -----------------------------------------------------
         * BUSINESSOS PRO PAYMENT CHECK
         * -----------------------------------------------------
         */

        if (
            pending?.plan ===
            "Pro"
        ) {

            /*
             * Paystack normally returns the amount
             * in the smallest currency unit.
             *
             * GHS 900 = 90000 pesewas.
             */

            const expectedAmount =
                PRO_PRICE_GHS * 100;


            const paidAmount =
                Number(
                    payment.amount || 0
                );


            /*
             * Verify the amount.
             */
            if (
                paidAmount !==
                expectedAmount
            ) {

                throw new Error(
                    `Payment amount mismatch. Expected GHS ${PRO_PRICE_GHS}, but Paystack returned ${paidAmount / 100}.`
                );
            }


            /*
             * Verify currency.
             */
            if (
                payment.currency &&
                payment.currency !== "GHS"
            ) {

                throw new Error(
                    "Payment currency does not match GHS."
                );
            }


            /*
             * ACTIVATE BUSINESSOS PRO
             */
            localStorage.setItem(
                "businessOSPro",
                "true"
            );


            /*
             * Store useful subscription information.
             */
            localStorage.setItem(
                "businessOSProPayment",
                JSON.stringify({

                    reference,

                    email:
                        pending.email ||
                        payment.customer?.email ||
                        "",

                    amount:
                        PRO_PRICE_GHS,

                    currency:
                        "GHS",

                    product:
                        "BusinessOS Pro",

                    paidAt:
                        payment.paid_at ||
                        new Date().toISOString()

                })
            );


            /*
             * Remove pending payment.
             */
            localStorage.removeItem(
                "businessOSPendingPayment"
            );


            /*
             * Show success message.
             */
            showPaymentSuccess(
                "BusinessOS Pro Activated!",
                `Your GHS ${PRO_PRICE_GHS} payment was successfully verified by Paystack.`,
                reference
            );


            /*
             * Refresh the BusinessOS interface.
             */
            updateProUI();
        }


        /*
         * General BusinessOS payment.
         */
        else {

            localStorage.removeItem(
                "businessOSPendingPayment"
            );


            showPaymentSuccess(
                "Payment Successful!",
                "Your payment has been successfully verified by Paystack.",
                reference
            );
        }


        /*
         * Remove ?reference=... from URL.
         */
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname +
            window.location.hash
        );


    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );


        /*
         * Show a visible error instead of
         * silently failing.
         */
        showPaymentError(
            error.message ||
            "Payment verification failed."
        );
    }
}


/* =========================================================
   PAYMENT SUCCESS UI
   ========================================================= */

function showPaymentSuccess(
    title,
    message,
    reference
) {

    /*
     * Remove existing payment message.
     */
    document
        .getElementById(
            "businessOSPaymentMessage"
        )
        ?.remove();


    const messageBox =
        document.createElement("div");


    messageBox.id =
        "businessOSPaymentMessage";


    messageBox.innerHTML = `

        <div class="payment-success-overlay">

            <div class="payment-success-card">

                <div class="payment-success-icon">
                    ✓
                </div>

                <h2>
                    ${safe(title)}
                </h2>

                <p>
                    ${safe(message)}
                </p>

                <div class="payment-reference">

                    <strong>
                        Payment Reference
                    </strong>

                    <span>
                        ${safe(reference)}
                    </span>

                </div>

                <button
                    id="closePaymentSuccess"
                    class="primary-btn">

                    Continue to BusinessOS

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        messageBox
    );


    document
        .getElementById(
            "closePaymentSuccess"
        )
        ?.addEventListener(
            "click",
            () => {

                messageBox.remove();

            }
        );
}


/* =========================================================
   PAYMENT ERROR UI
   ========================================================= */

function showPaymentError(
    message
) {

    document
        .getElementById(
            "businessOSPaymentMessage"
        )
        ?.remove();


    const messageBox =
        document.createElement("div");


    messageBox.id =
        "businessOSPaymentMessage";


    messageBox.innerHTML = `

        <div class="payment-error-overlay">

            <div class="payment-error-card">

                <div class="payment-error-icon">
                    !
                </div>

                <h2>
                    Payment Verification Failed
                </h2>

                <p>
                    ${safe(message)}
                </p>

                <p>
                    <strong>
                        Do not pay again yet.
                    </strong>
                    Check your Paystack transaction
                    before trying again.
                </p>

                <button
                    id="closePaymentError"
                    class="primary-btn">

                    Close

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        messageBox
    );


    document
        .getElementById(
            "closePaymentError"
        )
        ?.addEventListener(
            "click",
            () => {

                messageBox.remove();

            }
        );
}


/* =========================================================
   BUSINESSOS PRO UI
   ========================================================= */

function updateProUI() {

    const isPro =
        localStorage.getItem(
            "businessOSPro"
        ) === "true";


    if (!isPro) {
        return;
    }


    /*
     * Upgrade button.
     */
    const upgradeButton =
        document.getElementById(
            "upgradeProBtn"
        );


    if (upgradeButton) {

        upgradeButton.textContent =
            "✓ BusinessOS Pro Active";

        upgradeButton.disabled =
            true;

        upgradeButton.classList.add(
            "pro-active"
        );
    }


    /*
     * Any element using
     * data-pro-status will be updated.
     */
    document
        .querySelectorAll(
            "[data-pro-status]"
        )
        .forEach(element => {

            element.textContent =
                "✓ Pro Active";

            element.classList.add(
                "pro-active"
            );
        });


    /*
     * Any element using
     * #proStatus will be updated.
     */
    const proStatus =
        document.getElementById(
            "proStatus"
        );


    if (proStatus) {

        proStatus.textContent =
            "✓ BusinessOS Pro Active";

        proStatus.classList.add(
            "pro-active"
        );
    }
}
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

setupContactForm();

setupBusinessContactLinks();

renderAll();

updateProUI();

verifyReturnedPayment();

});
