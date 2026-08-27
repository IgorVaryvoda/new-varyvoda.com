# {{ .Title }}

{{ with .Description }}{{ . }}
{{ end }}{{ if eq .File.BaseFileName "contact" }}
Want to ask about one of my projects, discuss advertising, or just get in touch?

[Open the contact form]({{ .Params.form_url }}) or find me on [GitHub](https://github.com/igorvaryvoda/), [LinkedIn](https://www.linkedin.com/in/igorvaryvoda/), or [Twitter](https://twitter.com/igorvaryvoda).
{{ else }}
{{ .RawContent }}
{{ end }}

---

[Canonical HTML]({{ with .Params.canonicalUrl }}{{ . }}{{ else }}{{ .Permalink }}{{ end }}) · [Sitemap]({{ "sitemap.xml" | absURL }})
