# {{ .Site.Params.author }}

I'm Igor Varyvoda. I build products — some for work, some because I can't help myself. Made in Ukraine. Based in Montenegro.

{{ .Site.Params.description }}

## Start here

- [About]({{ "about/" | absURL }})
- [Projects]({{ "projects/" | absURL }})
- [Writing]({{ "posts/" | absURL }})
- [Contact]({{ "contact/" | absURL }})

## Current project
{{ range first 1 (where (where .Site.RegularPages "Section" "projects") ".Params.hero" true) }}

### [{{ .Title }}]({{ .Permalink }})

{{ .Params.description }}
{{ end }}

## Recent writing
{{ range first 5 (where .Site.RegularPages "Type" "posts") }}

### [{{ .Title }}]({{ .Permalink }})

{{ .Description | default (.Summary | plainify) }}
{{ end }}

## Selected work
{{ range first 4 (where (where (where .Site.RegularPages "Section" "projects") ".Params.featured" true) ".Params.hero" "ne" true) }}

### [{{ .Title }}]({{ .Permalink }})

{{ .Params.description }}
{{ end }}

---

[Sitemap]({{ "sitemap.xml" | absURL }}) · [OpenAPI]({{ "openapi.json" | absURL }})
