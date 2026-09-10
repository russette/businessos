// ============================================================
// PATRIODX - SUPABASE CONNECTED SCRIPT
// ============================================================

const SUPABASE_URL = "https://saerujjsfzyxkyacbvgr.supabase.co";
const SUPABASE_KEY = "sb_publishable_l50YIYtYLXkjWE1iQSTyoA_GkrIKWn7";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ============================================================
// GLOBAL DATA
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    let products = [];
    let customers = [];
    let sales = [];
    let invoices = [];

    let currentUser = null;
    let currentBusiness = null;

    let editingProductId = null;

    // ========================================================
    // PAYMENT SETTINGS
    // ========================================================

    const PAYMENT_API_URL = "https://businessos-wine-eight.vercel.app";

    const PAYSTACK_PUBLIC_KEY =
        "pk_test_2321844583071969c00a747ba838b337df808a44";

    const PAYSTACK_CURRENCY = "GHS";
    const PRO_PRICE_GHS = 900;

    // ========================================================
    // BASIC HELPERS
    // ========================================================

    function createId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    function createReference() {
        return "PATRIODX_" + Date.now() + "_" +
            Math.random().toString(36).substring(2, 8);
    }

    function money(value) {
        return "$" + Number(value || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function ghcMoney(value) {
        return "GH₵" + Number(value || 0).toLocaleString("en-GH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function safe(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function text(value) {
        return String(value ?? "");
    }

    function formatDate(date) {
        if (!date) return "-";

        const d = new Date(date);

        if (isNaN(d.getTime())) return "-";

        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function todayString() {
        return new Date().toISOString().split("T")[0];
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(message) {
        console.error(message);
        alert(message);
    }

    // ========================================================
    // DATABASE ROW -> JAVASCRIPT OBJECT
    // ========================================================

    function mapProduct(row) {
        return {
            id: row.id,
            productId: row.id,
            name: row.name,
            productName: row.name,
            price: Number(row.price) || 0,
            stock: Number(row.stock) || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    function mapCustomer(row) {
        return {
            id: row.id,
            customerId: row.id,
            name: row.name,
            customerName: row.name,
            email: row.email || "",
            phone: row.phone || "",
            createdAt: row.created_at
        };
    }

    function mapSale(row) {
        return {
            id: row.id,
            saleId: row.id,
            productId: row.product_id,
            productName: row.product_name,
            quantity: Number(row.quantity) || 0,
            total: Number(row.total) || 0,
            date: row.created_at,
            createdAt: row.created_at
        };
    }

    function mapInvoice(row) {
        return {
            id: row.id,
            invoiceId: row.id,
            invoiceNumber: row.invoice_number,
            customerId: row.customer_id,
            customerName: row.customer_name,
            productId: row.product_id,
            productName: row.product_name,
            quantity: Number(row.quantity) || 0,
            subtotal: Number(row.subtotal) || 0,
            discount: Number(row.discount) || 0,
            taxRate: Number(row.tax_rate) || 0,
            tax: Number(row.tax) || 0,
            total: Number(row.total) || 0,
            dueDate: row.due_date,
            status: row.status || "unpaid",
            createdAt: row.created_at
        };
    }

    // ========================================================
    // AUTHENTICATION
    // ========================================================

    async function checkAuthentication() {

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.error("Session error:", error);
        }

        if (!session) {
            window.location.href = "auth.html";
            return false;
        }

        currentUser = session.user;

        return true;
    }

    // ========================================================
    // GET USER BUSINESS
    // ========================================================

    async function loadBusiness() {

        const { data, error } = await supabaseClient
            .from("businesses")
            .select("*")
            .eq("owner_id", currentUser.id)
            .single();

        if (error) {
            console.error("Business error:", error);
            alert(
                "PATRIODX could not find your business account.\n\n" +
                "Please sign out and create/sign in to your account again."
            );
            return false;
        }

        currentBusiness = data;

        console.log("Current business:", currentBusiness);

        return true;
    }

    // ========================================================
    // LOAD ALL DATA FROM SUPABASE
    // ========================================================

    async function loadDataFromSupabase() {

        if (!currentBusiness) return;

        const [
            productsResult,
            customersResult,
            salesResult,
            invoicesResult
        ] = await Promise.all([

            supabaseClient
                .from("products")
                .select("*")
                .eq("business_id", currentBusiness.id)
                .order("created_at", { ascending: false }),

            supabaseClient
                .from("customers")
                .select("*")
                .eq("business_id", currentBusiness.id)
                .order("created_at", { ascending: false }),

            supabaseClient
                .from("sales")
                .select("*")
                .eq("business_id", currentBusiness.id)
                .order("created_at", { ascending: false }),

            supabaseClient
                .from("invoices")
                .select("*")
                .eq("business_id", currentBusiness.id)
                .order("created_at", { ascending: false })
        ]);

        if (productsResult.error) {
            throw productsResult.error;
        }

        if (customersResult.error) {
            throw customersResult.error;
        }

        if (salesResult.error) {
            throw salesResult.error;
        }

        if (invoicesResult.error) {
            throw invoicesResult.error;
        }

        products = (productsResult.data || []).map(mapProduct);
        customers = (customersResult.data || []).map(mapCustomer);
        sales = (salesResult.data || []).map(mapSale);
        invoices = (invoicesResult.data || []).map(mapInvoice);

        console.log("Supabase data loaded:", {
            products,
            customers,
            sales,
            invoices
        });
    }

    // ========================================================
    // NAVIGATION
    // ========================================================

    function setupNavigation() {

        const navLinks = document.querySelectorAll(
            "[data-section], .nav-link, nav a"
        );

        navLinks.forEach(link => {

            link.addEventListener("click", function (event) {

                const target =
                    this.dataset.section ||
                    this.getAttribute("href");

                if (!target) return;

                if (target.startsWith("#")) {
                    event.preventDefault();

                    const sectionId = target.substring(1);
                    const section =
                        document.getElementById(sectionId);

                    if (section) {
                        section.scrollIntoView({
                            behavior: "smooth"
                        });
                    }
                }
            });
        });

        document.querySelectorAll("[data-scroll]").forEach(button => {

            button.addEventListener("click", () => {

                const target =
                    document.getElementById(button.dataset.scroll);

                if (target) {
                    target.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            });
        });
    }

    // ========================================================
    // SEARCH
    // ========================================================

    function setupSearch() {

        const searchInputs =
            document.querySelectorAll(
                "#searchInput, .search-input, input[type='search']"
            );

        searchInputs.forEach(input => {

            input.addEventListener("input", () => {

                const query =
                    input.value.trim().toLowerCase();

                document
                    .querySelectorAll(
                        "table tbody tr, .product-card, .customer-card"
                    )
                    .forEach(item => {

                        const content =
                            item.textContent.toLowerCase();

                        item.style.display =
                            !query || content.includes(query)
                                ? ""
                                : "none";
                    });
            });
        });
    }

    // ========================================================
    // DARK MODE
    // ========================================================

    function setupDarkMode() {

        const savedTheme =
            localStorage.getItem("patriodxDarkMode");

        if (savedTheme === "true") {
            document.body.classList.add("dark-mode");
        }

        const buttons = document.querySelectorAll(
            "#darkModeToggle, .dark-mode-toggle, [data-dark-mode]"
        );

        buttons.forEach(button => {

            button.addEventListener("click", () => {

                document.body.classList.toggle("dark-mode");

                localStorage.setItem(
                    "patriodxDarkMode",
                    document.body.classList.contains("dark-mode")
                );
            });
        });
    }

    // ========================================================
    // RENDER ALL
    // ========================================================

    function renderAll() {
        renderDashboard();
        renderProducts();
        renderCustomers();
        renderSales();
        renderInvoices();
        renderAnalytics();
        updateProUI();
    }

    // ========================================================
    // DASHBOARD
    // ========================================================

    function renderDashboard() {

        const revenue =
            sales.reduce(
                (sum, sale) => sum + Number(sale.total || 0),
                0
            );

        const stats = {
            revenue,
            products: products.length,
            customers: customers.length,
            sales: sales.length,
            invoices: invoices.length
        };

        const selectors = {

            revenue: [
                "#totalRevenue",
                "[data-stat='revenue']"
            ],

            products: [
                "#totalProducts",
                "[data-stat='products']"
            ],

            customers: [
                "#totalCustomers",
                "[data-stat='customers']"
            ],

            sales: [
                "#totalSales",
                "[data-stat='sales']"
            ],

            invoices: [
                "#totalInvoices",
                "[data-stat='invoices']"
            ]
        };

        selectors.revenue.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.textContent = money(stats.revenue);
            });
        });

        selectors.products.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.textContent = stats.products;
            });
        });

        selectors.customers.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.textContent = stats.customers;
            });
        });

        selectors.sales.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.textContent = stats.sales;
            });
        });

        selectors.invoices.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.textContent = stats.invoices;
            });
        });

        const businessNameElements =
            document.querySelectorAll(
                "#businessName, .business-name"
            );

        businessNameElements.forEach(el => {
            if (currentBusiness) {
                el.textContent = currentBusiness.name;
            }
        });

        renderRecentActivity();
    }

    // ========================================================
    // RECENT ACTIVITY
    // ========================================================

    function renderRecentActivity() {

        const containers = document.querySelectorAll(
            "#recentActivity, .recent-activity"
        );

        containers.forEach(container => {

            if (!sales.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        No recent sales yet.
                    </div>
                `;

                return;
            }

            const recentSales = sales.slice(0, 5);

            container.innerHTML = recentSales.map(sale => `
                <div class="activity-item">
                    <div>
                        <strong>${safe(sale.productName)}</strong>
                        <small>
                            ${sale.quantity} item${sale.quantity === 1 ? "" : "s"}
                        </small>
                    </div>

                    <div>
                        <strong>${money(sale.total)}</strong>
                        <small>${formatDate(sale.createdAt)}</small>
                    </div>
                </div>
            `).join("");
        });
    }

    // ========================================================
    // PRODUCTS
    // ========================================================

    function renderProducts() {

        const containers = document.querySelectorAll(
            "#productsList, #productList, .products-list"
        );

        containers.forEach(container => {

            if (!products.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No products yet</h3>
                        <p>Add your first product to get started.</p>
                    </div>
                `;

                return;
            }

            container.innerHTML = products.map(product => `
                <div class="product-card">

                    <div class="product-info">
                        <h3>${safe(product.name)}</h3>

                        <p>
                            Price:
                            <strong>${money(product.price)}</strong>
                        </p>

                        <p>
                            Stock:
                            <strong>${product.stock}</strong>
                        </p>
                    </div>

                    <div class="product-actions">

                        <button
                            type="button"
                            class="edit-product"
                            data-id="${product.id}">
                            Edit
                        </button>

                        <button
                            type="button"
                            class="delete-product"
                            data-id="${product.id}">
                            Delete
                        </button>

                    </div>

                </div>
            `).join("");

            container
                .querySelectorAll(".edit-product")
                .forEach(button => {

                    button.addEventListener("click", () => {

                        const product =
                            products.find(
                                p => p.id === button.dataset.id
                            );

                        if (product) {
                            openProductEdit(product);
                        }
                    });
                });

            container
                .querySelectorAll(".delete-product")
                .forEach(button => {

                    button.addEventListener("click", () => {

                        deleteProduct(button.dataset.id);
                    });
                });
        });

        renderProductTable();
    }

    // ========================================================
    // PRODUCT TABLE
    // ========================================================

    function renderProductTable() {

        const tbody = document.querySelector(
            "#productsTable tbody"
        );

        if (!tbody) return;

        if (!products.length) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No products yet.
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>

                <td>${safe(product.name)}</td>

                <td>${money(product.price)}</td>

                <td>${product.stock}</td>

                <td>${formatDate(product.createdAt)}</td>

                <td>

                    <button
                        class="edit-product"
                        data-id="${product.id}">
                        Edit
                    </button>

                    <button
                        class="delete-product"
                        data-id="${product.id}">
                        Delete
                    </button>

                </td>

            </tr>
        `).join("");

        tbody
            .querySelectorAll(".edit-product")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const product =
                        products.find(
                            p => p.id === button.dataset.id
                        );

                    if (product) openProductEdit(product);
                });
            });

        tbody
            .querySelectorAll(".delete-product")
            .forEach(button => {

                button.addEventListener("click", () => {
                    deleteProduct(button.dataset.id);
                });
            });
    }

    // ========================================================
    // PRODUCT MODAL
    // ========================================================

    function getProductModal() {

        return document.querySelector(
            "#productModal, #addProductModal, .product-modal"
        );
    }

    function openProductEdit(product) {

        editingProductId = product.id;

        const modal = getProductModal();

        if (modal) {
            modal.classList.add("active");
            modal.style.display = "flex";
        }

        const nameInput = document.querySelector(
            "#productName, #product-name"
        );

        const priceInput = document.querySelector(
            "#productPrice, #product-price"
        );

        const stockInput = document.querySelector(
            "#productStock, #product-stock"
        );

        if (nameInput) nameInput.value = product.name;
        if (priceInput) priceInput.value = product.price;
        if (stockInput) stockInput.value = product.stock;

        const submit =
            document.querySelector(
                "#productForm button[type='submit'], " +
                "#productForm .submit-btn"
            );

        if (submit) {
            submit.textContent = "Update Product";
        }
    }

    function setupProductForm() {

        const form =
            document.querySelector(
                "#productForm, #addProductForm"
            );

        if (!form) return;

        form.addEventListener("submit", async event => {

            event.preventDefault();

            const nameInput =
                form.querySelector(
                    "#productName, #product-name, [name='productName']"
                );

            const priceInput =
                form.querySelector(
                    "#productPrice, #product-price, [name='price']"
                );

            const stockInput =
                form.querySelector(
                    "#productStock, #product-stock, [name='stock']"
                );

            const name =
                nameInput?.value.trim();

            const price =
                Number(priceInput?.value);

            const stock =
                Number(stockInput?.value);

            if (!name) {
                alert("Please enter a product name.");
                return;
            }

            if (isNaN(price) || price < 0) {
                alert("Please enter a valid price.");
                return;
            }

            if (isNaN(stock) || stock < 0) {
                alert("Please enter valid stock.");
                return;
            }

            const submit =
                form.querySelector(
                    "button[type='submit']"
                );

            if (submit) {
                submit.disabled = true;
                submit.textContent = "Saving...";
            }

            try {

                if (editingProductId) {

                    const { data, error } =
                        await supabaseClient
                            .from("products")
                            .update({
                                name,
                                price,
                                stock,
                                updated_at: new Date().toISOString()
                            })
                            .eq("id", editingProductId)
                            .select()
                            .single();

                    if (error) throw error;

                    const index =
                        products.findIndex(
                            p => p.id === editingProductId
                        );

                    if (index !== -1) {
                        products[index] = mapProduct(data);
                    }

                    alert("Product updated successfully.");

                } else {

                    const { data, error } =
                        await supabaseClient
                            .from("products")
                            .insert({
                                business_id: currentBusiness.id,
                                name,
                                price,
                                stock
                            })
                            .select()
                            .single();

                    if (error) throw error;

                    products.unshift(mapProduct(data));

                    alert("Product added successfully.");
                }

                editingProductId = null;

                form.reset();

                closeAllModals();

                renderAll();

            } catch (error) {

                console.error("Product error:", error);

                alert(
                    "Could not save product.\n\n" +
                    error.message
                );

            } finally {

                if (submit) {
                    submit.disabled = false;
                    submit.textContent =
                        editingProductId
                            ? "Update Product"
                            : "Add Product";
                }
            }
        });
    }

    // ========================================================
    // DELETE PRODUCT
    // ========================================================

    async function deleteProduct(productId) {

        const product =
            products.find(
                p => p.id === productId
            );

        if (!product) return;

        const usedInSales =
            sales.some(
                sale => sale.productId === productId
            );

        const usedInInvoices =
            invoices.some(
                invoice => invoice.productId === productId
            );

        if (usedInSales || usedInInvoices) {

            alert(
                "This product cannot be deleted because " +
                "it is already used in sales or invoices."
            );

            return;
        }

        if (
            !confirm(
                `Delete "${product.name}"?`
            )
        ) {
            return;
        }

        try {

            const { error } =
                await supabaseClient
                    .from("products")
                    .delete()
                    .eq("id", productId);

            if (error) throw error;

            products =
                products.filter(
                    p => p.id !== productId
                );

            renderAll();

            alert("Product deleted.");

        } catch (error) {

            console.error(error);

            alert(
                "Could not delete product.\n\n" +
                error.message
            );
        }
    }

    // ========================================================
    // CUSTOMERS
    // ========================================================

    function renderCustomers() {

        const containers = document.querySelectorAll(
            "#customersList, #customerList, .customers-list"
        );

        containers.forEach(container => {

            if (!customers.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No customers yet</h3>
                        <p>Add your first customer to get started.</p>
                    </div>
                `;

                return;
            }

            container.innerHTML = customers.map(customer => `
                <div class="customer-card">

                    <div>
                        <h3>${safe(customer.name)}</h3>

                        <p>${safe(customer.email)}</p>

                        <p>${safe(customer.phone)}</p>
                    </div>

                    <button
                        type="button"
                        class="delete-customer"
                        data-id="${customer.id}">
                        Delete
                    </button>

                </div>
            `).join("");

            container
                .querySelectorAll(".delete-customer")
                .forEach(button => {

                    button.addEventListener("click", () => {
                        deleteCustomer(button.dataset.id);
                    });
                });
        });

        renderCustomerTable();
    }

    function renderCustomerTable() {

        const tbody =
            document.querySelector(
                "#customersTable tbody"
            );

        if (!tbody) return;

        if (!customers.length) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No customers yet.
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = customers.map(customer => `
            <tr>

                <td>${safe(customer.name)}</td>

                <td>${safe(customer.email)}</td>

                <td>${safe(customer.phone)}</td>

                <td>${formatDate(customer.createdAt)}</td>

                <td>
                    <button
                        class="delete-customer"
                        data-id="${customer.id}">
                        Delete
                    </button>
                </td>

            </tr>
        `).join("");

        tbody
            .querySelectorAll(".delete-customer")
            .forEach(button => {

                button.addEventListener("click", () => {
                    deleteCustomer(button.dataset.id);
                });
            });
    }

    function setupCustomerForm() {

        const form =
            document.querySelector(
                "#customerForm, #addCustomerForm"
            );

        if (!form) return;

        form.addEventListener("submit", async event => {

            event.preventDefault();

            const nameInput =
                form.querySelector(
                    "#customerName, #customer-name, [name='name']"
                );

            const emailInput =
                form.querySelector(
                    "#customerEmail, #customer-email, [name='email']"
                );

            const phoneInput =
                form.querySelector(
                    "#customerPhone, #customer-phone, [name='phone']"
                );

            const name =
                nameInput?.value.trim();

            const email =
                emailInput?.value.trim() || "";

            const phone =
                phoneInput?.value.trim() || "";

            if (!name) {
                alert("Please enter a customer name.");
                return;
            }

            if (email && !isValidEmail(email)) {
                alert("Please enter a valid email.");
                return;
            }

            try {

                const { data, error } =
                    await supabaseClient
                        .from("customers")
                        .insert({
                            business_id: currentBusiness.id,
                            name,
                            email,
                            phone
                        })
                        .select()
                        .single();

                if (error) throw error;

                customers.unshift(
                    mapCustomer(data)
                );

                form.reset();

                closeAllModals();

                renderAll();

                alert("Customer added successfully.");

            } catch (error) {

                console.error(error);

                alert(
                    "Could not add customer.\n\n" +
                    error.message
                );
            }
        });
    }

    async function deleteCustomer(customerId) {

        const customer =
            customers.find(
                c => c.id === customerId
            );

        if (!customer) return;

        const used =
            invoices.some(
                invoice =>
                    invoice.customerId === customerId
            );

        if (used) {

            alert(
                "This customer cannot be deleted because " +
                "they are used in an invoice."
            );

            return;
        }

        if (
            !confirm(
                `Delete "${customer.name}"?`
            )
        ) {
            return;
        }

        try {

            const { error } =
                await supabaseClient
                    .from("customers")
                    .delete()
                    .eq("id", customerId);

            if (error) throw error;

            customers =
                customers.filter(
                    c => c.id !== customerId
                );

            renderAll();

            alert("Customer deleted.");

        } catch (error) {

            console.error(error);

            alert(
                "Could not delete customer.\n\n" +
                error.message
            );
        }
    }

    // ========================================================
    // SALES
    // ========================================================

    function renderSales() {

        const containers = document.querySelectorAll(
            "#salesList, #saleList, .sales-list"
        );

        containers.forEach(container => {

            if (!sales.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No sales yet</h3>
                        <p>Record your first sale.</p>
                    </div>
                `;

                return;
            }

            container.innerHTML = sales.map(sale => `
                <div class="sale-item">

                    <div>
                        <strong>
                            ${safe(sale.productName)}
                        </strong>

                        <span>
                            ${sale.quantity} ×
                            ${money(
                                sale.total /
                                Math.max(sale.quantity, 1)
                            )}
                        </span>
                    </div>

                    <div>
                        <strong>${money(sale.total)}</strong>
                        <small>${formatDate(sale.createdAt)}</small>
                    </div>

                    <button
                        class="delete-sale"
                        data-id="${sale.id}">
                        Delete
                    </button>

                </div>
            `).join("");

            container
                .querySelectorAll(".delete-sale")
                .forEach(button => {

                    button.addEventListener("click", () => {
                        deleteSale(button.dataset.id);
                    });
                });
        });

        renderSalesTable();
    }

    function renderSalesTable() {

        const tbody =
            document.querySelector(
                "#salesTable tbody"
            );

        if (!tbody) return;

        if (!sales.length) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No sales yet.
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = sales.map(sale => `
            <tr>

                <td>${safe(sale.productName)}</td>

                <td>${sale.quantity}</td>

                <td>${money(sale.total)}</td>

                <td>${formatDate(sale.createdAt)}</td>

                <td>
                    <button
                        class="delete-sale"
                        data-id="${sale.id}">
                        Delete
                    </button>
                </td>

            </tr>
        `).join("");

        tbody
            .querySelectorAll(".delete-sale")
            .forEach(button => {

                button.addEventListener("click", () => {
                    deleteSale(button.dataset.id);
                });
            });
    }

    function setupSaleForm() {

        const form =
            document.querySelector(
                "#saleForm, #addSaleForm"
            );

        if (!form) return;

        populateProductSelects();

        form.addEventListener("submit", async event => {

            event.preventDefault();

            const productSelect =
                form.querySelector(
                    "#saleProduct, #sale-product, [name='productId']"
                );

            const quantityInput =
                form.querySelector(
                    "#saleQuantity, #sale-quantity, [name='quantity']"
                );

            const productId =
                productSelect?.value;

            const quantity =
                Number(quantityInput?.value);

            if (!productId) {
                alert("Please select a product.");
                return;
            }

            if (!quantity || quantity <= 0) {
                alert("Please enter a valid quantity.");
                return;
            }

            const product =
                products.find(
                    p => p.id === productId
                );

            if (!product) {
                alert("Product not found.");
                return;
            }

            if (quantity > product.stock) {
                alert(
                    `Only ${product.stock} item(s) available in stock.`
                );
                return;
            }

            const total =
                Number(product.price) * quantity;

            try {

                // 1. INSERT SALE
                const { data: saleData, error: saleError } =
                    await supabaseClient
                        .from("sales")
                        .insert({
                            business_id: currentBusiness.id,
                            product_id: product.id,
                            product_name: product.name,
                            quantity,
                            total
                        })
                        .select()
                        .single();

                if (saleError) throw saleError;

                // 2. UPDATE STOCK
                const newStock =
                    Number(product.stock) - quantity;

                const {
                    data: productData,
                    error: stockError
                } = await supabaseClient
                    .from("products")
                    .update({
                        stock: newStock,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", product.id)
                    .select()
                    .single();

                if (stockError) {

                    // Try to remove sale if stock update fails
                    await supabaseClient
                        .from("sales")
                        .delete()
                        .eq("id", saleData.id);

                    throw stockError;
                }

                sales.unshift(
                    mapSale(saleData)
                );

                const index =
                    products.findIndex(
                        p => p.id === product.id
                    );

                if (index !== -1) {
                    products[index] =
                        mapProduct(productData);
                }

                form.reset();

                closeAllModals();

                renderAll();

                alert("Sale recorded successfully.");

            } catch (error) {

                console.error(error);

                alert(
                    "Could not record sale.\n\n" +
                    error.message
                );
            }
        });
    }

    async function deleteSale(saleId) {

        const sale =
            sales.find(
                s => s.id === saleId
            );

        if (!sale) return;

        if (!confirm("Delete this sale?")) {
            return;
        }

        try {

            // Delete sale
            const { error: deleteError } =
                await supabaseClient
                    .from("sales")
                    .delete()
                    .eq("id", saleId);

            if (deleteError) {
                throw deleteError;
            }

            // Restore stock
            const product =
                products.find(
                    p => p.id === sale.productId
                );

            if (product) {

                const restoredStock =
                    Number(product.stock) +
                    Number(sale.quantity);

                const {
                    data: productData,
                    error: stockError
                } = await supabaseClient
                    .from("products")
                    .update({
                        stock: restoredStock,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", product.id)
                    .select()
                    .single();

                if (stockError) {
                    console.error(
                        "Stock restoration failed:",
                        stockError
                    );
                } else {

                    const index =
                        products.findIndex(
                            p => p.id === product.id
                        );

                    if (index !== -1) {
                        products[index] =
                            mapProduct(productData);
                    }
                }
            }

            sales =
                sales.filter(
                    s => s.id !== saleId
                );

            renderAll();

            alert("Sale deleted.");

        } catch (error) {

            console.error(error);

            alert(
                "Could not delete sale.\n\n" +
                error.message
            );
        }
    }

    // ========================================================
    // INVOICES
    // ========================================================

    function renderInvoices() {

        const containers = document.querySelectorAll(
            "#invoicesList, #invoiceList, .invoices-list"
        );

        containers.forEach(container => {

            if (!invoices.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No invoices yet</h3>
                        <p>Create your first invoice.</p>
                    </div>
                `;

                return;
            }

            container.innerHTML = invoices.map(invoice => `
                <div class="invoice-card">

                    <div>
                        <strong>
                            ${safe(invoice.invoiceNumber)}
                        </strong>

                        <p>
                            ${safe(invoice.customerName)}
                        </p>

                        <p>
                            ${safe(invoice.productName)}
                        </p>
                    </div>

                    <div>
                        <strong>
                            ${money(invoice.total)}
                        </strong>

                        <span>
                            ${safe(invoice.status)}
                        </span>
                    </div>

                    <div>

                        <button
                            class="toggle-invoice"
                            data-id="${invoice.id}">
                            Mark ${
                                invoice.status === "paid"
                                    ? "Unpaid"
                                    : "Paid"
                            }
                        </button>

                        <button
                            class="delete-invoice"
                            data-id="${invoice.id}">
                            Delete
                        </button>

                    </div>

                </div>
            `).join("");

            setupInvoiceButtons(container);
        });

        renderInvoiceTable();
    }

    function setupInvoiceButtons(container) {

        container
            .querySelectorAll(".toggle-invoice")
            .forEach(button => {

                button.addEventListener("click", () => {
                    toggleInvoiceStatus(button.dataset.id);
                });
            });

        container
            .querySelectorAll(".delete-invoice")
            .forEach(button => {

                button.addEventListener("click", () => {
                    deleteInvoice(button.dataset.id);
                });
            });
    }

    function renderInvoiceTable() {

        const tbody =
            document.querySelector(
                "#invoicesTable tbody"
            );

        if (!tbody) return;

        if (!invoices.length) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No invoices yet.
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = invoices.map(invoice => `
            <tr>

                <td>
                    ${safe(invoice.invoiceNumber)}
                </td>

                <td>
                    ${safe(invoice.customerName)}
                </td>

                <td>
                    ${safe(invoice.productName)}
                </td>

                <td>
                    ${money(invoice.total)}
                </td>

                <td>
                    ${safe(invoice.status)}
                </td>

                <td>
                    ${formatDate(invoice.dueDate)}
                </td>

                <td>

                    <button
                        class="toggle-invoice"
                        data-id="${invoice.id}">
                        ${
                            invoice.status === "paid"
                                ? "Unpaid"
                                : "Paid"
                        }
                    </button>

                    <button
                        class="delete-invoice"
                        data-id="${invoice.id}">
                        Delete
                    </button>

                </td>

            </tr>
        `).join("");

        setupInvoiceButtons(tbody);
    }

    function generateInvoiceNumber() {

        const number =
            invoices.length + 1;

        return "INV-" +
            String(number).padStart(4, "0");
    }

    function setupInvoiceForm() {

        const form =
            document.querySelector(
                "#invoiceForm, #createInvoiceForm"
            );

        if (!form) return;

        populateInvoiceSelects();

        form.addEventListener("submit", async event => {

            event.preventDefault();

            const customerSelect =
                form.querySelector(
                    "#invoiceCustomer, #invoice-customer, [name='customerId']"
                );

            const productSelect =
                form.querySelector(
                    "#invoiceProduct, #invoice-product, [name='productId']"
                );

            const quantityInput =
                form.querySelector(
                    "#invoiceQuantity, #invoice-quantity, [name='quantity']"
                );

            const discountInput =
                form.querySelector(
                    "#invoiceDiscount, #invoice-discount, [name='discount']"
                );

            const taxInput =
                form.querySelector(
                    "#invoiceTax, #invoice-tax, [name='taxRate']"
                );

            const dueDateInput =
                form.querySelector(
                    "#invoiceDueDate, #invoice-due-date, [name='dueDate']"
                );

            const customerId =
                customerSelect?.value;

            const productId =
                productSelect?.value;

            const quantity =
                Number(quantityInput?.value);

            const discount =
                Number(discountInput?.value || 0);

            const taxRate =
                Number(taxInput?.value || 0);

            const dueDate =
                dueDateInput?.value || null;

            const customer =
                customers.find(
                    c => c.id === customerId
                );

            const product =
                products.find(
                    p => p.id === productId
                );

            if (!customer) {
                alert("Please select a customer.");
                return;
            }

            if (!product) {
                alert("Please select a product.");
                return;
            }

            if (!quantity || quantity <= 0) {
                alert("Please enter a valid quantity.");
                return;
            }

            if (discount < 0) {
                alert("Discount cannot be negative.");
                return;
            }

            if (taxRate < 0) {
                alert("Tax rate cannot be negative.");
                return;
            }

            const subtotal =
                Number(product.price) *
                quantity;

            const discountedSubtotal =
                Math.max(
                    0,
                    subtotal - discount
                );

            const tax =
                discountedSubtotal *
                (taxRate / 100);

            const total =
                discountedSubtotal + tax;

            try {

                const { data, error } =
                    await supabaseClient
                        .from("invoices")
                        .insert({
                            business_id: currentBusiness.id,

                            invoice_number:
                                generateInvoiceNumber(),

                            customer_id:
                                customer.id,

                            customer_name:
                                customer.name,

                            product_id:
                                product.id,

                            product_name:
                                product.name,

                            quantity,

                            subtotal,

                            discount,

                            tax_rate: taxRate,

                            tax,

                            total,

                            due_date: dueDate,

                            status: "unpaid"
                        })
                        .select()
                        .single();

                if (error) throw error;

                invoices.unshift(
                    mapInvoice(data)
                );

                form.reset();

                closeAllModals();

                renderAll();

                alert("Invoice created successfully.");

            } catch (error) {

                console.error(error);

                alert(
                    "Could not create invoice.\n\n" +
                    error.message
                );
            }
        });
    }

    async function toggleInvoiceStatus(invoiceId) {

        const invoice =
            invoices.find(
                i => i.id === invoiceId
            );

        if (!invoice) return;

        const newStatus =
            invoice.status === "paid"
                ? "unpaid"
                : "paid";

        try {

            const { data, error } =
                await supabaseClient
                    .from("invoices")
                    .update({
                        status: newStatus
                    })
                    .eq("id", invoiceId)
                    .select()
                    .single();

            if (error) throw error;

            const index =
                invoices.findIndex(
                    i => i.id === invoiceId
                );

            if (index !== -1) {
                invoices[index] =
                    mapInvoice(data);
            }

            renderAll();

        } catch (error) {

            console.error(error);

            alert(
                "Could not update invoice.\n\n" +
                error.message
            );
        }
    }

    async function deleteInvoice(invoiceId) {

        if (!confirm("Delete this invoice?")) {
            return;
        }

        try {

            const { error } =
                await supabaseClient
                    .from("invoices")
                    .delete()
                    .eq("id", invoiceId);

            if (error) throw error;

            invoices =
                invoices.filter(
                    invoice =>
                        invoice.id !== invoiceId
                );

            renderAll();

            alert("Invoice deleted.");

        } catch (error) {

            console.error(error);

            alert(
                "Could not delete invoice.\n\n" +
                error.message
            );
        }
    }

    // ========================================================
    // SELECT DROPDOWNS
    // ========================================================

    function populateProductSelects() {

        const selectors = [
            "#saleProduct",
            "#sale-product",
            "#invoiceProduct",
            "#invoice-product"
        ];

        selectors.forEach(selector => {

            const select =
                document.querySelector(selector);

            if (!select) return;

            const current =
                select.value;

            const isInvoice =
                selector.toLowerCase().includes("invoice");

            const firstOption =
                isInvoice
                    ? "Select product"
                    : "Select product";

            select.innerHTML = `
                <option value="">
                    ${firstOption}
                </option>

                ${products.map(product => `
                    <option value="${product.id}">
                        ${safe(product.name)}
                        - ${money(product.price)}
                        ${
                            isInvoice
                                ? ""
                                : `(${product.stock} in stock)`
                        }
                    </option>
                `).join("")}
            `;

            if (
                products.some(
                    p => p.id === current
                )
            ) {
                select.value = current;
            }
        });
    }

    function populateInvoiceSelects() {

        const customerSelect =
            document.querySelector(
                "#invoiceCustomer, #invoice-customer"
            );

        if (customerSelect) {

            customerSelect.innerHTML = `
                <option value="">
                    Select customer
                </option>

                ${customers.map(customer => `
                    <option value="${customer.id}">
                        ${safe(customer.name)}
                    </option>
                `).join("")}
            `;
        }

        populateProductSelects();
    }

    // ========================================================
    // ANALYTICS
    // ========================================================

    function renderAnalytics() {

        const revenue =
            sales.reduce(
                (sum, sale) =>
                    sum + Number(sale.total || 0),
                0
            );

        const totalItems =
            sales.reduce(
                (sum, sale) =>
                    sum + Number(sale.quantity || 0),
                0
            );

        const averageSale =
            sales.length
                ? revenue / sales.length
                : 0;

        document
            .querySelectorAll(
                "#analyticsRevenue, [data-analytics='revenue']"
            )
            .forEach(el => {
                el.textContent = money(revenue);
            });

        document
            .querySelectorAll(
                "#totalItemsSold, [data-analytics='items']"
            )
            .forEach(el => {
                el.textContent = totalItems;
            });

        document
            .querySelectorAll(
                "#averageSale, [data-analytics='average']"
            )
            .forEach(el => {
                el.textContent = money(averageSale);
            });

        renderTopProducts();
    }

    function renderTopProducts() {

        const container =
            document.querySelector(
                "#topProducts, .top-products"
            );

        if (!container) return;

        const totals = {};

        sales.forEach(sale => {

            if (!totals[sale.productName]) {
                totals[sale.productName] = 0;
            }

            totals[sale.productName] +=
                Number(sale.total || 0);
        });

        const sorted =
            Object.entries(totals)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

        if (!sorted.length) {

            container.innerHTML =
                `<p>No sales data yet.</p>`;

            return;
        }

        container.innerHTML =
            sorted.map(([name, total], index) => `
                <div class="top-product-item">

                    <span>
                        ${index + 1}.
                        ${safe(name)}
                    </span>

                    <strong>
                        ${money(total)}
                    </strong>

                </div>
            `).join("");
    }

    // ========================================================
    // MODALS
    // ========================================================

    function setupModalBehavior() {

        document
            .querySelectorAll(
                "[data-modal], .open-modal"
            )
            .forEach(button => {

                button.addEventListener("click", () => {

                    const modalId =
                        button.dataset.modal ||
                        button.dataset.target;

                    if (!modalId) return;

                    const modal =
                        document.querySelector(
                            modalId.startsWith("#")
                                ? modalId
                                : "#" + modalId
                        );

                    if (modal) {
                        modal.classList.add("active");
                        modal.style.display = "flex";
                    }
                });
            });

        document
            .querySelectorAll(
                ".modal-close, .close-modal, [data-close-modal]"
            )
            .forEach(button => {

                button.addEventListener("click", () => {
                    closeAllModals();
                });
            });

        document
            .querySelectorAll(".modal")
            .forEach(modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target === modal
                        ) {
                            closeAllModals();
                        }
                    }
                );
            });
    }

    function closeAllModals() {

        document
            .querySelectorAll(
                ".modal, .modal-overlay"
            )
            .forEach(modal => {

                modal.classList.remove("active");
                modal.style.display = "none";
            });

        editingProductId = null;

        document
            .querySelectorAll(
                "#productForm button[type='submit']"
            )
            .forEach(button => {
                button.textContent = "Add Product";
            });
    }

    // ========================================================
    // BUSINESS CONTACT LINKS
    // ========================================================

    function setupBusinessContactLinks() {

        const emailElements =
            document.querySelectorAll(
                "[data-business-email]"
            );

        emailElements.forEach(el => {

            if (currentUser?.email) {

                el.textContent =
                    currentUser.email;

                if (el.tagName === "A") {
                    el.href =
                        "mailto:" + currentUser.email;
                }
            }
        });
    }

    // ========================================================
    // CONTACT FORM
    // ========================================================

    function setupContactForm() {

        const form =
            document.querySelector(
                "#contactForm"
            );

        if (!form) return;

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                alert(
                    "Thanks! Your message has been received."
                );

                form.reset();
            }
        );
    }

    // ========================================================
    // BACKUP / EXPORT
    // ========================================================

    function setupBackup() {

        const exportButtons =
            document.querySelectorAll(
                "#exportData, #exportBackup, [data-export]"
            );

        exportButtons.forEach(button => {

            button.addEventListener(
                "click",
                exportBusinessData
            );
        });

        const importInput =
            document.querySelector(
                "#importData, #importBackup"
            );

        if (importInput) {

            importInput.addEventListener(
                "change",
                event => {

                    const file =
                        event.target.files?.[0];

                    if (file) {
                        importBusinessData(file);
                    }
                }
            );
        }

        const resetButtons =
            document.querySelectorAll(
                "#resetData, #resetBusinessData, [data-reset]"
            );

        resetButtons.forEach(button => {

            button.addEventListener(
                "click",
                resetBusinessData
            );
        });
    }

    function exportBusinessData() {

        const backup = {

            version: 1,

            business: {
                name: currentBusiness?.name || ""
            },

            products,
            customers,
            sales,
            invoices,

            exportedAt:
                new Date().toISOString()
        };

        const blob =
            new Blob(
                [JSON.stringify(backup, null, 2)],
                {
                    type: "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "patriodx-backup-" +
            todayString() +
            ".json";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);
    }

    // ========================================================
    // IMPORT DATA
    // ========================================================

    async function importBusinessData(file) {

        if (
            !confirm(
                "Importing this backup will replace your current " +
                "PATRIODX business data. Continue?"
            )
        ) {
            return;
        }

        try {

            const textData =
                await file.text();

            const backup =
                JSON.parse(textData);

            if (!backup || typeof backup !== "object") {
                throw new Error(
                    "Invalid backup file."
                );
            }

            const oldProducts =
                Array.isArray(backup.products)
                    ? backup.products
                    : [];

            const oldCustomers =
                Array.isArray(backup.customers)
                    ? backup.customers
                    : [];

            const oldSales =
                Array.isArray(backup.sales)
                    ? backup.sales
                    : [];

            const oldInvoices =
                Array.isArray(backup.invoices)
                    ? backup.invoices
                    : [];

            // --------------------------------------------
            // DELETE CURRENT DATA
            // --------------------------------------------

            let result =
                await supabaseClient
                    .from("invoices")
                    .delete()
                    .eq(
                        "business_id",
                        currentBusiness.id
                    );

            if (result.error) throw result.error;

            result =
                await supabaseClient
                    .from("sales")
                    .delete()
                    .eq(
                        "business_id",
                        currentBusiness.id
                    );

            if (result.error) throw result.error;

            result =
                await supabaseClient
                    .from("customers")
                    .delete()
                    .eq(
                        "business_id",
                        currentBusiness.id
                    );

            if (result.error) throw result.error;

            result =
                await supabaseClient
                    .from("products")
                    .delete()
                    .eq(
                        "business_id",
                        currentBusiness.id
                    );

            if (result.error) throw result.error;

            // --------------------------------------------
            // PRODUCT ID MAP
            // --------------------------------------------

            const productIdMap = {};

            for (const oldProduct of oldProducts) {

                const { data, error } =
                    await supabaseClient
                        .from("products")
                        .insert({
                            business_id:
                                currentBusiness.id,

                            name:
                                oldProduct.name ||
                                oldProduct.productName ||
                                "Unnamed Product",

                            price:
                                Number(
                                    oldProduct.price
                                ) || 0,

                            stock:
                                Number(
                                    oldProduct.stock
                                ) || 0
                        })
                        .select()
                        .single();

                if (error) throw error;

                const oldId =
                    oldProduct.id ||
                    oldProduct.productId;

                if (oldId) {
                    productIdMap[oldId] =
                        data.id;
                }
            }

            // --------------------------------------------
            // CUSTOMER ID MAP
            // --------------------------------------------

            const customerIdMap = {};

            for (const oldCustomer of oldCustomers) {

                const { data, error } =
                    await supabaseClient
                        .from("customers")
                        .insert({
                            business_id:
                                currentBusiness.id,

                            name:
                                oldCustomer.name ||
                                oldCustomer.customerName ||
                                "Unnamed Customer",

                            email:
                                oldCustomer.email || "",

                            phone:
                                oldCustomer.phone || ""
                        })
                        .select()
                        .single();

                if (error) throw error;

                const oldId =
                    oldCustomer.id ||
                    oldCustomer.customerId;

                if (oldId) {
                    customerIdMap[oldId] =
                        data.id;
                }
            }

            // --------------------------------------------
            // SALES
            // --------------------------------------------

            for (const oldSale of oldSales) {

                const oldProductId =
                    oldSale.productId ||
                    oldSale.product_id;

                const newProductId =
                    productIdMap[oldProductId];

                if (!newProductId) continue;

                const { error } =
                    await supabaseClient
                        .from("sales")
                        .insert({
                            business_id:
                                currentBusiness.id,

                            product_id:
                                newProductId,

                            product_name:
                                oldSale.productName ||
                                oldSale.product_name ||
                                "Product",

                            quantity:
                                Number(
                                    oldSale.quantity
                                ) || 0,

                            total:
                                Number(
                                    oldSale.total
                                ) || 0
                        });

                if (error) throw error;
            }

            // --------------------------------------------
            // INVOICES
            // --------------------------------------------

            for (const oldInvoice of oldInvoices) {

                const oldCustomerId =
                    oldInvoice.customerId ||
                    oldInvoice.customer_id;

                const oldProductId =
                    oldInvoice.productId ||
                    oldInvoice.product_id;

                const newCustomerId =
                    customerIdMap[oldCustomerId];

                const newProductId =
                    productIdMap[oldProductId];

                if (!newCustomerId || !newProductId) {
                    continue;
                }

                const { error } =
                    await supabaseClient
                        .from("invoices")
                        .insert({
                            business_id:
                                currentBusiness.id,

                            invoice_number:
                                oldInvoice.invoiceNumber ||
                                "INV-" +
                                Math.random()
                                    .toString(36)
                                    .substring(2, 8)
                                    .toUpperCase(),

                            customer_id:
                                newCustomerId,

                            customer_name:
                                oldInvoice.customerName ||
                                "Customer",

                            product_id:
                                newProductId,

                            product_name:
                                oldInvoice.productName ||
                                "Product",

                            quantity:
                                Number(
                                    oldInvoice.quantity
                                ) || 0,

                            subtotal:
                                Number(
                                    oldInvoice.subtotal
                                ) || 0,

                            discount:
                                Number(
                                    oldInvoice.discount
                                ) || 0,

                            tax_rate:
                                Number(
                                    oldInvoice.taxRate
                                ) || 0,

                            tax:
                                Number(
                                    oldInvoice.tax
                                ) || 0,

                            total:
                                Number(
                                    oldInvoice.total
                                ) || 0,

                            due_date:
                                oldInvoice.dueDate ||
                                null,

                            status:
                                oldInvoice.status ||
                                "unpaid"
                        });

                if (error) throw error;
            }

            await loadDataFromSupabase();

            renderAll();

            alert(
                "Backup imported successfully."
            );

        } catch (error) {

            console.error(
                "Import error:",
                error
            );

            alert(
                "Could not import backup.\n\n" +
                error.message
            );

            await loadDataFromSupabase();

            renderAll();
        }
    }

    // ========================================================
    // RESET BUSINESS DATA
    // ========================================================

    async function resetBusinessData() {

        const confirmation =
            prompt(
                "This will permanently delete all products, " +
                "customers, sales and invoices.\n\n" +
                "Type DELETE to continue:"
            );

        if (confirmation !== "DELETE") {
            return;
        }

        try {

            let result =
                await supabaseClient
                    .from("invoices")
                    .delete()
                    .eq(
                        "business_id",
                        currentBusiness.id
                    );

            if (result.error) throw result.error;

            result =
                await supabaseClient
                    .from("sales")
                    .delete()
                    .eq(
                        "business_id",
                        currentBusiness.id
                    );

            if (result.error) throw result.error;

            result =
                await supabaseClient
                    .from("customers")
                    .delete()
                    .eq(
                        "business_id",
                        currentBusiness.id
                    );

            if (result.error) throw result.error;

            result =
                await supabaseClient
                    .from("products")
                    .delete()
                    .eq(
                        "business_id",
                        currentBusiness.id
                    );

            if (result.error) throw result.error;

            products = [];
            customers = [];
            sales = [];
            invoices = [];

            renderAll();

            alert(
                "All business data has been reset."
            );

        } catch (error) {

            console.error(error);

            alert(
                "Could not reset your data.\n\n" +
                error.message
            );
        }
    }

    // ========================================================
    // PAYMENT
    // ========================================================

    async function initializeRealPayment({
        email,
        amountGHS,
        product,
        plan
    }) {

        if (!email || !isValidEmail(email)) {

            alert(
                "Please provide a valid email address."
            );

            return;
        }

        try {

            const reference =
                createReference();

            localStorage.setItem(
                "patriodxPendingPayment",
                JSON.stringify({
                    reference,
                    email,
                    amountGHS,
                    product,
                    plan,
                    createdAt:
                        new Date().toISOString()
                })
            );

            const response =
                await fetch(
                    PAYMENT_API_URL +
                    "/api/initialize-payment",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            amount:
                                amountGHS * 100,
                            currency:
                                PAYSTACK_CURRENCY,
                            reference,
                            product,
                            plan
                        })
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Payment initialization failed."
                );
            }

            if (result.authorization_url) {

                window.location.href =
                    result.authorization_url;

                return;
            }

            if (result.data?.authorization_url) {

                window.location.href =
                    result.data.authorization_url;

                return;
            }

            throw new Error(
                "No payment URL returned."
            );

        } catch (error) {

            console.error(
                "Payment error:",
                error
            );

            alert(
                "Payment could not be started.\n\n" +
                error.message
            );
        }
    }

    // ========================================================
    // VERIFY RETURNED PAYMENT
    // ========================================================

    async function verifyReturnedPayment() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const reference =
            params.get("reference") ||
            params.get("trxref");

        if (!reference) {
            return;
        }

        try {

            const response =
                await fetch(
                    PAYMENT_API_URL +
                    "/api/verify-payment?reference=" +
                    encodeURIComponent(reference)
                );

            const result =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Payment verification failed."
                );
            }

            const payment =
                result.data ||
                result;

            const pendingRaw =
                localStorage.getItem(
                    "patriodxPendingPayment"
                );

            const pending =
                pendingRaw
                    ? JSON.parse(pendingRaw)
                    : null;

            if (!payment) {
                return;
            }

            const amount =
                Number(
                    payment.amount || 0
                );

            const currency =
                payment.currency;

            const status =
                payment.status;

            if (
                status === "success" &&
                currency === PAYSTACK_CURRENCY &&
                amount === PRO_PRICE_GHS * 100
            ) {

                localStorage.setItem(
                    "businessOSPro",
                    "true"
                );

                localStorage.setItem(
                    "patriodxPayment",
                    JSON.stringify({
                        reference,
                        amount,
                        currency,
                        paidAt:
                            new Date().toISOString(),
                        email:
                            pending?.email ||
                            currentUser?.email ||
                            ""
                    })
                );

                localStorage.removeItem(
                    "patriodxPendingPayment"
                );

                updateProUI();

                alert(
                    "Payment successful! PATRIODX Pro is now active."
                );
            }

            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );

        } catch (error) {

            console.error(
                "Payment verification error:",
                error
            );
        }
    }

    // ========================================================
    // PRO UI
    // ========================================================

    function updateProUI() {

        const isPro =
            localStorage.getItem(
                "businessOSPro"
            ) === "true";

        document
            .querySelectorAll(
                "#proStatus, .pro-status"
            )
            .forEach(el => {

                el.textContent =
                    isPro
                        ? "Pro Active"
                        : "Free Plan";
            });

        document
            .querySelectorAll(
                "[data-pro-only]"
            )
            .forEach(el => {

                el.style.display =
                    isPro ? "" : "none";
            });
    }

    // ========================================================
    // PRICING BUTTONS
    // ========================================================

    function setupPaymentButtons() {

        document
            .querySelectorAll(
                "#proPlanButton, .pro-plan-button, [data-plan='pro']"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        if (
                            localStorage.getItem(
                                "businessOSPro"
                            ) === "true"
                        ) {

                            alert(
                                "PATRIODX Pro is already active."
                            );

                            return;
                        }

                        const email =
                            currentUser?.email;

                        if (!email) {

                            alert(
                                "Please sign in before purchasing Pro."
                            );

                            return;
                        }

                        await initializeRealPayment({
                            email,
                            amountGHS:
                                PRO_PRICE_GHS,
                            product:
                                "PATRIODX Pro",
                            plan:
                                "pro"
                        });
                    }
                );
            });
    }

    // ========================================================
    // LOGOUT
    // ========================================================

    async function logout() {

        try {

            const { error } =
                await supabaseClient
                    .auth.signOut();

            if (error) {
                throw error;
            }

            window.location.href =
                "auth.html";

        } catch (error) {

            console.error(error);

            alert(
                "Could not sign out.\n\n" +
                error.message
            );
        }
    }

    // Make logout available to HTML buttons
    window.logout = logout;
    window.PATRIODX = {
        logout,
        exportBusinessData,
        resetBusinessData
    };

    // ========================================================
    // AUTO LOGOUT IF SESSION ENDS
    // ========================================================

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            if (
                event === "SIGNED_OUT" ||
                !session
            ) {

                window.location.href =
                    "auth.html";
            }
        }
    );

    // ========================================================
    // INITIALIZE APP
    // ========================================================

    async function initializeApp() {

        try {

            // 1. Check login
            const authenticated =
                await checkAuthentication();

            if (!authenticated) {
                return;
            }

            // 2. Get business
            const businessLoaded =
                await loadBusiness();

            if (!businessLoaded) {
                return;
            }

            // 3. Load cloud data
            await loadDataFromSupabase();

            // 4. Setup UI
            setupNavigation();
            setupSearch();
            setupModalBehavior();
            setupDarkMode();

            setupProductForm();
            setupCustomerForm();
            setupSaleForm();
            setupInvoiceForm();

            setupBackup();
            setupContactForm();
            setupBusinessContactLinks();

            setupPaymentButtons();

            // 5. Render everything
            renderAll();

            // 6. Check payment return
            await verifyReturnedPayment();

            console.log(
                "PATRIODX initialized successfully."
            );

        } catch (error) {

            console.error(
                "PATRIODX initialization error:",
                error
            );

            alert(
                "PATRIODX could not load your business data.\n\n" +
                error.message
            );
        }
    }

    await initializeApp();
});
