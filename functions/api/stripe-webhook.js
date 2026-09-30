const encoder = new TextEncoder();

function safeEqual(a, b) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifyStripeSignature(payload, header, secret) {
  const parts = header.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signatures = parts
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));

  if (!timestampPart || signatures.length === 0) return false;

  const timestamp = timestampPart.slice(2);
  const signedPayload = `${timestamp}.${payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );

  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return signatures.some((signature) => safeEqual(signature, expected));
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      return new Response("Webhook secret is not configured.", {
        status: 503
      });
    }

    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing Stripe signature.", {
        status: 400
      });
    }

    const payload = await request.text();

    const valid = await verifyStripeSignature(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    if (!valid) {
      return new Response("Invalid Stripe signature.", {
        status: 400
      });
    }

    const event = JSON.parse(payload);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log(
        "Hanten checkout completed:",
        session.id,
        session.customer_details?.email || ""
      );

      // Fulfillment will be added after the webhook test succeeds.
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return new Response("Webhook error.", {
      status: 500
    });
  }
}
