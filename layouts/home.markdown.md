# {{ .Site.Params.author }}

I'm Igor Varyvoda. I run Sirv Studio, and I build my own apps when I have an idea I cannot ignore.

## Current focus
{{ range first 1 (where (where .Site.RegularPages "Section" "projects") ".Params.hero" true) }}

### [{{ .Title }}]({{ .Permalink }})

{{ .Params.description }}
{{ end }}

## How I got here
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

- [{{ .title }}]({{ .url | absURL }}){{ with .description }} — {{ . }}{{ end }}
{{ end }}
{{ end }}

---

[About]({{ "about/" | absURL }}) · [Projects]({{ "projects/" | absURL }}) · [Writing]({{ "posts/" | absURL }}) · [Contact]({{ "contact/" | absURL }}) · [Sitemap]({{ "sitemap.xml" | absURL }}) · [OpenAPI]({{ "openapi.json" | absURL }})
