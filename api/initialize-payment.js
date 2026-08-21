export default async function handler(req, res) {
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

        if (!email) {
            return res.status(400).json({
                status: false,
                error: "Email is required"
            });
        }

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

        // BusinessOS sends GHS amounts.
        // Paystack expects pesewas.
        const amountInPesewas =
            Math.round(numericAmount * 100);

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
                status: data.status,
                message: data.message
            }
        );

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

        return res.status(200).json({
            status: true,

            message:
                data.message ||
                "Payment initialized",

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
