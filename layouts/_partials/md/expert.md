{{- /* Markdown body of an expert profile (used by the Markdown alternate and
       llms-full.txt). Context: expert page. */ -}}
{{- $p := . -}}
{{- $name := partial "expert-name.html" $p -}}
# {{ $p.Title }}

{{ delimit (partial "profile-intro.html" $p) " " }}

{{ $p.RawContent | strings.TrimSpace }}
{{ with $p.GetTerms "services" }}
## {{ T "profile_services" }}

{{ range sort . "LinkTitle" }}- [{{ .LinkTitle }}]({{ .Permalink }})
{{ end }}{{ end }}
{{- with $p.Params.court_certification }}
## {{ T "profile_court_certification" }}

{{ strings.FirstUpper $p.Params.role }}

- {{ T "profile_cert_list_number" }}: {{ .list_number }}
{{- with .group }}
- {{ T "profile_cert_group" }} {{ . }}
{{- end }}
{{- range .fields }}
- {{ with .number }}{{ . }} {{ end }}{{ .name }}{{ with .restriction }}, {{ T "court_field_restriction" (dict "Restriction" .) }}{{ end }}{{ with .certified_until }} – {{ T "court_field_certified_until" (dict "Date" (time.Format ":date_long" .)) }}{{ end }}
{{- end }}
- {{ T "profile_cert_link" }}: <{{ .url }}>
{{ end }}
{{- with $p.Params.other_certifications }}
## {{ T "profile_other_certifications" }}

{{ range . }}- {{ .name }}{{ with .issuer }} – {{ . }}{{ end }}
{{ end }}{{ end }}
## {{ T "profile_contact" }}

- {{ T "md_email" }}: {{ site.Params.contactEmail }} ({{ T "md_contact_subject" }}: {{ T "contact_subject_expert" (dict "Name" $name) }})
{{- with $p.Params.email }}
- {{ T "profile_own_email" }}: {{ . }}
{{- end }}
{{- with $p.Params.phone }}
- {{ T "profile_phone" }}: {{ . }}
{{- end }}
{{- with $p.Params.website }}
- {{ T "profile_website" }}: <{{ . }}>
{{- end }}

{{ T "contact_note" }}
