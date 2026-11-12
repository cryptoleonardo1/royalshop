-- Featured products ("Odporúčame" on the home page and first in the default sort), 2026-11-12:
-- three Makita machines instead of the Gölz FS170. Data only, safe to re-run.
-- Applied on hosted 2026-11-12. The same list lives in scripts/import-makita.ts (FEATURED) and
-- catalog.json (golz-fs170 is_featured = false), so a later seed or import gives the same result.
-- Featured machines of brands that are not shown (NTC, Bomag, Honda, Enar) are left as they are:
-- decide about them when those brands go live.
update products set is_featured = false where slug = 'golz-fs170';
update products set is_featured = true where slug in ('makita-tw001gu201', 'makita-duc254z', 'makita-dhg180zk');
