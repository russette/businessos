export default async function handler(req, res) {

    // =========================================================
    // CORS
    // =========================================================

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


    // =========================================================
    // OPTIONS
    // =========================================================

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }


    // =========================================================
    // POST ONLY
    // =========================================================

    if (req.method !== "POST") {

        return res.status(405).json({

            status: false,

            error:
                "Method not allowed"

        });
    }


    try {

        // =====================================================
        // GET REFERENCE
        // =====================================================

        const {
            reference
        } = req.body || {};


        if (!reference) {

            return res.status(400).json({

                status: false,

                error:
                    "Payment reference is required"

            });
        }


        // =====================================================
        // PAYSTACK SECRET KEY
        // =====================================================

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


        // =====================================================
        // VERIFY WITH PAYSTACK
        // =====================================================

        const paystackResponse =
            await fetch(
                `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
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


        const paystackResult =
            await paystackResponse.json();


        console.log(
            "Paystack verification:",
            {
                httpStatus:
                    paystackResponse.status,

                status:
                    paystackResult.status,

                message:
                    paystackResult.message,

                reference
            }
        );


        // =====================================================
        // PAYSTACK API ERROR
        // =====================================================

        if (
            !paystackResponse.ok ||
            !paystackResult.status
        ) {

            return res.status(
                paystackResponse.status || 400
            ).json({

                status: false,

                error:
                    paystackResult.message ||
                    "Unable to verify payment"

            });
        }


        // =====================================================
        // VERIFIED PAYMENT
        // =====================================================

        const payment =
            paystackResult.data;


        if (!payment) {

            return res.status(400).json({

                status: false,

                error:
                    "Paystack returned no transaction data"

            });
        }


        console.log(
            "Verified transaction:",
            {
                reference:
                    payment.reference,

                status:
                    payment.status,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                customer:
                    payment.customer?.email
            }
        );


        // =====================================================
        // RETURN VERIFIED PAYMENT
        // =====================================================

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
