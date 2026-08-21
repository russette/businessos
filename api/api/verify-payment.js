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
    // Handle CORS preflight
    // ---------------------------------------------------------

    if (req.method === "OPTIONS") {

        return res.status(204).end();

    }


    // ---------------------------------------------------------
    // Only POST allowed
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
            reference
        } = req.body || {};


        // -----------------------------------------------------
        // Validate reference
        // -----------------------------------------------------

        if (!reference) {

            return res.status(400).json({

                status: false,

                error:
                    "Payment reference is required"

            });

        }


        // -----------------------------------------------------
        // Secret key
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
        // Verify transaction with Paystack
        // -----------------------------------------------------

        const paystackResponse =
            await fetch(

                `https://api.paystack.co/transaction/verify/${encodeURIComponent(
                    reference
                )}`,

                {

                    method: "GET",

                    headers: {

                        Authorization:
                            `Bearer ${secretKey}`,

                        "Content-Type":
                            "application/json"

                    }

                }

            );


        const data =
            await paystackResponse.json();


        console.log(
            "Paystack verification:",
            {
                status:
                    data.status,

                message:
                    data.message
            }
        );


        // -----------------------------------------------------
        // Paystack verification failed
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
                    "Unable to verify payment"

            });

        }


        const payment =
            data.data;


        // -----------------------------------------------------
        // Return verified payment
        // -----------------------------------------------------

        return res.status(200).json({

            status: true,

            message:
                "Payment verification completed",

            data: {

                reference:
                    payment.reference,

                status:
                    payment.status,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                paid_at:
                    payment.paid_at,

                customer:
                    payment.customer

            }

        });


    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );


        return res.status(500).json({

            status: false,

            error:
                error.message ||
                "Server error while verifying payment"

        });

    }

}
