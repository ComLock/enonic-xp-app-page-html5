import {
    doctype, html, head, title, body, div, render
} from 'render-js/dist/html';
import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
//import {dlv} from '/lib/util/object';
import {
    getContent as getCurrentContent,
    getSiteConfig as getCurrentSiteConfig
} from '/lib/xp/portal';

export function get(req) {
    log.debug(toStr({req}));
    const siteConfig = getCurrentSiteConfig(); log.debug(toStr({siteConfig}));
    const content = getCurrentContent(); log.debug(toStr({content}));
    const {displayName} = content;
    const pageConfig = content.page.config; log.debug(toStr({pageConfig}));
    const bodyStyleAttribute = siteConfig.bodyStyleAttribute || pageConfig.bodyStyleAttribute; log.debug(toStr({bodyStyleAttribute}));
    const {components} = content.page.regions.body; log.debug(toStr({components}));
    return {
        body: render([
            doctype(),
            html([
                head(title(displayName)),
                body({
                    style: bodyStyleAttribute
                        ? forceArray(bodyStyleAttribute)
                            .map((h) => h.value ? `${h.property}:${h.value}` : h.property) // eslint-disable-line no-confusing-arrow
                            .join(';')
                        : null
                }, div(
                    {
                        dataPortalRegion: req.mode === 'edit' ? 'body' : null
                    },
                    (components && components.length)
                        ? components.map((c) => `<!--# COMPONENT ${c.path} -->`)
                        : ''
                )) // body
            ]) // html
        ]), // render
        contentType: 'text/html; charset=utf-8'
    };
}
