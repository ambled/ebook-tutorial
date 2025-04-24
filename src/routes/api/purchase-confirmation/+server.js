import {json} from "@sveltejs/kit";
import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_API_KEY } from "$env/static/private";
import Stripe from "stripe";

sgMail.setApiKey(SENDGRID_API_KEY);
const stripe = new Stripe(STRIPE_API_KEY);

const PDF_GUIDE_URL = "https://narrify-public.s3.eu-central-1.amazonaws.com/sample.pdf";

export async function POST({request}) {

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    try {
        const stripeEvent = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
        const customerEmail = stripeEvent.data.object.customer_details.email;
        const customerName = stripeEvent.data.object.customer_details.name;
        const response = await fetch(PDF_GUIDE_URL);
        const pdfBuffer = await response.arrayBuffer();
        const base64Pdf = Buffer.from(pdfBuffer).toString('base64');



        const message = {
            to: customerEmail,
            from: "troy@weave.sh",
            subject: "Your Purchase Confirmation",
            html: `
            <h1>Thank you for your purchase!</h1>
            <p>Dear ${customerName},</p>
            <p>Thank you for your recent purchase. We appreciate your business!</p>
            <p>If you have any questions or need assistance, feel free to reach out to us.</p>
            <p>Best regards,</p>
            <p>The Weave Team</p>
            `,
            attachments: [
                {
                    content: base64Pdf,
                    filename: "Digial Ebook - Spain relocation.pdf",
                    type: "application/pdf",
                    disposition: "attachment",
                }
            ]
        }

        await sgMail.send(message);
        //console.log('Received request body:', requestBody);

        return json({ response: "Email sent" });
    } catch (err) {
        console.error("Error verifying Stripe webhook signature:", err);
        return json({ error: "Invalid signature" }, { status: 400 });
    }

    
}