# {{ .Title }}

{{ with .Description }}{{ . }}
{{ end }}{{ if eq .File.BaseFileName "contact" }}
Discuss a product or leadership role, collaborate on something difficult, report a problem with maintained software, or ask me something else.

[Open the contact form]({{ .Params.form_url }}), email [{{ .Params.email }}](mailto:{{ .Params.email }}), or find me on [GitHub](https://github.com/igorvaryvoda/) and [LinkedIn](https://www.linkedin.com/in/igorvaryvoda/).
{{ else }}
{{ .RawContent }}
{{ end }}

---

[Canonical HTML]({{ with .Params.canonicalUrl }}{{ . }}{{ else }}{{ .Permalink }}{{ end }}) · [Sitemap]({{ "sitemap.xml" | absURL }})
