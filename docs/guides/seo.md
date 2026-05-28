---
id: seo
title: "4.3 SEO"
sidebar_label: "• SEO"
sidebar_position: 3
---

## SEO Considerations

WP Pillar covers two very different scenarios when it comes to SEO, and it is important to understand which one your plugin falls into.

---

### Scenario A — Admin-only plugins (no public frontend output)

If your plugin lives entirely inside the WordPress admin dashboard — managing data, showing reports, handling workflows — then SEO is not relevant to the plugin itself. The admin dashboard is never indexed by search engines, is not accessible to non-logged-in users, and is not part of any public-facing URL structure.

The only SEO work needed for an admin-only plugin is:

**WordPress.org plugin directory listing:** The plugin's `readme.txt` file controls how it appears in search results within the WordPress.org directory. A well-written `readme.txt` with a clear description, accurate tags, proper sections (Description, Installation, FAQ, Changelog), and a good plugin name is the full extent of SEO needed.

**Your own documentation site:** If you publish public documentation (for example, using Docusaurus on GitHub Pages), standard static site SEO applies — proper `<title>` tags, meta descriptions, clean URLs, a sitemap. Docusaurus handles all of this automatically.

---

### Scenario B — Plugins with public frontend output

Some plugins built on WP Pillar may render output on public-facing WordPress pages — shortcodes, widgets, Gutenberg blocks, or custom post type archives. In this case, SEO becomes a real concern and the plugin must handle it correctly.

**Server-side rendering for public content.**

Search engine crawlers (including Googlebot) do not reliably execute JavaScript. If your plugin outputs content via a Vue or React component that fetches data from the REST API after page load, that content will be invisible to search engines.

The rule is simple: **anything that needs to be indexed must be rendered in PHP on the server**, not assembled in JavaScript on the client.

For public-facing output, WP Pillar's `View.php` renderer handles this — your PHP controller prepares the data and renders it as HTML before the page is sent to the browser:

```php
// Controller rendering public-facing content server-side
public function renderPublicWidget(array $atts): string
{
    $items = Item::where('status', 'published')
        ->orderByDesc('created_at')
        ->limit(10)
        ->get();

    return View::render('widgets/item-list', ['items' => $items]);
}

// Shortcode registration
add_shortcode('myplugin_items', [$this, 'renderPublicWidget']);
```

Vue or React can still be used on public pages for interactive enhancements (filtering, sorting, loading more results) as long as the initial content load is server-rendered.

**Open Graph and meta tags.**

If your plugin creates public pages or post types, add Open Graph meta tags so the content previews correctly when shared on social media:

```php
add_action('wp_head', function() {
    if (!is_singular('myplugin_item')) return;

    $item = Item::find(get_the_ID());
    if (!$item) return;

    echo '<meta property="og:title"   content="' . esc_attr($item->title) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr($item->excerpt) . '">' . "\n";
    echo '<meta property="og:type"    content="article">' . "\n";
    echo '<meta property="og:url"     content="' . esc_url(get_permalink()) . '">' . "\n";
});
```

**Structured data (Schema.org).**

For plugins that output content types with clear semantic meaning — products, events, reviews, FAQs, recipes — add JSON-LD structured data. This helps search engines understand the content and can generate rich results in search:

```php
add_action('wp_head', function() {
    if (!is_singular('myplugin_event')) return;

    $event = Event::find(get_the_ID());
    if (!$event) return;

    $schema = [
        '@context' => 'https://schema.org',
        '@type'    => 'Event',
        'name'     => $event->title,
        'startDate'=> $event->start_date,
        'location' => ['@type' => 'Place', 'name' => $event->location],
    ];

    echo '<script type="application/ld+json">'
        . wp_json_encode($schema)
        . '</script>' . "\n";
});
```

**Canonical URLs.**

If your plugin creates content accessible at multiple URLs (for example, through both a shortcode page and a custom post type archive), set canonical URLs to avoid duplicate content penalties:

```php
add_action('wp_head', function() {
    if (!is_singular('myplugin_item')) return;
    echo '<link rel="canonical" href="' . esc_url(get_permalink()) . '">' . "\n";
});
```

**Sitemap integration.**

If your plugin creates a custom post type or custom URLs that should be indexed, register them with WordPress's built-in sitemap (WordPress 5.5+):

```php
add_filter('wp_sitemaps_post_types', function($post_types) {
    $post_types['myplugin_item'] = get_post_type_object('myplugin_item');
    return $post_types;
});
```

For custom URLs not tied to a post type, use the `wp_sitemaps_add_provider` filter to register a custom sitemap provider.

**Page speed for public output.**

When a plugin renders on public pages, its assets affect the site's Core Web Vitals scores. Follow these rules:

- Only enqueue plugin CSS and JS on pages where the plugin actually outputs something — use conditional checks (`is_singular()`, `has_shortcode()`, `is_post_type_archive()`)
- Load non-critical JavaScript with `defer` or `async`
- Avoid render-blocking CSS for above-the-fold content
- Use `wp_enqueue_style()` with a `media` attribute for print-only or mobile-only styles

```php
// Only load plugin assets where needed
add_action('wp_enqueue_scripts', function() {
    if (!is_singular() || !has_shortcode(get_post()->post_content, 'myplugin_items')) {
        return;
    }
    wp_enqueue_style('myplugin-public',  plugin_dir_url(FILE) . 'assets/css/public.css');
    wp_enqueue_script('myplugin-public', plugin_dir_url(FILE) . 'assets/js/public.js', [], VERSION, true);
});
```
