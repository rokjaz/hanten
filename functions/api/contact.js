export async function onRequestPost({ request, env }) {
  try {
    const f = await request.formData();
    const clean = (v,n) => String(v || "").trim().slice(0,n);
    const name=clean(f.get("name"),100), email=clean(f.get("email"),200),
      category=clean(f.get("category"),50), message=clean(f.get("message"),5000),
      website=clean(f.get("website"),200);
    const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
    if (website) return json({ok:true});
    if (!name || !email || !category || !message) return json({error:"Please complete all fields."},400);
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return json({error:"Please enter a valid email address."},400);
    if (!env.CONTACT_TO || !env.CONTACT_FROM || !env.RESEND_API_KEY) return json({error:"Contact email is not configured yet."},503);
    const text=`Hanten contact form\n\nName: ${name}\nEmail: ${email}\nCategory: ${category}\n\n${message}`;
    const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({from:env.CONTACT_FROM,to:[env.CONTACT_TO],reply_to:email,subject:`[Hanten ${category}] Message from ${name}`,text})});
    if(!r.ok){console.error(await r.text());return json({error:"Message could not be sent. Please try again."},502);}
    return json({ok:true});
  } catch(e) {
    console.error(e);
    return new Response(JSON.stringify({error:"Message could not be sent. Please try again."}),{status:500,headers:{"content-type":"application/json"}});
  }
}