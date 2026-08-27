# {{ .Title }}

{{ with .Description }}{{ . }}{{ end }}
{{ with .RawContent }}
{{ . }}
{{ end }}
{{ range .Pages.ByDate.Reverse }}
## [{{ .Title }}]({{ .Permalink }})

{{ .Description | default (.Summary | plainify) }}
{{ end }}

---

[Home]({{ .Site.BaseURL }}) · [Sitemap]({{ "sitemap.xml" | absURL }})
