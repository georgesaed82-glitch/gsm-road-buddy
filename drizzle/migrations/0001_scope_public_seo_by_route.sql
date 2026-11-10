DROP POLICY "page_seo public read" ON public.page_seo;
CREATE POLICY "page_seo public read" ON public.page_seo
FOR SELECT TO anon, authenticated
USING (
  route = '/'
  OR route IN (
    '/about', '/services', '/pricing', '/reviews', '/contact', '/instructors',
    '/theory', '/areas', '/blog', '/downloads', '/faq', '/youtube', '/passes'
  )
  OR route LIKE '/areas/%'
  OR route LIKE '/blog/%'
  OR route LIKE '/legal/%'
);