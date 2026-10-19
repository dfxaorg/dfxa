{{- partial "md/service" . }}
---

{{ T "disclaimer" }}

{{ T "md_source" }}: <{{ .Permalink }}>{{ with .Lastmod }}{{ if not .IsZero }} · {{ T "last_updated" }}: {{ .Format "2006-01-02" }}{{ end }}{{ end }}
