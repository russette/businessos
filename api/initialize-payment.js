export default async function handler(req, res) {

    // ---------------------------------------------------------
    // CORS
    // ---------------------------------------------------------

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            status: false,
            error: "Method not allowed"
        });
    }

    try {

        const {
            email,
            reference,
            product,
            plan,
            callback_url
        } = req.body || {};

        // -----------------------------------------------------
        // EMAIL
        // -----------------------------------------------------

        if (!email) {
            return res.status(400).json({
                status: false,
                error: "Email is required"
            });
        }

        // -----------------------------------------------------
        // SECRET KEY
        // -----------------------------------------------------

        const secretKey =
            process.env.PAYSTACK_SECRET_KEY;

        if (!secretKey) {
            console.error(
                "PAYSTACK_SECRET_KEY is missing"
            );

            return res.status(500).json({
                status: false,
                error:
                    "PAYSTACK_SECRET_KEY is not configured"
            });
        }

        // -----------------------------------------------------
        // SERVER-SIDE PRODUCT PRICING
        // -----------------------------------------------------

        let amountGHS;

        if (
            product === "BusinessOS Pro" &&
            plan === "Pro"
        ) {

            amountGHS = 900;

        } else {

            return res.status(400).json({
                status: false,
                error: "Invalid BusinessOS product or plan"
            });

        }

        // -----------------------------------------------------
        // CONVERT GHS → PESEWAS
        // -----------------------------------------------------

        const amountInPesewas =
            Math.round(amountGHS * 100);

        // -----------------------------------------------------
        // CALLBACK
        // -----------------------------------------------------

        const finalCallbackUrl =
            callback_url ||
            "https://russette.github.io/business-os/";

        // -----------------------------------------------------
        // PAYSTACK INITIALIZATION
        // -----------------------------------------------------

        const paystackResponse =
            await fetch(
                "https://api.paystack.co/transaction/initialize",
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${secretKey}`,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email:
                            String(email).trim(),

                        amount:
                            amountInPesewas,

                        currency:
                            "GHS",

                        callback_url:
                            finalCallbackUrl,

                        ...(reference
                            ? {
                                reference:
                                    String(reference)
                            }
                            : {})
                    })
                }
            );

        const data =
            await paystackResponse.json();

        console.log(
            "Paystack initialization:",
            {
                status: data.status,
                message: data.message,
                reference:
                    data?.data?.reference
            }
        );

        // -----------------------------------------------------
        // PAYSTACK ERROR
        // -----------------------------------------------------

        if (
            !paystackResponse.ok ||
            !data.status
        ) {

            return res.status(
                paystackResponse.status || 400
            ).json({
                status: false,
                error:
                    data.message ||
                    "Paystack payment initialization failed"
            });

        }

        // -----------------------------------------------------
        // SUCCESS
        // -----------------------------------------------------

        return res.status(200).json({

            status: true,

            message:
                "BusinessOS Pro payment initialized",

            data: {

                authorization_url:
                    data.data.authorization_url,

                access_code:
                    data.data.access_code,

                reference:
                    data.data.reference,

                amount:
                    amountGHS,

                currency:
                    "GHS"
            }
        });

    } catch (error) {

        console.error(
            "Payment initialization error:",
            error
        );

        return res.status(500).json({
            status: false,
            error:
                error.message ||
                "Server error while initializing payment"
        });
    }
}
