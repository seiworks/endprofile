const baseUrl = String(process.argv[2] || process.env.ENDPROFILE_URL || '').replace(/\/$/, '');

if (!baseUrl.startsWith('https://')) {
    console.error('Usage: node scripts/verify-deployment.mjs https://your-domain.example');
    process.exit(1);
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

const health = await fetch(`${baseUrl}/api/health`, { redirect: 'error' });
assert(health.status === 200, `Health check returned ${health.status}`);
const healthBody = await health.json();
assert(healthBody.status === 'ok' && healthBody.database === 'connected', 'Database is not ready');
assert(health.headers.has('strict-transport-security'), 'HSTS header is missing');
assert(health.headers.get('x-content-type-options') === 'nosniff', 'nosniff header is missing');

const home = await fetch(baseUrl, { redirect: 'error' });
assert(home.status === 200, `Frontend returned ${home.status}`);
assert((home.headers.get('content-type') || '').includes('text/html'), 'Frontend did not return HTML');
assert(home.headers.has('content-security-policy'), 'Content-Security-Policy header is missing');

const rejectedOrigin = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://attacker.invalid' },
});
assert(rejectedOrigin.status === 403, `Untrusted Origin returned ${rejectedOrigin.status}, expected 403`);
assert(!rejectedOrigin.headers.has('access-control-allow-origin'), 'Untrusted Origin received a CORS allow header');

console.log(`Deployment verification passed: ${baseUrl}`);
