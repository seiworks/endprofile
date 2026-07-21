const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.FRONTEND_ORIGIN = 'https://endprofile.example.com';

const { app } = require('../server');

async function run() {
    const server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
        let response = await fetch(`${baseUrl}/api/health`);
        assert.equal(response.status, 503);
        assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
        assert.ok(response.headers.has('content-security-policy'));
        assert.deepEqual(await response.json(), { status: 'unavailable', database: 'disconnected' });

        response = await fetch(`${baseUrl}/api/health`, {
            headers: { Origin: 'https://attacker.invalid' },
        });
        assert.equal(response.status, 403);
        assert.equal(response.headers.get('access-control-allow-origin'), null);

        response = await fetch(`${baseUrl}/api/health`, {
            headers: { Origin: 'https://endprofile.example.com' },
        });
        assert.equal(response.status, 503);
        assert.equal(response.headers.get('access-control-allow-origin'), 'https://endprofile.example.com');
        assert.equal(response.headers.get('access-control-allow-credentials'), 'true');

        response = await fetch(`${baseUrl}/api/health`, {
            headers: { Origin: 'http://localhost:5179' },
        });
        assert.equal(response.status, 503);
        assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5179');

        console.log('HTTP security smoke check passed');
    } finally {
        await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
