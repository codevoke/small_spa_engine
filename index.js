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

    constructor(
        currentUrl = "/",
        urlNotFoundHandler = this.render_404,
        headerHandler = null,
        contentSelector = '#content',
        headerSelector = '#header'
    ) {
        this.url = currentUrl;
        this.headerHandler = headerHandler;
        this.urlNotFoundHandler = urlNotFoundHandler;
        this.defineHeader(headerSelector)
        this.defineContentBlock(contentSelector);
    }

    addUrl(url, handler) {
        this.route_urls[url] = handler;
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

    render_404() {
        let h1 = document.createElement('h1')
        h1.innerText = "Router: 404, page not found"
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
        const routeHandler = this.route_urls.get(newUrl);
        if (!routeHandler) {
            this.setContent(this.urlNotFoundHandler());
        } else {
            this.setContent(routeHandler);
        }
        if (render_header)
            this.render_header();
        this.RenderPageHrefs();
    }

    setContent(htmlElement) {
        this.clearContent();
        this.contentBlock.append(htmlElement);
    }

    clearContent() {
        this.contentBlock.innerHTML = '';
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
