function renderInnerHtml(template, view) {
    var rendered = Mustache.render(template.html(), view);
    template.html(rendered);
}