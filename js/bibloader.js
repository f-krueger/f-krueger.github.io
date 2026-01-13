/* --------------------------------------------------------------
   BIBTEX LOADER – ONLY FOR publications.html
   -------------------------------------------------------------- */

async function loadBibliography() {
    try {
        const resp = await fetch('references.bib');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const bibText = await resp.text();

        const entries = parseBibtex(bibText);
        renderPublications(entries);
    } catch (e) {
        console.error(e);
        const errHTML = `<div class="error-message">
            <p>Could not load bibliography: ${e.message}</p>
        </div>`;
        document.getElementById('journal-list').innerHTML = errHTML;
        document.getElementById('conference-list').innerHTML = errHTML;
    }
}

/* --------------------------------------------------------------
   Very small BibTeX parser (no external libs)
   -------------------------------------------------------------- */
function parseBibtex(bib) {
    const entries = [];
    const entryRe = /@(\w+)\s*\{([^,]+),([\s\S]*?)\}\s*(?=@|$)/g;
    let m;
    while ((m = entryRe.exec(bib)) !== null) {
        const type = m[1].toLowerCase();          // article, inproceedings, etc.
        const key  = m[2].trim();
        const body = m[3];

        const fields = {};
        const fieldRe = /(\w+)\s*=\s*\{([^}]*)\}\s*,?/g;
        let f;
        while ((f = fieldRe.exec(body)) !== null) {
            const name = f[1].toLowerCase();
            const val  = f[2].replace(/\s+/g, ' ').trim();
            fields[name] = val;
        }

        entries.push({type, key, ...fields});
    }
    return entries;
}

/* --------------------------------------------------------------
   Rendering helpers
   -------------------------------------------------------------- */
function formatAuthors(authors) {
    if (!authors) return '';
    const list = authors.split(/ and /i).map(a => a.trim());
    return list.length <= 3 ? list.join(', ') : `${list[0]} et al.`;
}
function formatDetails(e) {
    const parts = [];
    if (e.journal)   parts.push(`<em>${e.journal}</em>`);
    if (e.booktitle) parts.push(`<em>${e.booktitle}</em>`);
    if (e.volume)    parts.push(`Vol. ${e.volume}`);
    if (e.pages)     parts.push(`pp. ${e.pages}`);
    if (e.year)      parts.push(e.year);
    return parts.join(', ');
}
function pubHTML(e) {
    const authors = formatAuthors(e.author);
    const title   = e.title ? e.title.replace(/[{}]/g, '') : 'Untitled';
    const details = formatDetails(e);

    // You can add real URLs (e.g., e.doi, e.url) to the links if you store them in the .bib file.
    return `
    <div class="publication-item">
        <div class="pub-title"><h3>${title}</h3></div>
        <div class="pub-authors"><p>${authors}</p></div>
        <div class="pub-details"><p>${details}</p></div>
        <div class="pub-links">
            <a href="#" title="PDF"><i class="fas fa-file-pdf"></i> PDF</a>
            <a href="#" title="DOI"><i class="fas fa-link"></i> DOI</a>
            <a href="#" title="BibTeX"><i class="fas fa-quote-right"></i> BibTeX</a>
        </div>
    </div>`;
}

/* --------------------------------------------------------------
   Insert the publications into the page
   -------------------------------------------------------------- */
function renderPublications(entries) {
    const journalContainer = document.getElementById('journal-list');
    const confContainer    = document.getElementById('conference-list');

    const journals = entries.filter(e => e.type === 'article');
    const confs    = entries.filter(e => e.type === 'inproceedings');

    journalContainer.innerHTML = journals.map(pubHTML).join('');
    confContainer.innerHTML    = confs.map(pubHTML).join('');

    // Update the counters on the home page (if they exist)
    const total = entries.length;
    const totalJ = journals.length;
    const totalC = confs.length;
    if (document.getElementById('total-publications'))   document.getElementById('total-publications').textContent   = total;
    if (document.getElementById('total-journal-pubs'))  document.getElementById('total-journal-pubs').textContent  = totalJ;
    if (document.getElementById('total-conference-pubs')) document.getElementById('total-conference-pubs').textContent = totalC;
}

/* --------------------------------------------------------------
   Run the loader only on the publications page
   -------------------------------------------------------------- */
if (location.pathname.endsWith('publications.html')) {
    document.addEventListener('DOMContentLoaded', loadBibliography);
}