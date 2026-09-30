export async function onRequestGet({ request, env }) {
  try {
    if (!env.STRIPE_SECRET_KEY) {
      return Response.json(
        { error: "Stripe is not configured." },
        { status: 503 }
      );
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return Response.json(
        { error: "Invalid checkout session." },
        { status: 400 }
      );
    }

    const stripeResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`
        }
      }
    );

    if (!stripeResponse.ok) {
      console.error(
        "Stripe session lookup failed:",
        await stripeResponse.text()
      );

      return Response.json(
        { error: "Checkout could not be verified." },
        { status: 502 }
      );
    }

    const session = await stripeResponse.json();

    if (session.payment_status !== "paid") {
      return Response.json(
        { error: "Payment has not been completed." },
        { status: 403 }
      );
    }

    const selected = String(session.metadata?.selected_apruts || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

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
      new Set(selected).size !== selected.length ||
      selected.some((id) => !allowedApruts.has(id))
    ) {
      return Response.json(
        { error: "Purchased APRUT selection could not be verified." },
        { status: 403 }
      );
    }

    const expectedAmount = priceFor(selected.length) * 100;

    if (session.amount_total !== expectedAmount) {
      return Response.json(
        { error: "Purchase amount could not be verified." },
        { status: 403 }
      );
    }

    return Response.json(
      {
        ok: true,
        session_id: session.id,
        email: session.customer_details?.email || "",
        selected,
        amount: expectedAmount / 100
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error("Checkout verification error:", error);

    return Response.json(
      { error: "Checkout could not be verified." },
      { status: 500 }
    );
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
