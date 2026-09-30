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
      console.error("Stripe session lookup failed:", await stripeResponse.text());

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
      "H002",
      "H003",
      "H005",
      "H006",
      "H007",
      "H010",
      "H011",
      "H014",
      "H016"
    ]);

    if (
      selected.length !== 5 ||
      selected.some((id) => !allowedApruts.has(id))
    ) {
      return Response.json(
        { error: "Purchased APRUT selection could not be verified." },
        { status: 403 }
      );
    }

    return Response.json(
      {
        ok: true,
        session_id: session.id,
        email: session.customer_details?.email || "",
        selected
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

