const worker = {
  async scheduled(_controller, env) {
    if (!env.CRON_SECRET) {
      throw new Error('CRON_SECRET is not configured in Cloudflare.');
    }

    const response = await fetch(env.CRON_TARGET_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
    });

    if (!response.ok) {
      const details = (await response.text()).slice(0, 500);
      throw new Error(`Match reminder endpoint returned ${response.status}: ${details}`);
    }

    console.log('Match reminder cron completed:', await response.text());
  },
};

export default worker;
