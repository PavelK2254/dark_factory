# Scrum landing page

A single static HTML page that introduces Scrum to non-experts in two to five minutes.

- Source: `index.html` (zero build, no JavaScript, all CSS and the diagram are inline).
- Hosting: any static host — open the file directly, or serve `site/scrum/` from GitHub Pages, Netlify, or similar.

## Local preview

Either open `index.html` in a browser, or serve the folder over HTTP:

```bash
python3 -m http.server --directory site/scrum 8080
# then visit http://localhost:8080/
```

## Maintenance

Content lives in well-marked sections inside `index.html` (`#what`, `#when`, `#roles`, `#events`,
`#artifacts`, `#sprint`, `#myths`, `#faq`). When the [Scrum Guide](https://scrumguides.org/) changes,
update the relevant section text and the `<time>` element in the footer.
