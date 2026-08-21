export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { reference } = req.body;

        if (!reference) {
            return res.status(400).json({
                error: "Payment reference is required"
            });
        }

        // Secret key stays on Vercel.
        const secretKey = process.env.PAYSTACK_SECRET_KEY;

        if (!secretKey) {
            return res.status(500).json({
                error: "PAYSTACK_SECRET_KEY is not configured"
            });
        }

        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.status) {
            return res.status(response.status || 400).json({
                error: data.message || "Unable to verify payment"
            });
        }

        const payment = data.data;

        return res.status(200).json({
            status: true,
            message: "Payment verification completed",
            data: {
                reference: payment.reference,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                paid_at: payment.paid_at,
                customer: payment.customer
            }
        });

    } catch (error) {
        console.error("Payment verification error:", error);

        return res.status(500).json({
            error: "Server error while verifying payment"
        });
    }
}
