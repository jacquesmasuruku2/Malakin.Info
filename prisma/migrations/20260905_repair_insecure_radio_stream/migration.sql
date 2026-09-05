UPDATE "RadioStation"
SET "streamUrl" = 'https://as-hls-ww.live.cf.md.bbci.co.uk/pool_07364996/live/ww/bbc_world_service_news_internet/bbc_world_service_news_internet.isml/bbc_world_service_news_internet-audio%3d48000.norewind.m3u8',
    "name" = CASE WHEN "name" = 'RFI Afrique' THEN 'BBC World Service' ELSE "name" END,
    "description" = CASE WHEN "name" = 'RFI Afrique' THEN 'Flux radio BBC par défaut' ELSE "description" END
WHERE "isActive" = true AND "streamUrl" LIKE 'http://%';