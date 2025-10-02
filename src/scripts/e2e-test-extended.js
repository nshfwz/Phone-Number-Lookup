// Extended end-to-end test: patch a contact and verify update
(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/contacts');
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 1) {
      throw new Error('No contacts to patch');
    }

    const first = data[0];
    const patchRes = await fetch(`http://localhost:3000/api/contacts/${first.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: (first.city || 'UpdatedCity') })
    });
    if (!patchRes.ok) throw new Error('PATCH test failed');
    const patched = await patchRes.json();
    console.log('e2e-extended: patched city ->', patched.city);

    const verify = await fetch(`http://localhost:3000/api/contacts/${first.id}`);
    const verified = await verify.json();
    console.log('e2e-extended: verify city ->', verified.city);
  } catch (err) {
    console.error('e2e-extended test failed', err);
    process.exit(1);
  }
})();
