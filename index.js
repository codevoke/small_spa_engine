function S(selector) {
    return document.querySelector(selector);
}

function SS(selector) {
    return document.querySelectorAll(selector);
}

window.location.hash = '/'

function attr(elem, key) {
    return elem.getAttribute(key)
}

class RenderEngine {
    url = '/';
    route_urls = {};
    urls_titles = {};
    constructor(
        headerHandler,
        headerSelector = '#header',
        contentSelector = '#content',
        currentUrl = "/",
        urlNotFoundHandler = this.render_404,
        default_page_title = document.title
    ) {
        this.primaryTitle = default_page_title;
        this.url = currentUrl;
        this.headerHandler = headerHandler;
        this.urlNotFoundHandler = urlNotFoundHandler;
        this.defineHeader(headerSelector);
        this.defineContentBlock(contentSelector);
    }
    start () {
        this.navigate(this.url, true)
        this.RenderPageHrefs();
    }

    addUrl(url, handler, pageTitle=null) {
        url = this.urlHandler(url);
        this.route_urls[url] = handler;
        if (pageTitle !== null)
            this.urls_titles[url] = pageTitle;
    }

    createTitle(subtitle=null) {
        if (subtitle !== null)
            document.title = `${this.primaryTitle} | ${subtitle}`;
        else
            document.title = this.primaryTitle;
    }

    defineHeader(headerSelector) {
        this.header = S(headerSelector)
        if (this.header === null)
            throw new Error(`Header block not found by selector ${headerSelector}`)
    }

    defineContentBlock(contentSelector) {
        this.contentBlock = S(contentSelector)
        if (this.contentBlock === null)
            throw new Error(`Content block not found by selector ${contentSelector}`)
    }

    rerenderPage(render_header=false) {
        this.navigate(this.url, render_header)
    }
    rerenderElem(elemSelector, elemHandler) {
        let elem = S(elemSelector);

        let newElem = elemHandler();
        const elemParent = elem.parent;
        elemParent.replace(newElem, elem)
    }

    render_404() {
        console.warn(`Page ${this.url} handler not found!`);
        this.createTitle("Url not found");
        let h1 = document.createElement('h1');
        h1.innerText = "Router: 404, page not found";
        return h1
    }

    RenderPageHrefs() {
        for (let a of SS("a")) {
            a.addEventListener("click", event => {
                event.preventDefault();
                this.navigate(attr(a, "href"))
            })
        }
    }

    navigate(newUrl, render_header=false) {
        newUrl = this.urlHandler(newUrl);
        window.location.hash = newUrl;
        const routeHandler = this.route_urls[newUrl];
        this.render_header(newUrl);
        if (!routeHandler) {
            this.setContent(this.urlNotFoundHandler());
        } else {
            this.setContent(routeHandler());
        }
        if (render_header)
            this.render_header();
        this.RenderPageHrefs();
    }

    setContent(htmlElements) {
        this.clearContent();
        if (Array.isArray(htmlElements))
            for (let elem of htmlElements) {
                console.log(elem);
                this.contentBlock.append(elem);}
        else
            this.contentBlock.append(htmlElements);
    }

    clearContent() {
        this.contentBlock.innerHTML = null;
    }

    urlHandler(url) {
        switch (url[0]) {
            case '#':
                if (url[1] !== '/')
                    throw new Error("href in tag <a> must start from '#/' or '/'")
                break;
            case '/':
                url = `#${url}`
                break
            default:
                throw new Error("href in tag <a> must start from '#/' or '/'")
        }
        return url;
    }

    render_header() {
        if (this.headerHandler) {
            this.header.innerHTML = ''
            this.header.append(this.headerHandler())
        }
    }
}
