export async function onRequestPost({ request, env }) {
  try {
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_5_PACK) {
      return json({ error: "Stripe checkout is not configured." }, 503);
    }

    const body = await request.json().catch(() => ({}));

    const selected = Array.isArray(body.selected)
      ? body.selected
          .map((item) => String(item).trim())
          .filter(Boolean)
      : [];

    if (selected.length !== 5) {
      return json({ error: "Please select exactly 5 APRUTs." }, 400);
    }

    const params = new URLSearchParams();

    params.set("mode", "payment");
    params.set("line_items[0][price]", env.STRIPE_PRICE_5_PACK);
    params.set("line_items[0][quantity]", "1");

    params.set(
      "success_url",
      `${new URL(request.url).origin}/use/classroom/?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    );

    params.set(
      "cancel_url",
      `${new URL(request.url).origin}/use/classroom/?checkout=cancelled`
    );

    params.set("metadata[selected_apruts]", selected.join(","));

    const response = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      }
    );

    const session = await response.json();

    if (!response.ok) {
      console.error("Stripe Checkout error:", session);
      return json(
        { error: "Checkout could not be created." },
        502
      );
    }

    return json({
      url: session.url
    });
  } catch (error) {
    console.error("Create checkout session error:", error);

    return json(
      { error: "Checkout could not be created." },
      500
    );
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
