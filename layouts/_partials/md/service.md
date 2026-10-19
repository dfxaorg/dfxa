{{- /* Markdown body of a service page (used by the Markdown alternate and
       llms-full.txt). Context: service term page. */ -}}
{{- $s := . -}}
# {{ $s.Title }}

{{ with $s.Params.domain }}{{ T "service_domain" }}: {{ partial "term-title.html" (dict "taxonomy" "domains" "key" .) }}

{{ end -}}
{{ $s.RawContent | strings.TrimSpace }}
{{ with $s.Params.typical_audiences }}
## {{ T "service_audiences" }}

{{ range . }}- {{ partial "term-title.html" (dict "taxonomy" "audiences" "key" .) }}
{{ end }}{{ end }}
{{- with $s.Params.result }}
## {{ T "service_result" }}

{{ . }}
{{ end }}
## {{ T "service_experts" }}

{{ T "service_experts_intro" }}

{{ range partial "sorted-experts.html" $s.Pages -}}
{{- $name := partial "expert-name.html" . -}}
- [{{ .Title }}]({{ .Permalink }}){{ with partial "court-fields.html" . }} – {{ T "card_court_fields" }}: {{ delimit . ", " }}{{ end }}. {{ T "md_email" }}: {{ site.Params.contactEmail }} ({{ T "md_contact_subject" }}: {{ T "contact_subject_expert_service" (dict "Name" $name "Service" $s.LinkTitle) }})
{{ end }}
{{ T "contact_note" }}
{{ with $s.Params.faq }}
## {{ T "service_faq" }}
{{ range . }}
### {{ .question }}

{{ .answer }}
{{ end }}{{ end -}}
