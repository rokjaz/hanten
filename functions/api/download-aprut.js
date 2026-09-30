export async function onRequestGet({ request, env }) {
  try {
    if (!env.STRIPE_SECRET_KEY || !env.APRUTS) {
      return new Response("Download service is not configured.", {
        status: 503
      });
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");
    const aprut = String(url.searchParams.get("aprut") || "")
      .trim()
      .toUpperCase();

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return new Response("Invalid checkout session.", {
        status: 400
      });
    }

    if (!/^A\d{3}$/.test(aprut)) {
      return new Response("Invalid APRUT.", {
        status: 400
      });
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
      return new Response("Purchase could not be verified.", {
        status: 502
      });
    }

    const session = await stripeResponse.json();

    if (session.payment_status !== "paid") {
      return new Response("Payment has not been completed.", {
        status: 403
      });
    }

    const purchased = String(
      session.metadata?.selected_apruts || ""
    )
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!purchased.includes(aprut)) {
      return new Response(
        "This APRUT was not included in this purchase.",
        { status: 403 }
      );
    }

    const listed = await env.APRUTS.list({
      prefix: `completed/${aprut}_`,
      limit: 2
    });

    if (!listed.objects.length) {
      return new Response("APRUT file not found.", {
        status: 404
      });
    }

    const key = listed.objects[0].key;
    const object = await env.APRUTS.get(key);

    if (!object) {
      return new Response("APRUT file not found.", {
        status: 404
      });
    }

    const filename = key.split("/").pop();

    const headers = new Headers();
    object.writeHttpMetadata(headers);

    headers.set(
      "Content-Type",
      "text/html; charset=utf-8"
    );

    headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    headers.set(
      "Cache-Control",
      "private, no-store"
    );

    return new Response(object.body, {
      headers
    });
  } catch (error) {
    console.error("APRUT download error:", error);

    return new Response("Download could not be completed.", {
      status: 500
    });
  }
}
