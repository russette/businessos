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


    // ---------------------------------------------------------
    // Handle browser CORS preflight
    // ---------------------------------------------------------

    if (req.method === "OPTIONS") {

        return res.status(204).end();

    }


    // ---------------------------------------------------------
    // Only POST is allowed after preflight
    // ---------------------------------------------------------

    if (req.method !== "POST") {

        return res.status(405).json({

            status: false,

            error:
                "Method not allowed"

        });

    }


    try {

        const {
            email,
            amount,
            reference,
            callback_url
        } = req.body || {};


        // -----------------------------------------------------
        // Validate email
        // -----------------------------------------------------

        if (!email) {

            return res.status(400).json({

                status: false,

                error:
                    "Email is required"

            });

        }


        // -----------------------------------------------------
        // Validate amount
        // -----------------------------------------------------

        const numericAmount =
            Number(amount);


        if (
            !Number.isFinite(
                numericAmount
            ) ||
            numericAmount <= 0
        ) {

            return res.status(400).json({

                status: false,

                error:
                    "Invalid payment amount"

            });

        }


        // -----------------------------------------------------
        // Paystack secret key
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
                    "PAYSTACK_SECRET_KEY is not configured on Vercel"

            });

        }


        // -----------------------------------------------------
        // Convert GHS to pesewas
        // -----------------------------------------------------

        const amountInPesewas =
            Math.round(
                numericAmount * 100
            );


        // -----------------------------------------------------
        // Initialize Paystack transaction
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

                    body:
                        JSON.stringify({

                            email:
                                String(email).trim(),

                            amount:
                                amountInPesewas,

                            currency:
                                "GHS",

                            ...(reference
                                ? {
                                    reference:
                                        String(reference)
                                }
                                : {}),

                            ...(callback_url
                                ? {
                                    callback_url
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
                status:
                    data.status,

                message:
                    data.message
            }
        );


        // -----------------------------------------------------
        // Paystack rejected request
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
        // Success
        // -----------------------------------------------------

        return res.status(200).json({

            status: true,

            message:
                data.message ||
                "Payment initialized successfully",

            data: {

                authorization_url:
                    data.data.authorization_url,

                access_code:
                    data.data.access_code,

                reference:
                    data.data.reference

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
