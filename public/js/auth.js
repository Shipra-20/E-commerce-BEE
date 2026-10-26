(() => {
    const message = document.getElementById('form-message');
    function show(text, kind = 'error') { message.textContent = text; message.className = `form-message ${kind}`; }
    async function send(url, payload) {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        let data = {}; try { data = await response.json(); } catch { }
        if (!response.ok) throw new Error(data.message || data.error || 'Request failed. Please check your details.');
        return data;
    }
    function storeSession(data) {
        const token = data.token || data.accessToken || data.jwt || data.data?.token;
        const user = data.user || data.data?.user || { name: data.name || '' };
        if (token) { localStorage.setItem('velouraToken', token); localStorage.setItem('token', token); }
        if (user) { localStorage.setItem('velouraUser', JSON.stringify(user)); localStorage.setItem('user', JSON.stringify(user)); }
    }
    const login = document.getElementById('login-form');
    if (login) login.addEventListener('submit', async e => {
        e.preventDefault(); const button = login.querySelector('button'); button.disabled = true; button.firstChild.textContent = 'Signing you in… ';
        const form = new FormData(login);
        try { const data = await send('/api/auth/login', { email: form.get('email'), password: form.get('password') }); storeSession(data); show('You’re in. Taking you to the shop…', 'success'); setTimeout(() => location.href = 'index.html', 700); }
        catch (err) { show(err.message); } finally { button.disabled = false; button.firstChild.textContent = 'Log in to Veloura '; }
    });
    const signup = document.getElementById('signup-form');
    if (signup) signup.addEventListener('submit', async e => {
        e.preventDefault(); const button = signup.querySelector('button'); button.disabled = true; button.firstChild.textContent = 'Creating account… ';
        const form = new FormData(signup);
        try { const data = await send('/api/auth/signup', { name: form.get('name'), email: form.get('email'), password: form.get('password') }); storeSession(data); show('Account created. Taking you to the shop…', 'success'); setTimeout(() => location.href = 'index.html', 700); }
        catch (err) { show(err.message); } finally { button.disabled = false; button.firstChild.textContent = 'Create my account '; }
    });
})();