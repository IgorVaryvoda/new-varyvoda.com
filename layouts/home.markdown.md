# {{ .Site.Params.author }}

I build products—and I keep them alive.

I'm Igor Varyvoda, a product builder and operator. I started with a profitable website that reached roughly 50,000 unique visitors a day, later ran developers and marketers across internet businesses, and now build Sirv Studio alongside a living portfolio of independent products.

## Current focus
{{ range first 1 (where (where .Site.RegularPages "Section" "projects") ".Params.hero" true) }}

### [{{ .Title }}]({{ .Permalink }})

{{ .Params.description }}
{{ end }}

## Five chapters
{{ range hugo.Data.career }}

- **{{ .phase }} — [{{ .title }}]({{ .url | absURL }})**: {{ .text }}
{{ end }}

## A living portfolio
{{ $projects := where .Site.RegularPages "Section" "projects" }}
{{ range first 4 (sort (where $projects ".Params.homepage_weight" "ne" nil) ".Params.homepage_weight") }}

### [{{ .Title }}]({{ .Permalink }})

{{ .Params.description }} Stewardship: {{ .Params.stewardship.state | humanize }}.
{{ end }}

## Recently tended
{{ range hugo.Data.care }}

- **[{{ .title }}]({{ printf "projects/%s/" .project | absURL }})**, {{ .date }} — {{ .change }}
{{ end }}

## Start here
{{ range hugo.Data.writing_start }}

### {{ .group }}
{{ range .items }}

- [{{ .title }}]({{ .url | absURL }}) — {{ .note }}
{{ end }}
{{ end }}

---

[About]({{ "about/" | absURL }}) · [Projects]({{ "projects/" | absURL }}) · [Writing]({{ "posts/" | absURL }}) · [Contact]({{ "contact/" | absURL }}) · [Sitemap]({{ "sitemap.xml" | absURL }}) · [OpenAPI]({{ "openapi.json" | absURL }})
