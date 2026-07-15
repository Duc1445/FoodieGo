fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'customer1@foodiego.com',
    password: 'Password123!',
  }),
  headers: { 'Content-Type': 'application/json' },
})
  .then(async (res) => {
    const data = await res.json();
    const token = data.data?.token;
    if (!token) return console.log('Login failed', data);
    const valRes = await fetch('http://localhost:3000/api/v1/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({
        code: 'WELCOME50',
        orderValue: 150000,
        restaurantId: null,
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(valRes.status, await valRes.text());
  })
  .catch((err) => console.error(err));
