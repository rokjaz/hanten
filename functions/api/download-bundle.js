const encoder = new TextEncoder();

export async function onRequestGet({ request, env }) {
  try {
    if (!env.STRIPE_SECRET_KEY || !env.APRUTS) {
      return new Response("Download service is not configured.", { status: 503 });
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return new Response("Invalid checkout session.", { status: 400 });
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
      return new Response("Purchase could not be verified.", { status: 502 });
    }

    const session = await stripeResponse.json();

    if (session.payment_status !== "paid") {
      return new Response("Payment has not been completed.", { status: 403 });
    }

    const purchased = String(session.metadata?.selected_apruts || "")
      .split(",")
      .map(id => id.trim())
      .filter(Boolean);

    if (
      purchased.length < 1 ||
      purchased.length > 15 ||
      new Set(purchased).size !== purchased.length
    ) {
      return new Response("Purchase could not be verified.", { status: 403 });
    }

    const expectedAmount = priceFor(purchased.length) * 100;

    if (session.amount_total !== expectedAmount) {
      return new Response("Purchase amount could not be verified.", { status: 403 });
    }

    const files = [];

    for (const aprut of purchased) {
      const listed = await env.APRUTS.list({
        prefix: `completed/${aprut}_`,
        limit: 2
      });

      if (!listed.objects.length) {
        return new Response(`${aprut} file not found.`, { status: 404 });
      }

      const key = listed.objects[0].key;
      const object = await env.APRUTS.get(key);

      if (!object) {
        return new Response(`${aprut} file not found.`, { status: 404 });
      }

      const data = new Uint8Array(await object.arrayBuffer());

      files.push({
        name: key.split("/").pop(),
        data
      });
    }

    const zip = makeZip(files);

    const packName =
      purchased.length === 1
        ? `${purchased[0]}_Hanten_APRUT.zip`
        : `Hanten_${purchased.length}_APRUT_Pack.zip`;

    return new Response(zip, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${packName}"`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    console.error("APRUT bundle download error:", error);

    return new Response("Bundle download could not be completed.", {
      status: 500
    });
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

function crc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;

    for (let k = 0; k < 8; k++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function u16(n) {
  return new Uint8Array([
    n & 255,
    (n >>> 8) & 255
  ]);
}

function u32(n) {
  return new Uint8Array([
    n & 255,
    (n >>> 8) & 255,
    (n >>> 16) & 255,
    (n >>> 24) & 255
  ]);
}

function join(chunks) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(length);

  let offset = 0;

  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }

  return out;
}

function makeZip(files) {
  const localChunks = [];
  const centralChunks = [];

  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;

    const localHeader = join([
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(size),
      u32(size),
      u16(name.length),
      u16(0),
      name
    ]);

    localChunks.push(localHeader, file.data);

    const centralHeader = join([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(size),
      u32(size),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name
    ]);

    centralChunks.push(centralHeader);

    offset += localHeader.length + size;
  }

  const central = join(centralChunks);

  const end = join([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(central.length),
    u32(offset),
    u16(0)
  ]);

  return join([
    ...localChunks,
    central,
    end
  ]);
}
