export async function onRequestPost({ request, env }) {
  try {
    if (!env.STRIPE_SECRET_KEY) {
      return json({ error: "Stripe checkout is not configured." }, 503);
    }

    const body = await request.json().catch(() => ({}));

    const selected = Array.isArray(body.selected)
      ? [...new Set(
          body.selected
            .map((item) => String(item).trim())
            .filter(Boolean)
        )]
      : [];

    const allowedApruts = new Set([
      "A001","A002","A003","A004","A005","A006","A007",
      "A010","A011","A014","A016","A017","A018","A020",
      "A021","A023","A027","A028","A033","A036","A037",
      "A038","A041","A042","A043","A045","A046","A047",
      "A048","A049","A054","A055","A056","A057","A058",
      "A059","A060","A061","A062","A063","A064","A065",
      "A066","A067","A068"
    ]);

    if (
      selected.length < 1 ||
      selected.length > 15 ||
      selected.some((id) => !allowedApruts.has(id))
    ) {
      return json({ error: "Invalid APRUT selection." }, 400);
    }

    const totalDollars = priceFor(selected.length);
    const totalCents = totalDollars * 100;

    const params = new URLSearchParams();

    params.set("mode", "payment");
    params.set("managed_payments[enabled]", "false");
    params.set("line_items[0][price_data][currency]", "usd");
    params.set(
      "line_items[0][price_data][product_data][name]",
      `Hanten Classroom — ${selected.length} APRUT${selected.length === 1 ? "" : "s"}`
    );
    params.set(
      "line_items[0][price_data][product_data][description]",
      selected.join(", ")
    );
    params.set(
      "line_items[0][price_data][unit_amount]",
      String(totalCents)
    );
    params.set("line_items[0][quantity]", "1");

    const origin = new URL(request.url).origin;

    params.set(
      "success_url",
      `${origin}/use/classroom/?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    );

    params.set(
      "cancel_url",
      `${origin}/use/classroom/?checkout=cancelled`
    );

    params.set("metadata[selected_apruts]", selected.join(","));
    params.set("metadata[aprut_count]", String(selected.length));
    params.set("metadata[amount_dollars]", String(totalDollars));

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

    return json({ url: session.url });
  } catch (error) {
    console.error("Create checkout session error:", error);
    return json({ error: "Checkout could not be created." }, 500);
  }
}

function priceFor(n) {
  if (n >= 11) return 25;

  const singlesOnly = n * 3;
  const packsAndSingles =
    Math.floor(n / 5) * 12 +
    (n % 5) * 3;

  return Math.min(singlesOnly, packsAndSingles);
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
