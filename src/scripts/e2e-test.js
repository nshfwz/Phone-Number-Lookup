// Enhanced end-to-end test for API
(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/contacts');
    const data = await res.json();
    const ok = Array.isArray(data) && data.length >= 3;
    console.log('e2e-test: contacts count =', data.length, 'OK=', ok);
    if (!Array.isArray(data) || data.length < 3) {
      throw new Error('Insufficient contacts');
    }

    // verify required fields exist for each contact
    const requiredFields = ['id', 'name', 'phone', 'country', 'address'];
    for (const c of data) {
      for (const f of requiredFields) {
        if (!(f in c)) throw new Error(`Missing field ${f} in contact ${c?.id ?? ''}`);
      }
    }

    // fetch by id for the first item to verify GET by id works
    const first = data[0];
    const byIdRes = await fetch(`http://localhost:3000/api/contacts/${first.id}`);
    if (!byIdRes.ok) throw new Error('GET by id failed');
    const byId = await byIdRes.json();
    console.log('e2e-test: byId matches', byId?.id === first.id ? 'true' : 'false');
  } catch (err) {
    console.error('e2e-test failed', err);
    process.exit(1);
  }
})();
