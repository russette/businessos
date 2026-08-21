export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const {
            email,
            amount,
            reference,
            callback_url
        } = req.body;

        // Validate required information
        if (!email || !amount) {
            return res.status(400).json({
                error: "Email and amount are required"
            });
        }

        // Paystack expects amount in the smallest currency unit
        // Example: $10.00 = 1000 cents
        const amountInCents = Math.round(Number(amount) * 100);

        if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
            return res.status(400).json({
                error: "Invalid payment amount"
            });
        }

        // Your Paystack SECRET key stays on Vercel.
        // NEVER put this key inside script.js.
        const secretKey = process.env.PAYSTACK_SECRET_KEY;

        if (!secretKey) {
            return res.status(500).json({
                error: "PAYSTACK_SECRET_KEY is not configured"
            });
        }

        const response = await fetch(
            "https://api.paystack.co/transaction/initialize",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    amount: amountInCents,
                    ...(reference ? { reference } : {}),
                    ...(callback_url ? { callback_url } : {})
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.status) {
            return res.status(response.status || 400).json({
                error: data.message || "Unable to initialize payment"
            });
        }

        return res.status(200).json({
            status: true,
            message: data.message,
            data: data.data
        });

    } catch (error) {
        console.error("Payment initialization error:", error);

        return res.status(500).json({
            error: "Server error while initializing payment"
        });
    }
}
