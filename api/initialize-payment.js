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
    // CORS PREFLIGHT
    // ---------------------------------------------------------

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }


    // ---------------------------------------------------------
    // ONLY POST
    // ---------------------------------------------------------

    if (req.method !== "POST") {

        return res.status(405).json({
            status: false,
            error: "Method not allowed"
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
        // VALIDATE EMAIL
        // -----------------------------------------------------

        if (!email) {

            return res.status(400).json({
                status: false,
                error: "Email is required"
            });

        }


        // -----------------------------------------------------
        // VALIDATE AMOUNT
        // -----------------------------------------------------

        const numericAmount = Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {

            return res.status(400).json({
                status: false,
                error: "Invalid payment amount"
            });

        }


        // -----------------------------------------------------
        // PAYSTACK SECRET KEY
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
        // CONVERT GHS TO PESEWAS
        // -----------------------------------------------------

        const amountInPesewas =
            Math.round(numericAmount * 100);


        // -----------------------------------------------------
        // BUSINESSOS CALLBACK URL
        //
        // If the frontend doesn't send one, use the
        // official BusinessOS GitHub Pages URL.
        // -----------------------------------------------------

        const finalCallbackUrl =
            callback_url ||
            "https://russette.github.io/business-os/";


        // -----------------------------------------------------
        // INITIALIZE PAYSTACK TRANSACTION
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


        // -----------------------------------------------------
        // READ PAYSTACK RESPONSE
        // -----------------------------------------------------

        const data =
            await paystackResponse.json();


        console.log(
            "Paystack initialization:",
            {
                status:
                    data.status,

                message:
                    data.message,

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
